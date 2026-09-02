import React from "react";
import { Link } from "react-router-dom";

const BRAND = "DexaCV";

// Brand mark: rounded indigo→violet square with a bold "D". Used in the
// header, footer and builder top bar, plus as the SVG favicon.
export function LogoMark({ size = 28, className = "" }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dexacv-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#dexacv-logo-grad)" />
      <text x="32" y="45" fontFamily="Inter, Arial, sans-serif" fontSize="40" fontWeight="800" textAnchor="middle" fill="#ffffff">D</text>
    </svg>
  );
}

export default function Logo({ to = "/", size = 28, className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <LogoMark size={size} />
      <span>{BRAND}</span>
    </Link>
  );
}