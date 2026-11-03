/**
 * Datas/horas de Portugal continental.
 *
 * As APIs dos portais devolvem hora local sem fuso ("2026-11-03T08:59:59").
 * `new Date(...)` interpreta isso no fuso do servidor (UTC na Vercel), o que
 * desloca o fim do leilao em 1 hora no horario de verao. Aqui a hora local e
 * convertida para UTC usando o fuso real de Lisboa (WET UTC+0 / WEST UTC+1).
 */

const LISBON = "Europe/Lisbon";

/** Offset de Lisboa (ms) aplicavel a um instante UTC: positivo = Lisboa ahead. */
export function lisbonOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LISBON,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - instant.getTime();
}

/**
 * Converte "2026-11-03T08:59:59" (hora de Lisboa) em epoch ms (UTC).
 * Aceita tambem valores com fuso explicito ("...Z", "...+01:00"), que sao
 * interpretados tal como vierem. Devolve null se o valor nao for uma data.
 */
export function parsePortugalDateTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const text = value.trim();

  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(text);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const wallClock = Date.UTC(+year, +month - 1, +day, +hour, +minute, +(second ?? "0"));

  // Duas passagens: a primeira usa o offset aproximado, a segunda corrige
  // nas transicoes de hora de verao.
  let instant = wallClock - lisbonOffsetMs(new Date(wallClock));
  instant = wallClock - lisbonOffsetMs(new Date(instant));
  return instant;
}
