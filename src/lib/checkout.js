// Opening Paddle's checkout, for both things the app sells.
//
// The one-time price is what the site advertises and needs no account. The
// subscription is offered only inside the app, and it does need one: being
// subscribed has to mean something on a second device, and a guest has no
// identity that survives one.
import { auth } from "@/lib/firebase";
import { addClaimToken } from "@/lib/serverExport";

let configPromise = null;
let paddlePromise = null;

/** What the server says about billing. Cached: it cannot change without a deploy. */
export function getBillingConfig() {
  if (!configPromise) {
    configPromise = fetch("/api/billing/config")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return configPromise;
}

async function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = (async () => {
      const config = await getBillingConfig();
      if (!config?.configured || !config.clientToken) return null;
      // Loaded on demand: most visits never reach a checkout, and this is a
      // third-party script.
      const { initializePaddle } = await import("@paddle/paddle-js");
      return initializePaddle({
        token: config.clientToken,
        environment: config.environment === "production" ? "production" : "sandbox",
      });
    })().catch((error) => {
      console.error("Paddle failed to initialise:", error);
      paddlePromise = null;
      return null;
    });
  }
  return paddlePromise;
}

export class BillingUnavailableError extends Error {
  constructor(message) {
    super(message || "Checkout is unavailable right now.");
    this.name = "BillingUnavailableError";
  }
}

export class SignInRequiredError extends Error {
  constructor() {
    super("Sign in to subscribe");
    this.name = "SignInRequiredError";
  }
}

/**
 * Opens a checkout and resolves once it closes.
 *
 * `completed` says the payment succeeded, not that the entitlement exists yet:
 * Paddle's webhook is what grants it, and it arrives on its own schedule. The
 * caller polls rather than assuming.
 */
function openCheckout(paddle, options) {
  return new Promise((resolve) => {
    paddle.Checkout.open({
      ...options,
      settings: { displayMode: "overlay", theme: "light", ...(options.settings || {}) },
      eventCallback: (event) => {
        if (event?.name === "checkout.completed") {
          // The transaction id is how a guest browser later finds the purchase
          // the webhook recorded for it.
          resolve({ completed: true, transactionId: event?.data?.transaction_id || null });
        }
        if (event?.name === "checkout.closed") resolve({ completed: false });
      },
    });
  });
}

/** Buys a single export. No account needed. */
export async function buyOneExport() {
  const config = await getBillingConfig();
  const paddle = await getPaddle();
  if (!paddle || !config?.priceIdOneTime) {
    throw new BillingUnavailableError();
  }
  const user = auth?.currentUser;
  return openCheckout(paddle, {
    items: [{ priceId: config.priceIdOneTime, quantity: 1 }],
    ...(user?.email ? { customer: { email: user.email } } : {}),
    // Passed straight through to the webhook, which is the only thing that
    // grants anything. A guest sends none and gets a claim token instead.
    customData: user ? { uid: user.uid, email: user.email || "" } : undefined,
  });
}

/** Starts the in-app subscription. Requires an account, by nature. */
export async function subscribe() {
  const config = await getBillingConfig();
  const paddle = await getPaddle();
  if (!paddle || !config?.priceIdSubscription) {
    throw new BillingUnavailableError();
  }
  const user = auth?.currentUser;
  if (!user) {
    // Not a policy choice: without a uid the webhook has no one to attach the
    // subscription to, and it would be paid for and belong to nobody.
    throw new SignInRequiredError();
  }
  return openCheckout(paddle, {
    items: [{ priceId: config.priceIdSubscription, quantity: 1 }],
    customer: { email: user.email || "" },
    customData: { uid: user.uid, email: user.email || "" },
  });
}

/**
 * Waits for the webhook to land, then reports the entitlement.
 *
 * Paddle tells the browser the payment succeeded before it has told the server
 * anything: the confirmation and the webhook are separate deliveries. That
 * leaves a gap of a second or two where the customer has paid and the app
 * would still refuse them, and polling is what closes it. Ten tries at just
 * over a second is long enough for a webhook that is coming and short enough
 * that a failed one does not leave someone staring at a spinner.
 *
 * A guest also has to find out which purchase is theirs, which is what the
 * transaction id is traded for.
 */
export async function waitForEntitlement(transactionId, { tries = 10, intervalMs = 1200 } = {}) {
  const { fetchEntitlement } = await import("@/lib/serverExport");

  for (let i = 0; i < tries; i++) {
    if (transactionId && !auth?.currentUser) {
      const token = await fetch("/api/billing/claim-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((b) => b?.claimToken)
        .catch(() => null);
      // Stored the moment it exists: if the tab closes now, the purchase is
      // still findable on the next visit.
      if (token) addClaimToken(token);
    }

    const entitlement = await fetchEntitlement().catch(() => null);
    if (entitlement?.canExport) return entitlement;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}
