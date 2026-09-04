import { db } from './index.ts';
import { subscriptionEntitlements, aiCreditBalances, paymentTransactions, users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getSubscriptionStatus(userId: number) {
  // Ensure credit record exists or fetch
  let credits = await db.select().from(aiCreditBalances).where(eq(aiCreditBalances.userId, userId)).limit(1);
  if (!credits.length) {
    try {
      await db.insert(aiCreditBalances).values({
        userId,
        creditsRemaining: 10,
      }).onConflictDoNothing();
      credits = await db.select().from(aiCreditBalances).where(eq(aiCreditBalances.userId, userId)).limit(1);
    } catch (e) {
      console.warn("Failed to initialize default credits:", e);
    }
  }

  const entitlement = await db.select().from(subscriptionEntitlements).where(eq(subscriptionEntitlements.userId, userId)).limit(1);
  const creditsRemaining = credits.length ? credits[0].creditsRemaining : 10;
  
  if (!entitlement.length) {
    // Return default free state
    return {
      plan: 'FREE',
      status: 'ACTIVE',
      source: null,
      platform: null,
      creditsRemaining,
      startedAt: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: 0,
    };
  }

  // Check for expiration
  const current = entitlement[0];
  let finalStatus = current.status;
  
  if (current.currentPeriodEnd && current.currentPeriodEnd < new Date() && current.plan !== 'FREE') {
    finalStatus = 'EXPIRED';
  }

  return {
    ...current,
    status: finalStatus,
    plan: finalStatus === 'EXPIRED' ? 'FREE' : current.plan,
    platform: current.platform || null,
    creditsRemaining,
  };
}

export async function updateGooglePlayEntitlement(userId: number, purchaseToken: string, productId: string) {
  // Determine plan based on productId
  let plan = 'PRO';
  if (productId.includes('career')) plan = 'CAREER';

  // Setup expiration date based on plan length (simplified mock calculation)
  const now = new Date();
  const endDate = new Date();
  if (productId.includes('yearly')) {
    endDate.setFullYear(now.getFullYear() + 1);
  } else {
    endDate.setMonth(now.getMonth() + 1);
  }

  // Update Entitlement
  await db.insert(subscriptionEntitlements)
    .values({
      userId,
      plan,
      status: 'ACTIVE',
      source: 'GOOGLE_PLAY',
      platform: 'ANDROID',
      externalSubscriptionId: purchaseToken,
      startedAt: now,
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
    })
    .onConflictDoUpdate({
      target: subscriptionEntitlements.userId,
      set: {
        plan,
        status: 'ACTIVE',
        source: 'GOOGLE_PLAY',
        platform: 'ANDROID',
        externalSubscriptionId: purchaseToken,
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        updatedAt: new Date()
      },
    });

  // Grant Credits
  const creditsToGrant = plan === 'CAREER' ? 100 : 50;
  await db.insert(aiCreditBalances)
    .values({
      userId,
      creditsRemaining: creditsToGrant,
    })
    .onConflictDoUpdate({
      target: aiCreditBalances.userId,
      set: {
        creditsRemaining: creditsToGrant, // Or increment based on logic
        updatedAt: new Date()
      }
    });

  // Log Transaction
  await db.insert(paymentTransactions)
    .values({
      userId,
      externalTransactionId: purchaseToken,
      source: 'GOOGLE_PLAY',
      status: 'SUCCESS',
      eventType: 'SUBSCRIPTION_STARTED'
    });
}

export async function verifyAndDeductCredits(userId: number, cost: number = 1): Promise<boolean> {
  let credits = await db.select().from(aiCreditBalances).where(eq(aiCreditBalances.userId, userId)).limit(1);
  if (!credits.length) {
    try {
      await db.insert(aiCreditBalances).values({
        userId,
        creditsRemaining: 10,
      }).onConflictDoNothing();
      credits = await db.select().from(aiCreditBalances).where(eq(aiCreditBalances.userId, userId)).limit(1);
    } catch (e) {
      console.warn("Failed to initialize credits:", e);
    }
  }

  if (!credits.length || credits[0].creditsRemaining < cost) {
    return false;
  }
  
  await db.update(aiCreditBalances)
    .set({
      creditsRemaining: credits[0].creditsRemaining - cost,
      updatedAt: new Date()
    })
    .where(eq(aiCreditBalances.userId, userId));
    
  return true;
}

