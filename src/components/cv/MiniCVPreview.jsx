import React, { useEffect, useRef, useState } from "react";
import TemplateRenderer from "./TemplateRenderer";

// Scaled A4 thumbnail that fits its container width without affecting layout.
export default function MiniCVPreview({ cv }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => setScale(el.clientWidth / 794);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
      <div className="absolute top-0 left-0" style={{ width: 794, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <TemplateRenderer cv={cv} />
      </div>
    </div>
  );
}