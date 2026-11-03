import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-rp-line bg-rp-surface px-6 py-14 text-center ${className ?? ""}`}
    >
      <p className="rp-display text-[22px] leading-tight text-rp-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-[52ch] text-[15px] leading-relaxed text-rp-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
