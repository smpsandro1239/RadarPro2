"use client";

import { useId, type ReactNode } from "react";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ label, children, className }: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className={`group relative inline-flex ${className ?? ""}`} aria-describedby={tooltipId}>
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 translate-y-1 rounded-rp bg-rp-ink px-2.5 py-1.5 text-[12px] leading-snug text-rp-surface opacity-0 shadow-rp-1 transition-[opacity,transform] duration-[var(--rp-dur-1)] ease-[var(--rp-ease-1)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
