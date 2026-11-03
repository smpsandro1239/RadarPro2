"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  hasImage: boolean;
  label?: string;
}

const TONES = {
  verified: "border-rp-cobalt bg-rp-surface text-rp-cobalt",
  link: "border-rp-amber bg-rp-surface text-rp-ink-2",
  expired: "border-rp-orange bg-rp-surface text-rp-anomaly",
  none: "border-rp-line bg-rp-surface text-rp-muted",
} as const;

export default function VerifiedBadge({ isVerified, hasImage, label }: VerifiedBadgeProps) {
  const isFullyVerified = isVerified && hasImage;

  const shell =
    "rp-eyebrow inline-flex items-center gap-1.5 rounded-rp border px-2 py-[5px] text-[12px]";

  if (isFullyVerified) {
    return (
      <span className={`${shell} ${TONES.verified}`}>
        <ShieldCheck size={12} aria-hidden="true" />
        {label ?? "Verificado RadarPro"}
      </span>
    );
  }

  if (isVerified && !hasImage) {
    return (
      <span className={`${shell} ${TONES.link}`}>
        <ShieldCheck size={12} aria-hidden="true" />
        {label ?? "Link verificado"}
      </span>
    );
  }

  if (!isVerified && hasImage) {
    return (
      <span className={`${shell} ${TONES.expired}`}>
        <ShieldOff size={12} aria-hidden="true" />
        {label ?? "Link expirado"}
      </span>
    );
  }

  return (
    <span className={`${shell} ${TONES.none}`}>
      <ShieldOff size={12} aria-hidden="true" />
      {label ?? "Sem verificação"}
    </span>
  );
}
