import React from "react";
import { ChevronLeft } from "lucide-react";
import { useSmartBack } from "@/hooks/useSmartBack";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const back = useSmartBack("/");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <Icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <div className="text-center text-sm text-muted-foreground mt-6">{footer}</div>
        )}
      </div>
    </div>
  );
}