import { showSeedData } from "@/lib/data-origin";

export default function SeedDataBanner() {
  if (!showSeedData()) return null;

  return (
    <div
      role="status"
      className="bg-amber-100 text-amber-900 border-b border-amber-300 px-4 py-2 text-center text-sm"
    >
      Dados de demonstração — alguns imóveis aqui presentes são exemplos e não correspondem a anúncios reais.
    </div>
  );
}
