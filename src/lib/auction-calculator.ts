/**
 * RadarPro Portugal - Calculadora de Lance Máximo para Leilões
 *
 * Calcula o lance máximo sustentável para um imóvel em leilão,
 * considerando margem de segurança, VPT, dívidas de condomínio,
 * custos de renovação, comissão da leiloeira, IMT e Imposto do Selo.
 */

export interface AuctionHouseConfig {
  name: string;
  commissionPct: number; // comissão da leiloeira (%)
  imtPct: number; // IMT estimado (%)
  stampDutyPct: number; // Imposto do Selo (%)
}

export const AUCTION_HOUSE_CONFIG: Record<string, AuctionHouseConfig> = {
  "Leilosoc": { name: "Leilosoc", commissionPct: 5, imtPct: 6.5, stampDutyPct: 0.8 },
  "Martelo": { name: "Martelo", commissionPct: 7, imtPct: 6.5, stampDutyPct: 0.8 },
  "Bidizi": { name: "Bidizi", commissionPct: 10, imtPct: 6.5, stampDutyPct: 0.8 },
  "e-Leilões": { name: "e-Leilões", commissionPct: 0, imtPct: 6.5, stampDutyPct: 0.8 },
  "Estamo": { name: "Estamo", commissionPct: 5, imtPct: 6.5, stampDutyPct: 0.8 },
};

export const DEFAULT_AUCTION_HOUSE: AuctionHouseConfig = {
  name: "Outra",
  commissionPct: 5,
  imtPct: 6.5,
  stampDutyPct: 0.8,
};

export interface AuctionCalculationInputs {
  /** Valor de mercado estimado (AVM ou valor de referência) */
  marketValue: number;
  /** Lance atual no leilão */
  currentBid: number;
  /** Nome da leiloeira (para lookup de comissão) */
  auctionHouse?: string;
  /** Valor Patrimonial Tributário (opcional) */
  vpt?: number;
  /** Dívida de condomínio em atraso (opcional) */
  condominiumDebt?: number;
  /** Estimativa de custos de renovação/obras (opcional) */
  renovationEstimate?: number;
  /** Margem de segurança alvo (default: 15%) */
  targetMargin?: number;
}

export interface AuctionCalculationResult {
  /** Lance máximo recomendado */
  maxBid: number;
  /** Lance atual */
  currentBid: number;
  /** Margem de segurança em % */
  marginPct: number;
  /** Valor de mercado */
  marketValue: number;
  /** Custos totais adicionais (comissão + IMT + selo + condomínio + renovação) */
  totalCosts: number;
  /** Custos adicionais (condomínio + renovação) */
  additionalCosts: number;
  /** Comissão da leiloeira em € */
  commission: number;
  /** IMT estimado em € */
  imt: number;
  /** Imposto do Selo em € */
  stampDuty: number;
  /** Dívida de condomínio */
  condominiumDebt: number;
  /** Custos de renovação */
  renovationEstimate: number;
  /** VPT usado no cálculo */
  vpt: number | null;
  /** Se o lance atual já excede o máximo recomendado */
  currentBidExceedsMax: boolean;
  /** Diferença entre maxBid e currentBid */
  headroom: number;
  /** Configuração da leiloeira usada */
  auctionHouseConfig: AuctionHouseConfig;
}

export function calculateMaxBid(inputs: AuctionCalculationInputs): AuctionCalculationResult {
  const {
    marketValue,
    currentBid,
    auctionHouse,
    vpt = null,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15,
  } = inputs;

  const config = AUCTION_HOUSE_CONFIG[auctionHouse ?? ""] ?? DEFAULT_AUCTION_HOUSE;

  // Custos percentuais aplicados ao valor de mercado
  const commission = Math.round(marketValue * (config.commissionPct / 100));
  const imt = Math.round(marketValue * (config.imtPct / 100));
  const stampDuty = Math.round(marketValue * (config.stampDutyPct / 100));

  const additionalCosts = condominiumDebt + renovationEstimate;
  const totalCosts = commission + imt + stampDuty + additionalCosts;

  // O lance máximo é o valor de mercado menos a margem de segurança,
  // menos todos os custos associados
  const safetyMargin = marketValue * (targetMargin / 100);
  const maxBid = Math.max(0, Math.round(marketValue - safetyMargin - totalCosts));

  const currentBidExceedsMax = currentBid > maxBid;
  const headroom = maxBid - currentBid;
  const marginPct = marketValue > 0 ? Math.round(((maxBid / marketValue) * 100) * 10) / 10 : 0;

  return {
    maxBid,
    currentBid,
    marginPct,
    marketValue,
    totalCosts,
    additionalCosts,
    commission,
    imt,
    stampDuty,
    condominiumDebt,
    renovationEstimate,
    vpt,
    currentBidExceedsMax,
    headroom,
    auctionHouseConfig: config,
  };
}

/**
 * Calcula o preço de arrematação recomendado para leilão judicial,
 * considerando o valor de avaliação do tribunal (AV) quando disponível.
 */
export function calculateJudicialMaxBid({
  auctionValue, // valor de avaliação do tribunal
  marketValue, // valor de mercado livre
  currentBid,
  auctionHouse,
  targetMargin = 20, // margem maior para leilão judicial
}: {
  auctionValue?: number;
  marketValue: number;
  currentBid: number;
  auctionHouse?: string;
  targetMargin?: number;
}) {
  // Em leilão judicial, o preço de referência costuma ser o valor de avaliação
  const referenceValue = auctionValue || marketValue;
  return calculateMaxBid({
    marketValue: referenceValue,
    currentBid,
    auctionHouse,
    targetMargin,
  });
}

/**
 * Retorna o texto explicativo da breakdown de custos para exibição na UI.
 */
export function getCostBreakdownText(result: AuctionCalculationResult): string[] {
  const lines: string[] = [];
  lines.push(`Valor de mercado: ${result.marketValue.toLocaleString("pt-PT")}€`);
  lines.push(`Comissão da leiloeira (${result.auctionHouseConfig.commissionPct}%): -${result.commission.toLocaleString("pt-PT")}€`);
  lines.push(`IMT estimado (${result.auctionHouseConfig.imtPct}%): -${result.imt.toLocaleString("pt-PT")}€`);
  lines.push(`Imposto do Selo (${result.auctionHouseConfig.stampDutyPct}%): -${result.stampDuty.toLocaleString("pt-PT")}€`);
  if (result.condominiumDebt > 0) lines.push(`Dívida condomínio: -${result.condominiumDebt.toLocaleString("pt-PT")}€`);
  if (result.renovationEstimate > 0) lines.push(`Renovação estimada: -${result.renovationEstimate.toLocaleString("pt-PT")}€`);
  lines.push(`Margem de segurança (15%): -${Math.round(result.marketValue * 0.15).toLocaleString("pt-PT")}€`);
  lines.push(`Lance máximo recomendado: ${result.maxBid.toLocaleString("pt-PT")}€`);
  return lines;
}
