import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const HAPTICS_STORAGE_KEY = "dexacv_haptics_enabled";

/**
 * Returns whether haptic feedback is currently enabled.
 * Defaults to true.
 */
export function isHapticsEnabled() {
  try {
    const val = localStorage.getItem(HAPTICS_STORAGE_KEY);
    return val !== "false";
  } catch {
    return true;
  }
}

/**
 * Updates the user preference for haptic feedback.
 */
export function setHapticsEnabled(enabled) {
  try {
    localStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? "true" : "false");
    if (enabled) {
      triggerHaptic("light");
    }
  } catch {
    // ignore storage errors
  }
}

let lastHapticTime = 0;
const HAPTIC_THROTTLE_MS = 40;

/**
 * Triggers native haptic feedback via Capacitor on mobile native
 * or falls back to navigator.vibrate on mobile web browsers.
 *
 * @param {"light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error"} type
 */
export async function triggerHaptic(type = "light") {
  if (!isHapticsEnabled()) return;

  const now = Date.now();
  if (now - lastHapticTime < HAPTIC_THROTTLE_MS) return;
  lastHapticTime = now;

  try {
    const isNative = typeof Capacitor !== "undefined" && Capacitor.isNativePlatform();

    if (isNative) {
      switch (type) {
        case "selection":
          await Haptics.selectionChanged();
          break;
        case "medium":
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "heavy":
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case "success":
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case "warning":
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case "error":
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case "light":
        default:
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
      return;
    }

    // Web vibration fallback for touch/mobile web
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      switch (type) {
        case "selection":
          navigator.vibrate(8);
          break;
        case "medium":
          navigator.vibrate(20);
          break;
        case "heavy":
          navigator.vibrate(35);
          break;
        case "success":
          navigator.vibrate([15, 60, 20]);
          break;
        case "warning":
          navigator.vibrate([20, 50, 20]);
          break;
        case "error":
          navigator.vibrate([30, 70, 40]);
          break;
        case "light":
        default:
          navigator.vibrate(12);
          break;
      }
    }
  } catch {
    // Gracefully ignore devices without haptic/vibration support
  }
}

export function hapticLight() {
  return triggerHaptic("light");
}

export function hapticMedium() {
  return triggerHaptic("medium");
}

export function hapticSuccess() {
  return triggerHaptic("success");
}

export function hapticSelection() {
  return triggerHaptic("selection");
}

let globalListenerRegistered = false;

/**
 * Initializes global touch & click haptic feedback for buttons, links,
 * and interactive controls across the application.
 */
export function initGlobalHaptics() {
  if (globalListenerRegistered || typeof window === "undefined") return;
  globalListenerRegistered = true;

  const selector = [
    "button",
    "a[href]",
    "[role='button']",
    "[role='tab']",
    "[role='switch']",
    "[role='checkbox']",
    "[role='radio']",
    "input[type='button']",
    "input[type='submit']",
    "input[type='reset']",
    "input[type='checkbox']",
    "input[type='radio']",
    "select",
    "summary",
    "[data-haptic]",
  ].join(",");

  const onPointerDown = (e) => {
    // Only fire on touch/pen input or inside native capacitor shell to preserve desktop mouse feel
    const isTouch =
      e.pointerType === "touch" ||
      e.pointerType === "pen" ||
      (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform()) ||
      (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);

    if (!isTouch) return;

    const target = e.target?.closest?.(selector);
    if (!target) return;

    // Skip disabled elements or elements explicitly opting out
    if (
      target.disabled ||
      target.getAttribute("aria-disabled") === "true" ||
      target.dataset?.haptic === "none"
    ) {
      return;
    }

    const hapticStyle = target.dataset?.haptic || "light";
    triggerHaptic(hapticStyle);
  };

  window.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
}
