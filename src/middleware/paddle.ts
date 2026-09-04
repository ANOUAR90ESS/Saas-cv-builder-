import { Paddle, Environment } from '@paddle/paddle-node-sdk';

// Paddle rather than Stripe directly, for one reason that is not technical:
// Paddle is the merchant of record. It collects and remits EU VAT on digital
// sales by the buyer's country, which a raw payment processor leaves to the
// seller. Selling a 0.99 EUR download across the EU without that is a tax
// problem, not a code problem.

const API_KEY = process.env.PADDLE_API_KEY;
const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

/** Sandbox unless explicitly told otherwise, so a misconfiguration cannot charge anyone. */
const ENVIRONMENT =
  process.env.PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox;

export const paddleConfig = {
  /** The one-time export purchase. */
  priceIdOneTime: process.env.PADDLE_PRICE_ONE_TIME || '',
  /** The in-app subscription. Not advertised on the marketing pages. */
  priceIdSubscription: process.env.PADDLE_PRICE_SUBSCRIPTION || '',
  clientToken: process.env.PADDLE_CLIENT_TOKEN || '',
  environment: ENVIRONMENT === Environment.production ? 'production' : 'sandbox',
};

/** True when the server can actually talk to Paddle and verify its webhooks. */
export const isBillingConfigured = Boolean(API_KEY && WEBHOOK_SECRET);

let client: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!API_KEY) {
    throw new Error('PADDLE_API_KEY is not set; billing is unavailable.');
  }
  if (!client) client = new Paddle(API_KEY, { environment: ENVIRONMENT });
  return client;
}

/**
 * Whether these bytes really came from Paddle.
 *
 * Deliberately separate from parsing. Conflating the two is a quiet way to
 * lose money: `unmarshal` both checks the signature and builds a typed event,
 * so a genuine notification the SDK cannot model throws exactly like a forged
 * one. Reporting that as a bad signature answers 400, Paddle treats 400 as
 * delivered, and a real payment is dropped with a log line calling it an
 * attack. Authenticity and comprehension are different questions and get
 * different answers: 400 for the first, 500 for the second, so Paddle retries
 * the ones worth retrying.
 *
 * The raw body is required, because the signature covers the exact bytes
 * Paddle sent and JSON.parse followed by JSON.stringify does not reproduce
 * them. That is why server.ts mounts a raw parser on this route before
 * express.json.
 */
export async function isAuthenticWebhook(
  rawBody: string,
  signature: string | undefined
): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return false;
  try {
    return await getPaddle().webhooks.isSignatureValid(rawBody, WEBHOOK_SECRET, signature);
  } catch (error) {
    // A malformed signature header lands here, which is a failed check.
    console.error('[paddle] signature check failed:', error);
    return false;
  }
}

/**
 * The parsed event. Throws if the SDK cannot model it, which the caller turns
 * into a 500 so Paddle retries rather than dropping a real notification.
 */
export async function parseWebhook(rawBody: string, signature: string) {
  if (!WEBHOOK_SECRET) throw new Error('PADDLE_WEBHOOK_SECRET is not set.');
  return getPaddle().webhooks.unmarshal(rawBody, WEBHOOK_SECRET, signature);
}
