/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Firebase's web config is public by design: it identifies the project and
// grants nothing on its own, and it is compiled into the bundle either way.
// It is read from the environment rather than a JSON file so that a fresh
// clone and a CI build need no untracked file on disk -- see .env.example.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Optional: a named Firestore database. Blank means the project default, and
// getFirestore rejects an explicit undefined, so the argument is only passed
// when there is one.
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

// Initialising must not be able to take the app down, and this is not a
// hypothetical: initializeApp with a missing key throws auth/invalid-api-key
// at module load, and because cvStorage reaches this file, every chunk that
// touches it died with it. The builder, saved projects, sign-in and the
// account page all rendered a blank white screen while the home page and the
// template gallery -- the two that never touch Firebase -- looked perfectly
// fine. Nothing said what was wrong.
//
// So a missing config now disables sign-in and cloud sync and nothing else.
// That is the honest behaviour for an app whose whole premise is that it
// works without an account: the CV lives in localStorage, the builder needs
// no session, and none of it should depend on an auth service being reachable
// or even configured.
let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let firebaseAuth: ReturnType<typeof getAuth> | null = null;

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    'Firebase is not configured (VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID ' +
      'are missing), so sign-in and cloud sync are switched off. Everything else ' +
      'works: CVs are stored on this device. See .env.example.'
  );
} else {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
  } catch (error) {
    console.error(
      'Firebase failed to initialise, so sign-in and cloud sync are switched off. ' +
        'Everything else works.',
      error
    );
    firebaseApp = null;
    firebaseAuth = null;
  }
}

export const app = firebaseApp;

/**
 * Firebase Auth, or null when this deployment has no Firebase.
 *
 * Null rather than a stub on purpose: a stub that quietly answers "nobody is
 * signed in" reads the same as a working service with no user, and the
 * difference matters to anything deciding whether to offer sign-in at all.
 * Every reader uses `auth?.currentUser`.
 */
export const auth = firebaseAuth;

/** Whether accounts are available here at all. */
export const isAuthConfigured = Boolean(firebaseAuth);

// Firestore is loaded on demand, not at boot. It is by far the heaviest thing
// this app imports — around 500 KB of the entry chunk, 130 KB of it over the
// wire — and nothing on the first screen touches it. Only signing in and the
// CV sync do, both well after the app is interactive, so pulling it eagerly
// meant every visitor waited on a splash screen for a database they may never
// use. Memoised, so the second caller gets the first one's instance.
let dbPromise: Promise<Firestore> | null = null;

export function getDb(): Promise<Firestore> {
  if (!firebaseApp) {
    return Promise.reject(new Error('Firebase is not configured; cloud sync is unavailable.'));
  }
  if (!dbPromise) {
    const initialised = firebaseApp;
    dbPromise = import('firebase/firestore').then(({ getFirestore }) =>
      firestoreDatabaseId ? getFirestore(initialised, firestoreDatabaseId) : getFirestore(initialised)
    );
  }
  return dbPromise;
}
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Firestore plus the module's own functions, both loaded on demand.
 *
 * getDb() alone was not enough: a caller still needed `doc`, `setDoc` and the
 * rest, and importing those at the top of a module pulls the whole SDK into
 * that module's chunk. That is how 167 kB of Firestore ended up loading on the
 * builder page for visitors who were not even signed in. Callers take both
 * from here, inside the function that needs them and after the signed-in
 * check, so a signed-out visitor never fetches any of it.
 */
export function getFirestoreApi(): Promise<{
  db: Firestore;
  fs: typeof import('firebase/firestore');
}> {
  return Promise.all([getDb(), import('firebase/firestore')]).then(([db, fs]) => ({ db, fs }));
}
