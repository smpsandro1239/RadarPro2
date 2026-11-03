import { showSeedData } from "@/lib/data-origin";

export interface DemoDataBannerProps {
  force?: boolean;
}

export default function DemoDataBanner({ force = false }: DemoDataBannerProps) {
  if (!force && !showSeedData()) return null;

  return (
    <div
      role="status"
      className="border-b border-rp-line px-4 py-2 text-center text-[13px]"
      style={{ backgroundColor: "rgba(224,160,48,.16)", color: "var(--rp-ink)" }}
    >
      Protótipo / Dados de demonstração — não são anúncios reais
    </div>
  );
}
