// The seam for everything to do with accounts, matching src/api/backend.js.
// Powered completely by Firebase Auth and Firestore.
import { auth, googleAuthProvider, db, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  updateProfile as fbUpdateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/** Format a user from Firebase */
function formatFirebaseUser(user) {
  if (!user) return null;
  return {
    id: user.uid,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    full_name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
    photoURL: user.photoURL,
    provider: "firebase",
    user_metadata: {
      full_name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
    },
  };
}

/** Friendly error parsing for Firebase Auth error codes */
function cleanAuthError(err) {
  if (!err) return "An error occurred";
  const code = err.code || "";
  if (code === "auth/email-already-in-use") return "This email is already registered. Please log in.";
  if (code === "auth/invalid-email") return "Please enter a valid email address.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "Invalid email or password.";
  if (code === "auth/user-not-found") return "No account found with this email.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was closed before completing.";
  if (code === "auth/popup-blocked") return "Popup blocked by browser. Please allow popups.";
  return err.message || "Authentication failed";
}

// ---------------------------------------------------------------- session

/** The signed-in user, or null. Never throws for "nobody is signed in". */
export async function currentUser() {
  if (!isFirebaseConfigured) return null;
  if (auth.currentUser) {
    return formatFirebaseUser(auth.currentUser);
  }
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(formatFirebaseUser(user));
    });
  });
}

/**
 * Calls back whenever the session changes — a sign-in finishing, a token
 * refreshing, a sign-out in another tab. Returns an unsubscribe function.
 */
export function onAuthChange(fn) {
  if (!isFirebaseConfigured) {
    fn(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (fbUser) => {
    fn(formatFirebaseUser(fbUser));
  });
}

export async function signOut() {
  if (!isFirebaseConfigured) return;
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn("Firebase sign out warning:", err);
  }
}

// ---------------------------------------------------------------- sign in

export async function signInWithPassword(email, password) {
  if (!isFirebaseConfigured) {
    throw new Error("Accounts are not configured in this environment.");
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return formatFirebaseUser(result.user);
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

/**
 * Hands off to Google sign-in using Firebase Auth popup.
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error("Accounts are not configured in this environment.");
  }
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;
    if (fbUser) {
      try {
        await setDoc(
          doc(db, "users", fbUser.uid),
          {
            id: fbUser.uid,
            email: fbUser.email || "",
            displayName: (fbUser.displayName || "").slice(0, 120),
            photoURL: (fbUser.photoURL || "").slice(0, 500),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore profile sync warning:", e);
      }
      return formatFirebaseUser(fbUser);
    }
  } catch (fbErr) {
    console.warn("Firebase Google sign-in failed or closed:", fbErr);
    throw new Error(cleanAuthError(fbErr));
  }
}

// ---------------------------------------------------------------- sign up

/** Creates the account via Firebase Auth. */
export async function register(email, password) {
  if (!isFirebaseConfigured) {
    throw new Error("Accounts are not configured in this environment.");
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;
    if (fbUser) {
      try {
        await setDoc(
          doc(db, "users", fbUser.uid),
          {
            id: fbUser.uid,
            email: fbUser.email || "",
            displayName: (fbUser.displayName || "").slice(0, 120),
            photoURL: (fbUser.photoURL || "").slice(0, 500),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore profile sync warning:", e);
      }
      return formatFirebaseUser(fbUser);
    }
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

/** Confirms email (if required) */
export async function verifyEmail() {
  return true;
}

export async function resendVerification() {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      console.warn("Failed to resend verification:", err);
    }
  }
  return true;
}

// ---------------------------------------------------------------- recovery

/** Emails a link to reset password via Firebase Auth. */
export async function requestPasswordReset(email) {
  if (!isFirebaseConfigured) {
    throw new Error("Accounts are not configured in this environment.");
  }
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

/**
 * Sets a new password for whoever the current session belongs to.
 */
export async function setPassword(newPassword) {
  if (!auth.currentUser) {
    throw new Error("No active user session");
  }
  try {
    await fbUpdatePassword(auth.currentUser, newPassword);
    return true;
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

/**
 * Changes the password, re-authenticating with the current password first.
 */
export async function changePassword(email, currentPassword, newPassword) {
  if (!auth.currentUser) {
    throw new Error("No active user session");
  }
  try {
    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await fbUpdatePassword(auth.currentUser, newPassword);
    return true;
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

// ---------------------------------------------------------------- profile

/** Stores the display name on the user's profile. */
export async function updateProfile({ full_name }) {
  if (!auth.currentUser) {
    throw new Error("No active user session");
  }
  try {
    await fbUpdateProfile(auth.currentUser, { displayName: full_name });
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        displayName: full_name,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return formatFirebaseUser(auth.currentUser);
  } catch (err) {
    throw new Error(cleanAuthError(err));
  }
}

