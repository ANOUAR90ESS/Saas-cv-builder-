import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Firebase's web config is public by design: it identifies the project and
// grants nothing on its own, and it is compiled into the bundle either way.
// It is read from the environment rather than a JSON file so that a fresh
// clone and a CI build need no untracked file on disk -- see .env.example.
const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  rawApiKey &&
    rawProjectId &&
    rawApiKey.trim() !== '' &&
    rawProjectId.trim() !== '' &&
    rawProjectId !== 'your-project'
);

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? rawApiKey : 'placeholder-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: isFirebaseConfigured ? rawProjectId : 'placeholder-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Optional: a named Firestore database. Blank means the project default, and
// getFirestore rejects an explicit undefined, so the argument is only passed
// when there is one.
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

if (!isFirebaseConfigured) {
  // DexaCV works completely without an account by design (CVs live in localStorage).
  // Inform without throwing an unhandled runtime exception.
  console.warn(
    'Firebase is not configured: VITE_FIREBASE_API_KEY and ' +
      'VITE_FIREBASE_PROJECT_ID are missing or placeholder. Copy .env.example to .env.local ' +
      'and fill them in. Sign-in and cloud Firestore sync will remain disabled until configured.'
  );
}

export const app = initializeApp(firebaseConfig);
export const db =
  isFirebaseConfigured && firestoreDatabaseId
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);
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

// Test Firestore connection on boot only if Firebase is genuinely configured
async function testConnection() {
  if (!isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration.');
    }
  }
}
testConnection();
