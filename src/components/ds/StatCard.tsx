import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

export default function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={`border border-rp-line bg-rp-surface px-5 py-4 shadow-rp-1 ${className ?? ""}`}
    >
      <p className="rp-eyebrow text-rp-muted">{label}</p>
      <p className="rp-num mt-2 text-[28px] leading-none text-rp-ink">{value}</p>
      {hint ? <p className="mt-2 text-[13px] leading-snug text-rp-muted">{hint}</p> : null}
    </div>
  );
}
