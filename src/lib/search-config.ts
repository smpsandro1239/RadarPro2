/**
 * RadarPro Portugal - Configuração do motor de busca
 *
 * Define o modo de busca ativo com base nas env vars de Typesense.
 * O Turso é sempre a fonte de verdade; o Typesense é um acelerador opcional.
 *
 * Modos:
 *   - "db-primary"     : sem TYPESENSE_HOST/TYPESENSE_API_KEY → busca direta em Turso (default)
 *   - "typesense"      : env vars definidas e servidor acessível → busca facetada via Typesense
 *   - "db-fallback"    : env vars definidas mas servidor offline → cai para Turso automaticamente
 */

export type SearchMode = "db-primary" | "typesense" | "db-fallback";

export function isTypesenseConfigured(): boolean {
  return !!process.env.TYPESENSE_HOST && !!process.env.TYPESENSE_API_KEY;
}

export function getSearchMode(): SearchMode {
  if (!isTypesenseConfigured()) return "db-primary";
  return "typesense"; // O fallback para "db-fallback" é detetado no runtime da rota de busca
}

export function getSearchModeLabel(mode: SearchMode): string {
  const labels: Record<SearchMode, string> = {
    "db-primary": "Busca direta na BD (Turso)",
    "typesense": "Busca facetada via Typesense",
    "db-fallback": "Busca na BD (fallback do Typesense)",
  };
  return labels[mode];
}
