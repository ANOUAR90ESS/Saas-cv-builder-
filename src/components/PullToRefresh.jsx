import React, { useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";

// Native-style pull-to-refresh for touch devices. Triggers `onRefresh`
// only when the page is scrolled to the very top. No-op on desktop (no touch).
const THRESHOLD = 64;

export default function PullToRefresh({ onRefresh, children }) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullingState, setPullingState] = useState(false);

  const onTouchStart = useCallback(
    (e) => {
      if (refreshing) return;
      if (window.scrollY > 0) return;
      pulling.current = true;
      setPullingState(true);
      startY.current = e.touches[0].clientY;
    },
    [refreshing]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!pulling.current || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setDistance(0);
        return;
      }
      setDistance(Math.min(delta * 0.5, 100));
    },
    [refreshing]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    setPullingState(false);
    if (distance >= THRESHOLD) {
      setRefreshing(true);
      setDistance(40);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setDistance(0);
      }
    } else {
      setDistance(0);
    }
  }, [distance, onRefresh, refreshing]);

  const progress = Math.min(distance / THRESHOLD, 1);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="flex items-center justify-center overflow-hidden text-primary"
        style={{
          height: distance,
          transition: pullingState ? "none" : "height 0.2s ease",
        }}
      >
        {refreshing ? (
          <Loader2 size={20} className="animate-spin" />
        ) : distance > 0 ? (
          <RefreshCw
            size={20}
            style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}