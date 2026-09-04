import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Clock,
  Smartphone,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getSubscriptionStatus } from "@/api/subscription";
import { cn } from "@/lib/utils";

/**
 * SubscriptionStatus Component
 *
 * Calls GET /api/subscription/status to fetch and display the authenticated user's:
 * - Current Plan (FREE, PRO, CAREER)
 * - Subscription Status (ACTIVE, EXPIRED, TRIALING, CANCELED)
 * - Remaining AI Credits with visual balance meter
 * - Billing Platform and Renewal Date (if applicable)
 */
export default function SubscriptionStatus({
  className,
  showManageButton = true,
  showRefresh = true,
  compact = false,
  onStatusChange,
}) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async (isManualRefresh = false) => {
    if (!user) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getSubscriptionStatus();
      setData(result);
      if (onStatusChange) {
        onStatusChange(result);
      }
    } catch (err) {
      console.error("SubscriptionStatus fetch failed:", err);
      setError(err?.message || "Failed to load subscription status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, onStatusChange]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Guest / Unauthenticated State
  if (!user) {
    return (
      <Card id="subscription-status-guest" className={cn("overflow-hidden border-border/80 shadow-xs", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Plan & AI Credits</CardTitle>
                <CardDescription>Guest Mode (Local Storage)</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
              Guest
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 pb-4">
          <p className="text-sm text-muted-foreground">
            You are currently using DexaCV without an account. Standard CV editing is free and saved locally in your browser.
          </p>
          <div className="rounded-lg bg-muted/40 p-3 border border-border/60 flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={15} className="text-primary" /> Free AI Trial Credits
            </span>
            <span className="font-semibold text-foreground">10 Credits</span>
          </div>
        </CardContent>
        {showManageButton && (
          <CardFooter className="pt-0 border-t border-border/40 bg-muted/20 px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sign in to unlock Pro features & cloud backups</span>
            <Button asChild size="sm" variant="default" className="h-8">
              <Link to="/login?returnTo=/account">
                Sign In <ArrowUpRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Loading State
  if (loading) {
    return (
      <Card id="subscription-status-loading" className={cn("overflow-hidden border-border/80 shadow-xs", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 rounded bg-muted animate-pulse" />
                <div className="w-40 h-3 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="w-16 h-5 rounded-full bg-muted animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 py-2">
          <div className="w-full h-16 rounded-lg bg-muted animate-pulse" />
          <div className="w-full h-2 rounded-full bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error && !data) {
    return (
      <Card id="subscription-status-error" className={cn("border-destructive/30 bg-destructive/5 shadow-xs", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={18} />
            <CardTitle className="text-base font-semibold">Unable to load subscription</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            {error}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            {refreshing ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <RefreshCw size={13} className="mr-1.5" />}
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Normalize Plan & Status Details
  const plan = (data?.plan || "FREE").toUpperCase();
  const status = (data?.status || "ACTIVE").toUpperCase();
  const creditsRemaining = typeof data?.creditsRemaining === "number" ? data.creditsRemaining : 10;
  const platform = data?.platform;
  const periodEnd = data?.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
  const isPro = plan === "PRO" || plan === "CAREER";
  const isActive = status === "ACTIVE";

  // Maximum reference for credit percentage calculation
  const maxCredits = plan === "CAREER" ? 200 : plan === "PRO" ? 50 : 10;
  const creditPercentage = Math.min(100, Math.max(0, Math.round((creditsRemaining / maxCredits) * 100)));

  // Status visual attributes
  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Active
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="font-medium text-xs">
            Expired
          </Badge>
        );
      case "TRIALING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-xs">
            Trialing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium text-xs">
            {status}
          </Badge>
        );
    }
  };

  const getPlanIcon = () => {
    if (plan === "CAREER") return <Zap size={18} className="text-amber-500" />;
    if (plan === "PRO") return <Sparkles size={18} className="text-primary" />;
    return <ShieldCheck size={18} className="text-muted-foreground" />;
  };

  return (
    <Card id="subscription-status-card" className={cn("overflow-hidden border-border/80 shadow-xs", className)}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                isPro ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {getPlanIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold leading-none">
                  {plan} Plan
                </CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription className="text-xs mt-1">
                {isPro ? "Full access to advanced CV templates & AI tools" : "Standard CV editing with essential features"}
              </CardDescription>
            </div>
          </div>

          {showRefresh && (
            <Button
              id="subscription-status-refresh-btn"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Refresh subscription status"
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={cn(refreshing && "animate-spin text-primary")} />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 pt-1">
        {/* Credits Balance Card */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">AI Assist Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {creditsRemaining}
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                / {maxCredits} left
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={creditPercentage}
            className={cn(
              "h-2",
              creditsRemaining <= 2
                ? "[&>div]:bg-amber-500"
                : creditsRemaining === 0
                ? "[&>div]:bg-destructive"
                : "[&>div]:bg-primary"
            )}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {creditsRemaining === 0 ? (
                <span className="text-destructive font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> Out of AI credits
                </span>
              ) : creditsRemaining <= 2 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Low credit balance
                </span>
              ) : (
                "Credits refresh monthly"
              )}
            </span>
            <span>{creditPercentage}% remaining</span>
          </div>
        </div>

        {/* Platform & Expiration Metadata */}
        {(platform || periodEnd) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-0.5">
            {platform && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/20 border border-border/40">
                {platform.toUpperCase() === "ANDROID" ? (
                  <Smartphone size={14} className="text-muted-foreground shrink-0" />
                ) : (
                  <Globe size={14} className="text-muted-foreground shrink-0" />
                )}
                <span>Platform: {platform === "ANDROID" ? "Google Play" : "Web (Stripe)"}</span>
              </div>
            )}
            {periodEnd && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/20 border border-border/40">
                <Clock size={14} className="text-muted-foreground shrink-0" />
                <span>
                  {isActive ? "Renews" : "Expired"}: {periodEnd.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      {showManageButton && (
        <CardFooter className="pt-2 pb-4 px-6 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {!isPro ? (
              <span>Upgrade to unlock 50+ AI credits & premium designs</span>
            ) : (
              <span>Managing plan entitlements & billing</span>
            )}
          </div>

          <Button
            id="subscription-status-cta-btn"
            asChild
            size="sm"
            variant={!isPro || !isActive ? "default" : "outline"}
            className="h-8 font-medium cursor-pointer"
          >
            <Link to="/pricing">
              {!isPro || !isActive ? (
                <>
                  Upgrade Plan <ArrowUpRight size={14} className="ml-1" />
                </>
              ) : (
                "Manage Plan"
              )}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
