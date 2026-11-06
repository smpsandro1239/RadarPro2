"use client";

import Image from "next/image";

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
  const placeholderSrc = `/placeholders/${placeholderKey}.svg`;
  const typeLabel = PLACEHOLDER_LABELS[placeholderKey] ?? "Imóvel";

  if (!src) {
    const placeholderAlt = `${alt} — ${typeLabel}`;
    if (fill) {
      return (
        <div className="absolute inset-0">
          <img
            src={placeholderSrc}
            alt={placeholderAlt}
            data-placeholder="true"
            className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`}
            loading="lazy"
          />
        </div>
      );
    }
    return (
      <img
        src={placeholderSrc}
        alt={placeholderAlt}
        data-placeholder="true"
        width={width ?? 400}
        height={height ?? 250}
        className={`object-cover w-full h-full ${className ?? ""}`}
        loading="lazy"
      />
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
