const EMPTY_VALUE = "—";
const NO_SCORE = "Sem avaliação";

function isMissing(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(value);
}

export function formatScore(score: number | null | undefined): string {
  if (isMissing(score)) return NO_SCORE;
  return String(score);
}

/** "82/100" ou "Sem avaliação" (sem o "/100" quando nao ha score). */
export function formatScoreOutOf100(score: number | null | undefined): string {
  if (isMissing(score)) return NO_SCORE;
  return `${score}/100`;
}

export function formatOptional(value: number | null | undefined, suffix?: string): string {
  if (isMissing(value)) return EMPTY_VALUE;
  return `${value}${suffix ?? ""}`;
}

export function formatEuros(value: number | null | undefined): string {
  if (isMissing(value)) return EMPTY_VALUE;
  return `${value.toLocaleString("pt-PT")} €`;
}
