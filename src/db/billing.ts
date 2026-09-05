import { randomUUID } from 'node:crypto';
import { and, desc, eq, gt, isNull, or } from 'drizzle-orm';
import { db } from './index.ts';
import { purchases, subscriptions, paddleEvents, users } from './schema.ts';

/**
 * Whether the caller may export a file, and why.
 *
 * One question with two answers, which is the whole design: a subscription
 * says yes for as long as it is paid for, a purchase says yes once. Callers
 * never ask "is this person subscribed" -- that would push the two models out
 * into every call site, and adding a third would mean touching all of them.
 */
export type Entitlement = {
  canExport: boolean;
  /** 'subscription' | 'purchase' | 'none' */
  via: 'subscription' | 'purchase' | 'none';
  /** Unspent one-time purchases, for the "1 download left" line in the UI. */
  credits: number;
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

const NONE: Entitlement = { canExport: false, via: 'none', credits: 0, subscription: null };

/** An active subscription: paid up, or cancelled but still inside the period. */
function activeSubscriptionWhere(userId: number) {
  return and(
    eq(subscriptions.userId, userId),
    or(
      eq(subscriptions.status, 'active'),
      eq(subscriptions.status, 'trialing'),
      // A cancellation at period end leaves status 'canceled' while access
      // runs on. The date decides, not the word.
      gt(subscriptions.currentPeriodEnd, new Date())
    )
  );
}

/**
 * What this caller is entitled to.
 *
 * `userId` is null for a signed-out visitor, who can still hold purchases
 * through claim tokens the browser kept.
 */
export async function getEntitlement(
  userId: number | null,
  claimTokens: string[] = []
): Promise<Entitlement> {
  let subscription: Entitlement['subscription'] = null;

  if (userId != null) {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(activeSubscriptionWhere(userId))
      .orderBy(desc(subscriptions.currentPeriodEnd))
      .limit(1);

    if (rows[0]) {
      subscription = {
        status: rows[0].status,
        currentPeriodEnd: rows[0].currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: rows[0].cancelAtPeriodEnd,
      };
    }
  }

  const credits = await countCredits(userId, claimTokens);

  if (subscription) {
    return { canExport: true, via: 'subscription', credits, subscription };
  }
  if (credits > 0) {
    return { canExport: true, via: 'purchase', credits, subscription: null };
  }
  return { ...NONE, credits: 0 };
}

/** Unspent purchases, whether held by the account or by a browser's tokens. */
async function countCredits(userId: number | null, claimTokens: string[]): Promise<number> {
  const owners = [];
  if (userId != null) owners.push(eq(purchases.userId, userId));
  for (const token of claimTokens.slice(0, 20)) {
    if (token) owners.push(eq(purchases.claimToken, token));
  }
  if (!owners.length) return 0;

  const rows = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.status, 'completed'), isNull(purchases.consumedAt), or(...owners)));

  return rows.length;
}

/**
 * Spends one purchase, if that is what is paying for this export.
 *
 * A subscriber consumes nothing. The update is conditional on consumedAt
 * still being null and reports how many rows it changed, so two exports fired
 * at once cannot both spend the same purchase.
 */
export async function consumeCredit(
  userId: number | null,
  claimTokens: string[] = []
): Promise<boolean> {
  const owners = [];
  if (userId != null) owners.push(eq(purchases.userId, userId));
  for (const token of claimTokens.slice(0, 20)) {
    if (token) owners.push(eq(purchases.claimToken, token));
  }
  if (!owners.length) return false;

  const candidate = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.status, 'completed'), isNull(purchases.consumedAt), or(...owners)))
    .orderBy(purchases.createdAt)
    .limit(1);

  if (!candidate[0]) return false;

  const updated = await db
    .update(purchases)
    .set({ consumedAt: new Date() })
    .where(and(eq(purchases.id, candidate[0].id), isNull(purchases.consumedAt)))
    .returning({ id: purchases.id });

  return updated.length > 0;
}

/**
 * Records a completed one-time purchase and returns the claim token the
 * browser must keep.
 *
 * Idempotent on Paddle's transaction id: a retried webhook returns the token
 * already issued rather than granting a second export.
 */
export async function recordPurchase(input: {
  transactionId: string;
  email: string | null;
  amount: number | null;
  currency: string | null;
  userId: number | null;
}): Promise<string | null> {
  const existing = await db
    .select()
    .from(purchases)
    .where(eq(purchases.transactionId, input.transactionId))
    .limit(1);
  if (existing[0]) return existing[0].claimToken;

  const claimToken = input.userId == null ? randomUUID() : null;
  await db
    .insert(purchases)
    .values({
      transactionId: input.transactionId,
      userId: input.userId,
      claimToken,
      email: input.email,
      amount: input.amount,
      currency: input.currency,
      status: 'completed',
    })
    .onConflictDoNothing({ target: purchases.transactionId });

  return claimToken;
}

/** Creates or updates a subscription from a Paddle event. */
export async function upsertSubscription(input: {
  subscriptionId: string;
  userId: number;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
}) {
  await db
    .insert(subscriptions)
    .values({ ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: subscriptions.subscriptionId,
      set: {
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        priceId: input.priceId,
        updatedAt: new Date(),
      },
    });
}

/**
 * Records that an event was seen. False means it was already recorded, so the
 * caller should not act on it again -- Paddle retries until acknowledged.
 */
export async function markEventSeen(
  eventId: string,
  eventType: string,
  payload: unknown
): Promise<boolean> {
  const inserted = await db
    .insert(paddleEvents)
    .values({ eventId, eventType, payload: payload as any })
    .onConflictDoNothing({ target: paddleEvents.eventId })
    .returning({ eventId: paddleEvents.eventId });
  return inserted.length > 0;
}

/**
 * The claim token for a transaction the buyer just completed.
 *
 * A guest purchase is recorded by the webhook, which goes to the server -- the
 * browser is never told the token that proves it owns the purchase. Paddle
 * does hand the buyer's own browser the transaction id, so that is what it
 * trades in for the token.
 *
 * The id is unguessable and Paddle gives it only to the buyer, so it works as
 * a bearer proof. It is deliberately narrow: only an unconsumed purchase with
 * no account attached returns anything, so a leaked id is worthless once the
 * download is spent or the purchase belongs to someone.
 */
export async function claimTokenForTransaction(transactionId: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.transactionId, transactionId),
        isNull(purchases.userId),
        isNull(purchases.consumedAt)
      )
    )
    .limit(1);
  return rows[0]?.claimToken ?? null;
}

/** Attaches guest purchases to an account, so signing in keeps what was bought. */
export async function claimPurchases(userId: number, claimTokens: string[]): Promise<number> {
  let claimed = 0;
  for (const token of claimTokens.slice(0, 20)) {
    if (!token) continue;
    const rows = await db
      .update(purchases)
      .set({ userId, claimToken: null })
      .where(and(eq(purchases.claimToken, token), isNull(purchases.userId)))
      .returning({ id: purchases.id });
    claimed += rows.length;
  }
  return claimed;
}

export { users };
