import { Request, Response, NextFunction } from 'express';

// Guards for the AI routes, which have no sign-in in front of them.
//
// That is deliberate: the app is usable without an account, and putting a
// login in front of "improve this sentence" would undo the point of it. The
// cost of that trade is that these two routes spend money on a paid API for
// anyone who finds the URL, and until now nothing stood between the two. The
// repository even carried a rate-limiting migration for the old Supabase
// functions, written for exactly this reason and never wired to anything.
//
// Three guards, because no one of them is sufficient:
//
//   Origin      stops another site putting the endpoints behind its own UI.
//               The browser enforces it, so it is real protection against
//               that, and none at all against a script that sets any header
//               it likes. It is not the volume defence.
//   Rate limit  is the volume defence: a fixed window per address.
//   Size cap    bounds a single call, since cost scales with input length
//               and one enormous body is cheap to send and expensive to
//               answer.

const ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

const LIMIT = Number(process.env.AI_RATE_LIMIT || 30);
const WINDOW_MS = Number(process.env.AI_RATE_WINDOW_MINUTES || 10) * 60_000;
const MAX_BODY_BYTES = Number(process.env.AI_MAX_BODY_KB || 64) * 1024;

if (!ORIGINS.length) {
  console.warn(
    '[ai-guard] ALLOWED_ORIGINS is not set, so any site may call the AI ' +
      'routes from a browser. Set it to your origin(s) in production.'
  );
}

/**
 * Fixed windows in process memory.
 *
 * Postgres would survive a restart and be shared across instances, and the
 * unused migration argues for exactly that. It is not used here because this
 * server already runs the AI routes without a database — they answer for
 * visitors who have no account and no rows — and making a spend guard depend
 * on a connection that may not exist means choosing between failing open,
 * which guards nothing, and failing closed, which takes the feature down for
 * everyone when the database blinks.
 *
 * The limitation is real and worth stating plainly: behind more than one
 * instance the effective limit is per instance, and a restart clears the
 * counters. It bounds accidental and casual abuse, not a determined attacker
 * with a pool of addresses.
 */
type Window = { start: number; hits: number };
const windows = new Map<string, Window>();

function sweep(now: number) {
  for (const [key, w] of windows) {
    if (now - w.start > WINDOW_MS) windows.delete(key);
  }
}

/** Records one hit and reports whether the caller is still under the limit. */
function underLimit(key: string): boolean {
  const now = Date.now();
  // Cheap amortised cleanup, so the map cannot grow without bound.
  if (windows.size > 5000) sweep(now);

  const current = windows.get(key);
  if (!current || now - current.start >= WINDOW_MS) {
    windows.set(key, { start: now, hits: 1 });
    return true;
  }
  current.hits += 1;
  return current.hits <= LIMIT;
}

/** The caller's address, honouring the proxy header only when Express trusts it. */
function callerKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * True when the request came from a page this same server served.
 *
 * Always allowed, whatever ALLOWED_ORIGINS says, and the reason is worth
 * stating: the check exists to stop *another* site putting these endpoints
 * behind its own UI. A same-origin call is this app calling itself, which is
 * never that. Without this the allowlist is a loaded gun aimed at production
 * -- set it to the apex while users arrive on www, or forget a Vercel preview
 * domain, and the AI answers 403 for real visitors while every log looks
 * healthy. Verified the hard way: with ALLOWED_ORIGINS pointing at the live
 * domain, the app's own fetch was refused.
 *
 * Safe because a browser sets Origin itself and a page cannot forge it.
 */
function isSameOrigin(req: Request, origin: string): boolean {
  const host = req.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function originAllowed(req: Request): boolean {
  const origin = req.get('origin');
  // No Origin at all: a native shell, a server, curl. Nothing to check
  // against, and rejecting it would break the Android app without stopping
  // any script, which can simply omit the header too.
  if (!origin) return true;
  if (isSameOrigin(req, origin)) return true;
  if (!ORIGINS.length) return true;
  return ORIGINS.includes(origin.replace(/\/$/, ''));
}

/** Adds the CORS headers the allowed origins need, including for preflight. */
export function aiCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('origin');
  if (origin && originAllowed(req)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

export function aiGuard(req: Request, res: Response, next: NextFunction) {
  if (!originAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }

  const declared = Number(req.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request too large.' });
  }

  if (!underLimit(callerKey(req))) {
    const retryAfter = Math.ceil(WINDOW_MS / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too many AI requests. Please wait a few minutes and try again.',
    });
  }

  next();
}
