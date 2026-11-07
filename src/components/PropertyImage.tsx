"use client";

import Image from "next/image";
import { Home } from "lucide-react";

interface PropertyImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sourceName?: string;
  assetClass?: string | null;
}

const PLACEHOLDER_BY_ASSET_CLASS: Record<string, string> = {
  apartment: "apartment",
  house: "house",
  commercial: "commercial",
  garage: "garage",
  mixed: "mixed",
  land: "land",
  urban_land: "land",
  rural_land: "land",
};

const PLACEHOLDER_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  commercial: "Loja",
  garage: "Garagem",
  mixed: "Misto",
  land: "Terreno",
};

export default function PropertyImage({ src, alt, className = "", fill, width, height, sourceName, assetClass }: PropertyImageProps) {
  const placeholderKey = PLACEHOLDER_BY_ASSET_CLASS[assetClass ?? ""] ?? "apartment";
  const typeLabel = PLACEHOLDER_LABELS[placeholderKey] ?? "Imóvel";

  if (!src) {
    const strip = (
      <div data-placeholder="true" className="bg-[#f3f4f6] flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-1 px-4">
          <Home size={20} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{typeLabel}</span>
        </div>
      </div>
    );
    if (fill) {
      return <div className="absolute inset-0">{strip}</div>;
    }
    return (
      <div data-placeholder="true" className={`flex items-center justify-center ${className ?? ""}`} style={{ width: width ?? 400, height: height ?? 250 }}>
        {strip}
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
