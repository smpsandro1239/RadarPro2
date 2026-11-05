type DemoDataBannerProps = {
  /** Quantidade de imóveis de demonstração apresentados (0 quando não há demo). */
  demoCount?: number;
};

export default function DemoDataBanner({ demoCount }: DemoDataBannerProps) {
  const flagDisabled = (process.env.SHOW_SEED_DATA ?? "").trim().toLowerCase() === "false";
  const showByFlag = !flagDisabled;
  const showByDemoOnly = typeof demoCount === "number" && demoCount > 0;

  if (!showByFlag && !showByDemoOnly) return null;

  return (
    <div
      role="status"
      className="bg-amber-100 text-amber-900 border-b border-amber-300 px-4 py-2 text-center text-sm"
    >
      Os imóveis apresentados são dados de demonstração. Ainda não há dados reais na sua zona.
    </div>
  );
}
