import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Server side, so process.env rather than import.meta.env. The VITE_ prefixed
// name is accepted as a fallback because the project id is the same value on
// both sides of the wire and is not a secret.
const projectId =
  process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

/** True when the server has what it needs to verify ID tokens. */
export const isAdminConfigured = Boolean(projectId);

let cached: Auth | null = null;

/**
 * The Admin SDK's Auth, initialised on first use.
 *
 * Deliberately lazy. Only the routes behind `requireAuth` need this, and the
 * AI routes are usable without an account by design — so a missing project id
 * must not stop the whole server from booting. It used to: the project id came
 * from a gitignored JSON file, and without that file the import itself failed
 * and nothing served at all. Callers check `isAdminConfigured` and answer 503.
 */
export function getAdminAuth(): Auth {
  if (!projectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID is not set; cannot verify ID tokens. See ENVIRONMENT.md.'
    );
  }
  if (!cached) {
    if (!getApps().length) initializeApp({ projectId });
    cached = getAuth();
  }
  return cached;
}
