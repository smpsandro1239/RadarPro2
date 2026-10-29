import { Camera, Building2 } from "lucide-react";

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
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 ${className}`}>
        <Building2 size={40} className="mb-2 opacity-30" />
        <span className="text-xs font-medium opacity-60">Sem imagem disponível</span>
        {sourceName && (
          <span className="text-[10px] mt-1 opacity-40">Fonte: {sourceName}</span>
        )}
        <span className="text-[10px] mt-0.5 opacity-30">RadarPro Portugal</span>
      </div>
    );
  }

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-cover w-full h-full ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 250}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
