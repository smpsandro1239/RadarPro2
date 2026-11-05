/**
 * RadarPro Portugal - Cliente keyless da API publica v1 do flatin.pt.
 *
 * Fonte aberta (CC BY 4.0) para dados de mercado e fiscalidade:
 * - /api/v1/imi/rates: IMI anual por municipio (urbano/rural, disponibilidade).
 * - /api/v1/municipalities/{municipality}/stats: median price INE, poder de compra,
 *   population, new dwellings licensed, building works cases.
 *
 * Rate limit publico: 120 req/min/IP. Nao requer chave.
 */

export const FLATIN_BASE_URL = "https://flatin.pt";

const FETCH_TIMEOUT_MS = 15000;
const RATE_LIMIT_MS = 1500;

export interface FlatinIMIRate {
  codigo: string;
  municipality: string;
  municipality_as_published: string;
  distrito: string;
  urban: { available: boolean; percent: string; thousandths_of_percent: number };
  rural: { available: boolean; percent: string; thousandths_of_percent: number };
}

export interface FlatinMunicipalityStats {
  summary: string;
  language: string;
  municipality: { code: string; name: string; distrito: string };
  url: string;
  imi: {
    year: number;
    urban: { available: boolean; percent: string; thousandths_of_percent: number };
    rural: { available: boolean; percent: string; thousandths_of_percent: number };
    movement?: unknown;
  };
  median_sale_price?: { value?: number; unit?: string; source?: string; period?: string; currency?: string };
  purchasing_power_index?: { value?: number; period?: string; base?: number };
  population?: { value?: number; year?: number };
  new_dwellings_licensed?: { value?: number; year?: number };
  building_works_cases?: { value?: number; period?: string };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        Referer: "https://www.google.com/",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`flatin HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getIMI(): Promise<FlatinIMIRate[]> {
  const data = (await fetchJson(`${FLATIN_BASE_URL}/api/v1/imi/rates`)) as { municipalities?: FlatinIMIRate[] };
  return data.municipalities ?? [];
}

export async function getIMIRateFor(municipality: string): Promise<FlatinIMIRate | null> {
  const rates = await getIMI();
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const target = norm(municipality);
  return rates.find((r) => norm(r.municipality) === target) ?? null;
}

export async function getMunicipalityStats(municipality: string): Promise<FlatinMunicipalityStats | null> {
  const data = (await fetchJson(`${FLATIN_BASE_URL}/api/v1/municipalities/${encodeURIComponent(municipality)}/stats`)) as FlatinMunicipalityStats;
  if ((data as { error?: unknown }).error) return null;
  return data;
}
