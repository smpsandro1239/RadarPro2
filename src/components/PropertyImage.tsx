"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";

interface PropertyImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sourceName?: string;
}

export default function PropertyImage({ src, alt, className = "", fill, width, height, sourceName }: PropertyImageProps) {
  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-rp-ceramic text-rp-muted ${className}`}
      >
        <Building2 size={40} className="mb-3 opacity-40" aria-hidden="true" />
        <span className="rp-eyebrow text-rp-muted">Sem imagem disponível</span>
        <span className="rp-eyebrow mt-1 text-rp-muted opacity-70">{sourceName || "Imóvel"}</span>
      </div>
    );
  }

  const proxyUrl = `/api/img?u=${encodeURIComponent(src)}`;

  if (fill) {
    return (
      <Image
        src={proxyUrl}
        alt={alt}
        fill
        className={`object-cover w-full h-full ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={proxyUrl}
      alt={alt}
      width={width || 400}
      height={height || 250}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
