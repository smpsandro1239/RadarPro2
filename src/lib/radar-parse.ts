/**
 * RadarPro Portugal - Parser de linguagem natural (Fase 3.4).
 *
 * Regras simples (regex + dicionario de distritos). Sem IA, sem APIs pagas.
 * Entrada exemplo: "apartamento até 100k em lisboa".
 */

import { PORTUGAL_DISTRICTS, fold } from "@/lib/geography";

export interface RadarQuery {
  district: string | null;
  maxPrice: number | null;
  isAuction: boolean;
  typeHint: string | null;
}

const PRICE_PATTERN = /(?:até|ate|at|upto|max|maximum|abaixo de|below|under)\s*(\d+(?:[.,]\d+)?)\s*(k|m)?/i;

export function parseRadarQuery(input: string): RadarQuery {
  const text = (input ?? "").trim();
  const folded = fold(text);

  const tokens = fold(text).split(/[\s,]+/).filter((t) => t !== "");
  let district: string | null = null;
  for (const d of PORTUGAL_DISTRICTS) {
    const dTokens = fold(d).split(/[\s]+/).filter((t) => t !== "");
    if (dTokens.length === 0) continue;
    for (let i = 0; i + dTokens.length <= tokens.length; i++) {
      if (tokens.slice(i, i + dTokens.length).join(" ") === dTokens.join(" ")) {
        district = d;
        break;
      }
    }
    if (district) break;
  }

  let maxPrice: number | null = null;
  const priceMatch = folded.match(PRICE_PATTERN);
  if (priceMatch) {
    const value = Number(priceMatch[1].replace(/\./g, "").replace(",", "."));
    const suffix = (priceMatch[2] ?? "").toLowerCase();
    maxPrice = suffix ? Math.round(value * (suffix === "k" || suffix === "m" ? (suffix === "k" ? 1000 : 1000000) : 1)) : value;
  }

  const isAuction = /leilao|leiloes|leilões|auction|judicial|fiscal|ejec/i.test(folded);

  let typeHint: string | null = null;
  if (/apartamento|apartments/i.test(folded)) typeHint = "apartamento";
  else if (/moradia|house|casa/i.test(folded)) typeHint = "moradia";
  else if (/terreno|land/i.test(folded)) typeHint = "terreno";
  else if (/garagem|garage/i.test(folded)) typeHint = "garagem";

  return { district, maxPrice, isAuction, typeHint };
}
