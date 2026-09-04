import { relations } from 'drizzle-orm';
import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'cvs' table with a foreign key to 'users'.
export const cvs = pgTable('cvs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull().default('Untitled CV'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Paddle sells two things and they answer the same question differently.
//
// A one-time purchase grants one export and is consumed by it. It needs no
// account: the app works signed out by design, so a purchase is tied to the
// Paddle transaction and handed back to the browser as a token.
//
// A subscription grants unlimited exports while it is active, and it cannot
// work without an account -- being subscribed has to mean something on a
// second device, and only a signed-in user has an identity that survives one.
// That is why the subscription is offered inside the app rather than on the
// marketing pages.
//
// Both are written only by the Paddle webhook. Nothing the browser sends is
// trusted here: a client that could grant itself an entitlement is not a
// paywall.
export const purchases = pgTable(
  'purchases',
  {
    id: serial('id').primaryKey(),
    // Paddle's transaction id. The natural idempotency key: Paddle retries a
    // webhook until it is acknowledged, and without a unique index those
    // retries would each grant another export.
    transactionId: text('transaction_id').notNull().unique(),
    // Null for a guest purchase, which is the common case.
    userId: integer('user_id').references(() => users.id),
    // The unguessable secret the browser keeps and presents to spend this
    // purchase. Null once a user id is known, since then the account is the
    // claim.
    claimToken: text('claim_token'),
    email: text('email'),
    // Minor units and currency exactly as Paddle reported them, so what was
    // charged can always be reconstructed without calling the API back.
    amount: integer('amount'),
    currency: text('currency'),
    status: text('status').notNull().default('completed'),
    consumedAt: timestamp('consumed_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => ({
    claimTokenIdx: uniqueIndex('purchases_claim_token_idx').on(t.claimToken),
    userIdx: index('purchases_user_idx').on(t.userId),
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: serial('id').primaryKey(),
    subscriptionId: text('subscription_id').notNull().unique(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    // Paddle's own status string, stored verbatim rather than mapped to a
    // boolean: 'past_due' and 'paused' are not 'canceled', and flattening them
    // early loses the distinction the billing page needs.
    status: text('status').notNull(),
    // Access runs to the end of a paid period even after cancellation, so
    // entitlement is decided by this date and not by status alone.
    currentPeriodEnd: timestamp('current_period_end'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    priceId: text('price_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => ({
    userIdx: index('subscriptions_user_idx').on(t.userId),
  })
);

// Every webhook Paddle has delivered, recorded before it is acted on. Two
// reasons: Paddle retries, and a replayed event must be a no-op; and when a
// customer says they paid and the app disagrees, this is the only record of
// what actually arrived.
export const paddleEvents = pgTable('paddle_events', {
  eventId: text('event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload'),
  receivedAt: timestamp('received_at').defaultNow(),
});

// Define relationships for the 'users' table.
export const usersRelations = relations(users, ({ many }) => ({
  cvs: many(cvs),
  purchases: many(purchases),
  subscriptions: many(subscriptions),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

// Define relationships for the 'cvs' table.
export const cvsRelations = relations(cvs, ({ one }) => ({
  author: one(users, {
    fields: [cvs.userId],
    references: [users.id],
  }),
}));
