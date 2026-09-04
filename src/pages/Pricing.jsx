import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { getSubscriptionStatus, verifyGooglePlayPurchase, createWebCheckoutSession } from '@/api/subscription';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Pricing() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const isAndroid = Capacitor.getPlatform() === 'android';

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      const currentStatus = await getSubscriptionStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId, productId) => {
    if (!user) {
      toast.error("Please login to subscribe.");
      // In a real app, redirect to login here.
      return;
    }

    setPurchasing(true);
    try {
      if (isAndroid) {
        // Implement Google Play Billing flow here
        // E.g., using @awesome-cordova-plugins/in-app-purchases-2 or custom plugin
        // 1. Fetch products from Google Play
        // 2. Launch purchase flow
        // 3. Receive purchase token
        // For this architecture demo, we mock the purchase token retrieval
        
        const mockPurchaseToken = `mock_token_${Date.now()}`;
        toast.info("Launching Google Play Billing...");
        
        // Simulating Google Play purchase delay
        await new Promise(r => setTimeout(r, 1500));
        
        await verifyGooglePlayPurchase(mockPurchaseToken, productId);
        toast.success("Subscription updated via Google Play!");
        
        await loadSubscriptionStatus();
      } else {
        // Implement Web Stripe flow
        const result = await createWebCheckoutSession(planId);
        toast.info(result.message);
        
        // Simulating web redirect
        if (result.checkoutUrl) {
          // window.location.href = result.checkoutUrl;
          toast.success("Redirecting to secure web checkout...");
        }
      }
    } catch (error) {
      console.error("Purchase error", error);
      toast.error("Failed to process subscription.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isProActive = status?.plan === 'PRO' && status?.status === 'ACTIVE';
  const isCareerActive = status?.plan === 'CAREER' && status?.status === 'ACTIVE';

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
          Upgrade your Career
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Unlock unlimited AI credits, professional templates, and advanced career tools.
        </p>
      </div>

      {status && status.plan !== 'FREE' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-12 text-center">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Current Entitlement</h2>
          <p className="text-gray-700 dark:text-gray-300">
            You are currently on the <strong>{status.plan}</strong> plan.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Status: {status.status} | Source: {status.source || 'N/A'} | Credits: {status.creditsRemaining}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Pro Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">DexaCV Pro</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€9.99</span>
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> 50 AI Credits per month</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Unlimited CVs & Cover Letters</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> Premium ATS-friendly templates</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2"/> AI Job Matcher access</li>
          </ul>
          
          <Button 
            className="w-full" 
            size="lg"
            variant={isProActive ? "outline" : "default"}
            disabled={purchasing || isProActive}
            onClick={() => handleSubscribe('PRO_MONTHLY', 'dexacv_pro_monthly')}
          >
            {purchasing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isProActive ? 'Current Plan' : isAndroid ? 'Subscribe via Google Play' : 'Subscribe via Web'}
          </Button>
        </div>

        {/* Career Plan */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-700 p-8 flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">Most Popular</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">DexaCV Career</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">€19.99</span>
            <span className="text-slate-300">/month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-slate-200">
            <li className="flex items-center"><Check className="h-5 w-5 text-blue-400 mr-2"/> 100 AI Credits per month</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-blue-400 mr-2"/> Everything in Pro</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-blue-400 mr-2"/> Advanced Interview Coach</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-blue-400 mr-2"/> Professional Portfolio Hosting</li>
          </ul>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0" 
            size="lg"
            disabled={purchasing || isCareerActive}
            onClick={() => handleSubscribe('CAREER_MONTHLY', 'dexacv_career_monthly')}
          >
            {purchasing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isCareerActive ? 'Current Plan' : isAndroid ? 'Subscribe via Google Play' : 'Subscribe via Web'}
          </Button>
        </div>
      </div>
      
      {/* Restore Purchases - Only relevant for Android usually, but good practice */}
      {isAndroid && (
        <div className="text-center mt-12">
          <Button variant="ghost" onClick={() => toast.info("Querying Google Play for active subscriptions...")}>
            Restore Purchases
          </Button>
        </div>
      )}
    </div>
  );
}
