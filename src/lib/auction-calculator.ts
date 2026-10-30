/**
 * RadarPro Portugal - Calculadora de Lance Máximo para Leilões
 *
 * Calcula o lance máximo sustentável para um imóvel em leilão,
 * considerando margem de segurança, VPT, dívidas de condomínio e
 * custos de renovação.
 */

export interface AuctionCalculationInputs {
  /** Valor de mercado estimado (AVM ou valor de referência) */
  marketValue: number;
  /** Lance atual no leilão */
  currentBid: number;
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
  /** Custos adicionais (condomínio + renovação) */
  additionalCosts: number;
  /** VPT usado no cálculo */
  vpt: number | null;
  /** Se o lance atual já excede o máximo recomendado */
  currentBidExceedsMax: boolean;
  /** Diferença entre maxBid e currentBid */
  headroom: number;
}

export function calculateMaxBid(inputs: AuctionCalculationInputs): AuctionCalculationResult {
  const {
    marketValue,
    currentBid,
    vpt = null,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15,
  } = inputs;

  const additionalCosts = condominiumDebt + renovationEstimate;

  // O lance máximo é o valor de mercado menos a margem de segurança,
  // menos custos adicionais (condomínio + renovação)
  const safetyMargin = marketValue * (targetMargin / 100);
  const maxBid = Math.max(0, Math.round(marketValue - safetyMargin - additionalCosts));

  const currentBidExceedsMax = currentBid > maxBid;
  const headroom = maxBid - currentBid;
  const marginPct = marketValue > 0 ? Math.round(((maxBid / marketValue) * 100) * 10) / 10 : 0;

  return {
    maxBid,
    currentBid,
    marginPct,
    marketValue,
    additionalCosts,
    vpt,
    currentBidExceedsMax,
    headroom,
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
  targetMargin = 20, // margem maior para leilão judicial
}: {
  auctionValue?: number;
  marketValue: number;
  currentBid: number;
  targetMargin?: number;
}) {
  // Em leilão judicial, o preço de referência costuma ser o valor de avaliação
  const referenceValue = auctionValue || marketValue;
  return calculateMaxBid({
    marketValue: referenceValue,
    currentBid,
    targetMargin,
  });
}
