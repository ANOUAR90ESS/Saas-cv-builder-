import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface CloudCV {
  id: string;
  userId: string;
  title: string;
  data: Record<string, unknown>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Ensure clean alphanumeric ID for Firestore path
function sanitizeDocId(id: string): string {
  const clean = (id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return clean || `cv_${Date.now()}`;
}

/**
 * Save or update a CV in Firestore for the currently authenticated user
 */
export async function syncCvToFirestore(cv: { id: string; title?: string; [key: string]: unknown }): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const docId = sanitizeDocId(cv.id);
  const docRef = doc(db, 'cvs', docId);
  const path = `cvs/${docId}`;

  let existingData: Record<string, unknown> | null = null;
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      existingData = existingSnap.data();
    }
  } catch {
    // Non-existent or inaccessible initially, proceed with creation
    existingData = null;
  }

  try {
    if (existingData) {
      await setDoc(
        docRef,
        {
          id: docId,
          userId: currentUser.uid,
          title: (cv.title || 'Untitled CV').slice(0, 150),
          data: cv,
          createdAt: existingData.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await setDoc(docRef, {
        id: docId,
        userId: currentUser.uid,
        title: (cv.title || 'Untitled CV').slice(0, 150),
        data: cv,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all CVs for the authenticated user from Firestore
 */
export async function fetchUserCvsFromFirestore(): Promise<any[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'cvs';
  try {
    const q = query(collection(db, 'cvs'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const cloudData = docSnap.data();
      return cloudData.data || cloudData;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete a CV document from Firestore
 */
export async function deleteCvFromFirestore(cvId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const docId = sanitizeDocId(cvId);
  const path = `cvs/${docId}`;
  try {
    await deleteDoc(doc(db, 'cvs', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
