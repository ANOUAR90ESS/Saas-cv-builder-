// Local-first persistence. No account required to create or download a CV.
import { createEmptyCV, createDemoCV } from "./cvSchema";
import { syncCvToFirestore, deleteCvFromFirestore } from "./firebaseSync";

const KEY = "cvforge.cvs.v1";
const ACTIVE_KEY = "cvforge.active.v1";

export function loadAllCVs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAllCVs(cvs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cvs));
    localStorage.setItem(ACTIVE_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

export function getActiveId() {
  return localStorage.getItem("cvforge.activeid.v1");
}
export function setActiveId(id) {
  localStorage.setItem("cvforge.activeid.v1", id);
}

// Ensure at least the demo CV exists so the app looks alive on first load.
export function ensureSeed(lang = "en") {
  let cvs = loadAllCVs();
  if (!cvs || cvs.length === 0) {
    const demo = createDemoCV(lang);
    cvs = [demo];
    saveAllCVs(cvs);
    setActiveId(demo.id);
  }
  return cvs;
}

export function upsertCV(cv) {
  const cvs = loadAllCVs() || [];
  const idx = cvs.findIndex((c) => c.id === cv.id);
  const stamped = { ...cv, updated_at: new Date().toISOString() };
  if (idx >= 0) cvs[idx] = stamped;
  else cvs.unshift(stamped);
  saveAllCVs(cvs);
  setActiveId(cv.id);

  // Background sync to Firestore when authenticated
  try {
    syncCvToFirestore(stamped).catch((err) => {
      console.warn("Firestore sync skipped or failed:", err);
    });
  } catch (err) {
    console.warn("Firestore sync trigger error:", err);
  }

  return stamped;
}

export function deleteCV(id) {
  const cvs = (loadAllCVs() || []).filter((c) => c.id !== id);
  saveAllCVs(cvs);

  // Background delete from Firestore
  try {
    deleteCvFromFirestore(id).catch((err) => {
      console.warn("Firestore delete skipped or failed:", err);
    });
  } catch (err) {
    console.warn("Firestore delete trigger error:", err);
  }

  return cvs;
}

export function duplicateCV(id) {
  const cvs = loadAllCVs() || [];
  const src = cvs.find((c) => c.id === id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = Math.random().toString(36).slice(2, 10);
  copy.title = src.title + " (Copy)";
  copy.created_at = new Date().toISOString();
  copy.updated_at = new Date().toISOString();
  cvs.unshift(copy);
  saveAllCVs(cvs);
  return copy;
}