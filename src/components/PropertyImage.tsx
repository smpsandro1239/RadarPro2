"use client";

import { Camera, Building2 } from "lucide-react";
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
      <div className={`bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center justify-center text-slate-400 ${className}`}>
        <Building2 size={48} className="mb-3 opacity-20" />
        <span className="text-sm font-medium text-slate-500">Sem imagem disponível</span>
        <span className="text-xs text-slate-400 mt-1">{sourceName || "Imóvel"}</span>
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
