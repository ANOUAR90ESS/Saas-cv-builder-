import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Smartphone, Check } from "lucide-react";
import { triggerHaptic, isHapticsEnabled, setHapticsEnabled } from "@/lib/haptics";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher({ className = "" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    setMounted(true);
    setHapticsOn(isHapticsEnabled());
  }, []);

  if (!mounted) {
    return (
      <div className="h-28 rounded-xl bg-muted/40 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggleMode = () => {
    triggerHaptic("medium");
    setTheme(isDark ? "light" : "dark");
  };

  const handleSelectTheme = (newTheme) => {
    triggerHaptic("selection");
    setTheme(newTheme);
  };

  const handleHapticsToggle = (checked) => {
    setHapticsOn(checked);
    setHapticsEnabled(checked);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary manual toggle button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            {isDark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {isDark ? "Dark Mode Active" : "Light Mode Active"}
            </div>
            <div className="text-xs text-muted-foreground">
              {isDark
                ? "Reduced glare, ideal for nighttime and OLED screens"
                : "Crisp high-contrast layout, ideal for daytime reading"}
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleToggleMode}
          variant="outline"
          className="w-full sm:w-auto h-10 px-4 font-medium flex items-center justify-center gap-2 border-border hover:bg-accent"
        >
          {isDark ? (
            <>
              <Sun size={16} className="text-amber-500" /> Switch to Light
            </>
          ) : (
            <>
              <Moon size={16} className="text-indigo-500" /> Switch to Dark
            </>
          )}
        </Button>
      </div>

      {/* 3-way Segmented mode selector (Light / Dark / System) */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Appearance Preference</Label>
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted/60 border border-border/80">
          <button
            type="button"
            onClick={() => handleSelectTheme("light")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all select-none ${
              theme === "light"
                ? "bg-background text-foreground shadow-xs ring-1 ring-border font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun size={16} className={theme === "light" ? "text-amber-500" : ""} />
            <span>Light</span>
            {theme === "light" && <Check size={12} className="hidden sm:inline-block ml-1 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme("dark")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all select-none ${
              theme === "dark"
                ? "bg-background text-foreground shadow-xs ring-1 ring-border font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon size={16} className={theme === "dark" ? "text-indigo-400" : ""} />
            <span>Dark</span>
            {theme === "dark" && <Check size={12} className="hidden sm:inline-block ml-1 text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme("system")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all select-none ${
              theme === "system"
                ? "bg-background text-foreground shadow-xs ring-1 ring-border font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Laptop size={16} className={theme === "system" ? "text-primary" : ""} />
            <span>System</span>
            {theme === "system" && <Check size={12} className="hidden sm:inline-block ml-1 text-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Haptics tactile toggle */}
      <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-muted text-muted-foreground">
            <Smartphone size={16} />
          </div>
          <div>
            <div className="text-xs font-medium text-foreground">Mobile Haptic Feedback</div>
            <div className="text-[11px] text-muted-foreground">
              Subtle tactile vibrations when tapping buttons and interactive controls
            </div>
          </div>
        </div>
        <Switch
          id="haptics-switch"
          checked={hapticsOn}
          onCheckedChange={handleHapticsToggle}
          aria-label="Toggle haptic feedback"
        />
      </div>
    </div>
  );
}
