import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export async function getSubscriptionStatus() {
  let user = auth.currentUser;
  if (!user) {
    user = await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        unsub();
        resolve(u);
      });
    });
  }
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/subscription/status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to fetch subscription status");
  }

  return response.json();
}

export async function verifyGooglePlayPurchase(purchaseToken, productId) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/subscription/google-play/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ purchaseToken, productId }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify Google Play purchase");
  }

  return response.json();
}

export async function createWebCheckoutSession(planId) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/subscription/web/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  return response.json();
}
