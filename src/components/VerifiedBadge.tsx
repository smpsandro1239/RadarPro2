"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  hasImage: boolean;
  label?: string;
}

export default function VerifiedBadge({ isVerified, hasImage, label }: VerifiedBadgeProps) {
  const isFullyVerified = isVerified && hasImage;

  return (
    <div className="flex items-center gap-2">
      {isFullyVerified && (
        <span className="px-2 py-1 rounded text-xs font-bold border border-green-200 bg-green-50 text-green-700 flex items-center gap-1">
          <ShieldCheck size={12} />
          Verificado RadarPro
        </span>
      )}
      {isVerified && !hasImage && (
        <span className="px-2 py-1 rounded text-xs font-bold border border-yellow-200 bg-yellow-50 text-yellow-700 flex items-center gap-1">
          <ShieldCheck size={12} />
          Link verificado
        </span>
      )}
      {!isVerified && hasImage && (
        <span className="px-2 py-1 rounded text-xs font-bold border border-orange-200 bg-orange-50 text-orange-700 flex items-center gap-1">
          <ShieldOff size={12} />
          Link expirado
        </span>
      )}
      {!isVerified && !hasImage && (
        <span className="px-2 py-1 rounded text-xs font-bold border border-red-200 bg-red-50 text-red-700 flex items-center gap-1">
          <ShieldOff size={12} />
          Sem verificação
        </span>
      )}
    </div>
  );
}
