import React from "react";
import { m } from "framer-motion";

// Lightweight enter-slide for full-page routes that render outside the main
// Layout wrapper (login, register, builder), giving a native-feeling page
// transition without re-animating the persistent Layout chrome.
export default function PageSlide({ children }) {
  return (
    <m.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}