import { useEffect, useState } from "react";
import { Loader2, Download, Sparkles, X } from "lucide-react";
import { buyOneExport, subscribe, waitForEntitlement, getBillingConfig } from "@/lib/checkout";
import { useAuth } from "@/lib/AuthContext";

// What a visitor sees when the server answers 402.
//
// The one-time price leads: it is what the site advertises, it needs no
// account, and it is what someone who came here to download one CV wants. The
// subscription sits underneath as the in-app upgrade it was decided to be --
// present for the person exporting their tenth CV, absent from every marketing
// page, which still sells the single price and the "no subscription" line the
// SEO pages are built on.

export default function PaywallDialog({ open, kind, onClose, onPaid }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (open) getBillingConfig().then(setConfig);
  }, [open]);

  if (!open) return null;

  const run = async (what, start) => {
    setBusy(what);
    setError("");
    try {
      const { completed, transactionId } = await start();
      if (!completed) return; // closed the checkout; not an error
      // Paid, but the entitlement arrives by webhook a moment later.
      const entitlement = await waitForEntitlement(transactionId);
      if (entitlement?.canExport) {
        onPaid?.();
      } else {
        setError(
          "Your payment went through, but it has not reached us yet. " +
            "Give it a moment and try the download again — you will not be charged twice."
        );
      }
    } catch (e) {
      if (e?.name === "SignInRequiredError") {
        setError("Subscribing needs an account, so it works on your other devices too.");
      } else if (e?.name === "BillingUnavailableError") {
        setError("Checkout is unavailable right now. Please try again shortly.");
      } else {
        console.error("Checkout failed", e);
        setError("Something went wrong opening the checkout. Please try again.");
      }
    } finally {
      setBusy(null);
    }
  };

  const label = kind === "docx" ? "Word document" : "PDF";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl p-6 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight mb-1">Download your {label}</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Building and previewing your CV is free. Downloading a finished file is not.
        </p>

        <button
          onClick={() => run("once", buyOneExport)}
          disabled={busy !== null}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-3 disabled:opacity-60"
        >
          {busy === "once" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Pay once for this download
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          One payment, no account needed, no recurring charge.
        </p>

        {config?.priceIdSubscription ? (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={() => run("sub", subscribe)}
              disabled={busy !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border font-semibold py-3 disabled:opacity-60"
            >
              {busy === "sub" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Subscribe for unlimited downloads
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {user
                ? "Cancel any time. Access runs to the end of the period you paid for."
                : "Needs an account, so it follows you to your other devices."}
            </p>
          </>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Payments are handled by Paddle, our reseller, which charges any VAT due in your
          country. We never see your card details.
        </p>
      </div>
    </div>
  );
}
