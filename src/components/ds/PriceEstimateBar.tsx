import { formatEuros } from "@/lib/format";

export interface PriceEstimateBarProps {
  askingPrice: number;
  estimatedValue: number | null;
  rangePct?: number | null;
  status?: "estimated" | "to-verify";
  className?: string;
}

const AMBER_HATCH =
  "repeating-linear-gradient(45deg, rgba(224,160,48,.55) 0 4px, transparent 4px 8px)";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function PriceEstimateBar({
  askingPrice,
  estimatedValue,
  rangePct = null,
  status = "estimated",
  className,
}: PriceEstimateBarProps) {
  const hasEstimate =
    typeof estimatedValue === "number" && Number.isFinite(estimatedValue) && estimatedValue > 0;
  const range = typeof rangePct === "number" && Number.isFinite(rangePct) && rangePct > 0 ? rangePct : null;
  const toVerify = status === "to-verify";

  const domainMax = hasEstimate
    ? Math.max(askingPrice, estimatedValue * (1 + (range ?? 0) / 100), 1)
    : Math.max(askingPrice, 1);

  const askingPct = clamp((askingPrice / domainMax) * 100, 0, 100);
  const estimatePct = hasEstimate ? clamp((estimatedValue / domainMax) * 100, 0, 100) : null;
  const diffLeft = estimatePct === null ? askingPct : Math.min(askingPct, estimatePct);
  const diffWidth = estimatePct === null ? 0 : Math.abs(estimatePct - askingPct);

  const rangeLeftPct = hasEstimate && range !== null
    ? clamp(((estimatedValue * (1 - range / 100)) / domainMax) * 100, 0, 100)
    : null;
  const rangeRightPct = hasEstimate && range !== null
    ? clamp(((estimatedValue * (1 + range / 100)) / domainMax) * 100, 0, 100)
    : null;

  const description = hasEstimate
    ? `Preço pedido ${formatEuros(askingPrice)}, estimativa ${formatEuros(estimatedValue)}${
        range !== null ? ` com margem de ${range} por cento` : ""
      }.`
    : `Preço pedido ${formatEuros(askingPrice)}. Sem avaliação.`;

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={description}
        className="relative h-3 w-full overflow-hidden rounded-rp border border-rp-line bg-rp-ceramic"
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${askingPct}%`,
            backgroundColor: toVerify ? "rgba(224,160,48,.2)" : "var(--rp-ink)",
            backgroundImage: toVerify ? AMBER_HATCH : undefined,
          }}
        />
        {hasEstimate ? (
          <div
            className="absolute inset-y-0 border-l border-[var(--rp-cobalt)]"
            style={{
              left: `${diffLeft}%`,
              width: `${diffWidth}%`,
              backgroundColor: "rgba(31,79,163,.28)",
            }}
          />
        ) : null}
        {hasEstimate ? (
          <div
            className="absolute inset-y-0 w-[2px] bg-[var(--rp-ink-2)]"
            style={{ left: `calc(${estimatePct}% - 1px)` }}
          />
        ) : null}
      </div>

      <div className="relative mt-1 h-4">
        {rangeLeftPct !== null && rangeRightPct !== null && estimatePct !== null ? (
          <>
            <span
              className="absolute top-0 h-px bg-[var(--rp-line)]"
              style={{ left: `${rangeLeftPct}%`, width: `${rangeRightPct - rangeLeftPct}%` }}
              aria-hidden="true"
            />
            <span
              className="rp-num absolute top-[3px] text-[11px] text-[var(--rp-muted)]"
              style={{ left: `${estimatePct}%`, transform: "translateX(-50%)" }}
            >
              ±{range}%
            </span>
          </>
        ) : null}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--rp-ink-2)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 border border-[var(--rp-ink)]"
            style={{
              backgroundColor: toVerify ? "rgba(224,160,48,.2)" : "var(--rp-ink)",
              backgroundImage: toVerify ? AMBER_HATCH : undefined,
            }}
          />
          preço pedido
          {toVerify ? <span className="text-[var(--rp-ink-2)]">· a verificar</span> : null}
        </span>

        {hasEstimate ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 border border-[var(--rp-cobalt)]"
              style={{ backgroundColor: "rgba(31,79,163,.28)" }}
            />
            diferença até ao estimado
          </span>
        ) : (
          <span className="text-[var(--rp-muted)]">Sem avaliação</span>
        )}

        {hasEstimate ? (
          <span className="rp-num ml-auto text-[12px] text-[var(--rp-ink-2)]">
            estimado {formatEuros(estimatedValue)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
