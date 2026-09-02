import React, { useEffect, useRef, useState } from "react";
import TemplateRenderer from "./TemplateRenderer";

// Renders the CV as an A4 document and scales it to fit the container width,
// without the unscaled layout box overflowing the page.
export default function CVPreview({ cv, className = "" }) {
  const wrapRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const compute = () => {
      const s = Math.min(1, wrap.clientWidth / 794);
      setScale(s);
      // offsetHeight is the unscaled layout height; transform doesn't change it.
      setHeight(content.offsetHeight * s);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    ro.observe(content);
    return () => ro.disconnect();
  }, [cv]);

  return (
    <div ref={wrapRef} className={`w-full ${className}`}>
      <div style={{ width: 794 * scale, height, margin: "0 auto", position: "relative" }}>
        <div ref={contentRef} style={{ width: 794, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
          <div className="cv-shadow rounded-md overflow-hidden bg-white">
            <TemplateRenderer cv={cv} />
          </div>
        </div>
      </div>
    </div>
  );
}