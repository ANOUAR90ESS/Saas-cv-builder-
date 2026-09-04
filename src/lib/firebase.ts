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

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Firebase's own failure here is "auth/invalid-api-key" at the first
  // sign-in, which sends people looking in the wrong place.
  console.error(
    'Firebase is not configured: VITE_FIREBASE_API_KEY and ' +
      'VITE_FIREBASE_PROJECT_ID are missing. Copy .env.example to .env.local ' +
      'and fill them in. Sign-in and Firestore will fail until you do.'
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore is loaded on demand, not at boot. It is by far the heaviest thing
// this app imports — around 500 KB of the entry chunk, 130 KB of it over the
// wire — and nothing on the first screen touches it. Only signing in and the
// CV sync do, both well after the app is interactive, so pulling it eagerly
// meant every visitor waited on a splash screen for a database they may never
// use. Memoised, so the second caller gets the first one's instance.
let dbPromise: Promise<Firestore> | null = null;

export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = import('firebase/firestore').then(({ getFirestore }) =>
      firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app)
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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
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
