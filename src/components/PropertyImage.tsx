import Image from "next/image";
import { Camera } from "lucide-react";

interface PropertyImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function PropertyImage({ src, alt, className = "", fill, width, height }: PropertyImageProps) {
  if (!src) {
    return (
      <div className={`bg-slate-100 flex flex-col items-center justify-center text-slate-400 ${className}`}>
        <Camera size={32} className="mb-2 opacity-50" />
        <span className="text-xs font-medium">Sem imagem disponível</span>
        <span className="text-[10px] mt-1 opacity-60">RadarPro Portugal</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 250}
      className={`object-cover ${className}`}
    />
  );
}
