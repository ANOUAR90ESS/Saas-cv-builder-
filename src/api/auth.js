// The seam for everything to do with accounts, matching src/api/backend.js.
//
// Nothing outside this file knows which service holds the sessions. The names
// below are the ones the pages already used, so the swap underneath them was a
// change here rather than a rewrite of six forms.
//
// Worth knowing while reading the app: an account is optional. CVs are stored
// in the browser, the AI needs no session, and nothing in the interface links
// to the sign-in pages. They exist, they work, and they are reached only by
// visiting the route — the groundwork for syncing between devices, whenever
// that is wanted.
import { supabase } from "@/api/supabase";

/** Where the provider sends the browser back after an external sign-in. */
function returnUrl(path = "/") {
  return new URL(path, window.location.origin).toString();
}

/**
 * Normalises Supabase's `{ data, error }` into a thrown Error, so the pages
 * can keep the try/catch they already had.
 */
function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------- session

/** The signed-in user, or null. Never throws for "nobody is signed in". */
export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

/**
 * Calls back whenever the session changes — a sign-in finishing, a token
 * refreshing, a sign-out in another tab. Returns an unsubscribe function.
 */
export function onAuthChange(fn) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    fn(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------- sign in

export async function signInWithPassword(email, password) {
  return unwrap(await supabase.auth.signInWithPassword({ email, password }));
}

/**
 * Hands off to the provider. This navigates away, so nothing after it runs.
 * On Android the browser returns through the App Link in AndroidManifest.xml,
 * which the shell forwards to the page — see src/main.jsx.
 */
export async function signInWithGoogle(returnTo = "/") {
  return unwrap(await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: returnUrl(returnTo) },
  }));
}

// ---------------------------------------------------------------- sign up

/** Creates the account. A confirmation code is emailed; see `verifyEmail`. */
export async function register(email, password) {
  return unwrap(await supabase.auth.signUp({ email, password }));
}

/** Confirms the address with the emailed code, which also signs the user in. */
export async function verifyEmail(email, token) {
  return unwrap(await supabase.auth.verifyOtp({ email, token, type: "email" }));
}

export async function resendVerification(email) {
  return unwrap(await supabase.auth.resend({ type: "signup", email }));
}

// ---------------------------------------------------------------- recovery

/** Emails a link that signs the user in long enough to set a new password. */
export async function requestPasswordReset(email) {
  return unwrap(await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: returnUrl("/reset-password"),
  }));
}

/**
 * Sets a new password for whoever the current session belongs to — either
 * someone who followed a recovery link, or someone already signed in.
 */
export async function setPassword(newPassword) {
  return unwrap(await supabase.auth.updateUser({ password: newPassword }));
}

/**
 * Changes the password, checking the current one first.
 *
 * Supabase's updateUser does not ask for the old password, so a borrowed
 * unlocked laptop would be enough to lock the owner out of their own account.
 * Signing in again with the old password is what turns that into a check.
 */
export async function changePassword(email, currentPassword, newPassword) {
  unwrap(await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  }));
  return setPassword(newPassword);
}

// ---------------------------------------------------------------- profile

/** Stores the display name on the user's own metadata. */
export async function updateProfile({ full_name }) {
  return unwrap(await supabase.auth.updateUser({ data: { full_name } }));
}
