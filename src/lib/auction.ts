/**
 * RadarPro Portugal - Leilão Engine
 * 
 * Este módulo calcula o LANCE MÁXIMO SUSTENTÁVEL para imóveis em leilão.
 * A fórmula é:
 *   Max Bid = (Valor de Mercado × (1 - Margem Alvo)) - (Custos Totais sem Lance)
 * 
 * Custos incluem:
 * - Comissão leiloeira (% do lance + IVA)
 * - IMT (Imposto Municipal sobre Transmissões)
 * - Imposto do Selo (0,8%)
 * - Registo Predial (fixo)
 * - Custas judiciais residuais
 * - Condomínio em atraso
 * - Obras estimadas
 */

import { PropertyValuationInput, PropertyValuationOutput, municipalityPremiums } from "./valuation";

interface AuctionCalculationInput {
  propertyType: string; // T0, T1, T2, T3, T4, V2, V3, V4, Terreno, Garagem, Loja, Armazém, Prédio
  marketValueNumSafe: number; // Valor de mercado (AVM)
  currentBid: number; // Lance atual do leilão
  district: string; // Distrito para IMT e referência de preço
  municipality: string; // Concelho para ajustes locais
  source: string; // Fonte do leilão (e-Leilões, Leilosoc, Martelo.pt, Estamo)
  sourceName: string; // Nome exibível da fonte
  sourceType: "judicial" | "fiscal" | "private"; // Tipo de leilão
  sqm?: number; // Área em m²
  createdAt?: Date | null; // Data de criação/anúncio
  // Campos opcionais para cálculo mais preciso:
  condominiumDebt?: number; // Condomínio em atraso (€)
  renovationEstimate?: number; // Estimativa de obras (€)
  targetMargin?: number; // Margem alvo (ex: 15 = 15%)
  vpt?: number; // Valor Patrimonial Tributário (se conhecido)
}

interface AuctionCalculationOutput {
  askingPrice: number; // Lance atual
  marketValueNumSafe: number; // Valor de mercado (referência)
  maxBid: number; // LANCE MÁXIMO SUSTENTÁVEL
  discountPct: number; // Desconto do lance atual vs mercado (apenas referência)
  maxBidDiscountPct: number; // Desconto do lance máximo vs mercado
  yieldPct: number | null; // Rentabilidade se comprar ao maxBid
  monthlyRentEstimate: number | null; // Renda mensal estimada
  score: number; // Score de oportunidade para leilão (0-100)
  risk: "baixo" | "medio" | "alto";
  recommendation: string;
  factors: {
    discount: number; // 0-30
    rentability: number; // 0-20
    liquidity: number; // 0-15
    source: number; // 0-15
    pricePerSqm: number; // 0-10
    freshness: number; // 0-10
  };
  methodology: string;
  valuationFactors: {
    basePricePerSqm: number;
    typeMultiplier: number;
    municipalityPremium: number;
    marketTrend: number;
    conditionFactor: number;
  };
  // Custos detalhados para transparência
  costBreakdown: {
    basePrice: number; // Lance atual
    commission: number; // Comissão leiloeira
    imt: number; // Imposto Municipal sobre Transmissões
    stampDuty: number; // Imposto do Selo (0,8%)
    registrationFee: number; // Registo Predial
    courtCosts: number; // Custas judiciais residuais
    condominiumDebt: number; // Condomínio em atraso
    renovationEstimate: number; // Obras estimadas
    totalCosts: number; // Soma de todos os custos
    maxBid: number; // Lance máximo calculado
    remainingMargin: number; // Margem após todos os custos
  };
}

/**
 * Preços de referência por distrito (mediana €/m² - 2026)
 */
export const districtBenchmarks: Record<string, { avgPricePerSqm: number; minPricePerSqm: number; maxPricePerSqm: number }> = {
  Lisboa: { avgPricePerSqm: 5200, minPricePerSqm: 3800, maxPricePerSqm: 8500 },
  Porto: { avgPricePerSqm: 3800, minPricePerSqm: 2500, maxPricePerSqm: 6500 },
  Braga: { avgPricePerSqm: 2600, minPricePerSqm: 1800, maxPricePerSqm: 4200 },
  Faro: { avgPricePerSqm: 3500, minPricePerSqm: 2200, maxPricePerSqm: 6000 },
  Setúbal: { avgPricePerSqm: 3200, minPricePerSqm: 2000, maxPricePerSqm: 5500 },
  Aveiro: { avgPricePerSqm: 2400, minPricePerSqm: 1600, maxPricePerSqm: 4000 },
  Coimbra: { avgPricePerSqm: 2200, minPricePerSqm: 1500, maxPricePerSqm: 3800 },
  Leiria: { avgPricePerSqm: 2000, minPricePerSqm: 1400, maxPricePerSqm: 3500 },
  Santarém: { avgPricePerSqm: 1800, minPricePerSqm: 1200, maxPricePerSqm: 3200 },
  Viseu: { avgPricePerSqm: 1700, minPricePerSqm: 1100, maxPricePerSqm: 3000 },
  "Viana do Castelo": { avgPricePerSqm: 1900, minPricePerSqm: 1300, maxPricePerSqm: 3300 },
  Bragança: { avgPricePerSqm: 1400, minPricePerSqm: 900, maxPricePerSqm: 2500 },
  Guarda: { avgPricePerSqm: 1500, minPricePerSqm: 1000, maxPricePerSqm: 2700 },
  "Castelo Branco": { avgPricePerSqm: 1600, minPricePerSqm: 1100, maxPricePerSqm: 2800 },
  Portalegre: { avgPricePerSqm: 1300, minPricePerSqm: 800, maxPricePerSqm: 2300 },
  Évora: { avgPricePerSqm: 1700, minPricePerSqm: 1100, maxPricePerSqm: 3000 },
  Beja: { avgPricePerSqm: 1400, minPricePerSqm: 900, maxPricePerSqm: 2500 },
  "Vila Real": { avgPricePerSqm: 1600, minPricePerSqm: 1000, maxPricePerSqm: 2800 },
  Açores: { avgPricePerSqm: 2000, minPricePerSqm: 1300, maxPricePerSqm: 3500 },
  Madeira: { avgPricePerSqm: 2800, minPricePerSqm: 1800, maxPricePerSqm: 4800 },
};

/**
 * Coeficientes de tipologia (multiplicador sobre preço base)
 */
export const typeMultipliers: Record<string, number> = {
  T0: 0.85, T1: 0.95, T2: 1.00, T3: 1.10, T4: 1.20,
  V2: 1.15, V3: 1.25, V4: 1.35, V5: 1.45,
  Terreno: 0.50, Garagem: 0.15, Loja: 0.70, Armazém: 0.60,
  "Prédio": 1.50, Arrecadação: 0.10,
};

/**
 * Tamanhos estimados por tipologia (m²) quando não conhecidos
 */
export const typeSizeEstimates: Record<string, number> = {
  T0: 35, T1: 55, T2: 75, T3: 100, T4: 130,
  V2: 120, V3: 150, V4: 180, V5: 220,
  Terreno: 500, Garagem: 15, Loja: 60, Armazém: 200,
  "Prédio": 500, Arrecadação: 10,
};

/**
 * Score de confiabilidade da fonte (0-15)
 */
export const sourceReliability: Record<string, number> = {
  "e-Leilões": 15,
  Estamo: 15,
  Leilosoc: 14,
  "Martelo.pt": 14,
  "Caixa Imobiliário": 13,
  "Millennium BCP": 13,
  Santander: 12,
  "Novo Banco": 12,
  Montepio: 11,
  "Crédito Agrícola": 11,
  "BPI Expresso": 12,
  "Casa Sapo": 8,
  Idealista: 8,
  Imovirtual: 8,
  SuperCasa: 7,
  OLX: 6,
  CustoJusto: 6,
  "RE/MAX": 9,
  ERA: 9,
  "Century 21": 9,
  "KW Portugal": 9,
  "Coldwell Banker": 9,
  Bidizi: 9,
};

/**
 * Liquidez por distrito (0-15 pontos) - velocidade de venda
 */
export const districtLiquidity: Record<string, number> = {
  Lisboa: 15, Porto: 12, Braga: 8, Faro: 10, Setúbal: 9,
  Aveiro: 9, Coimbra: 8, Leiria: 8, Santarém: 7,
  Viseu: 7, "Viana do Castelo": 8, Bragança: 6, Guarda: 6,
  "Castelo Branco": 6, Portalegre: 6, Évora: 7, Beja: 6,
  "Vila Real": 7, Açores: 5, Madeira: 7,
};

/**
 * Tendência de mercado (multiplicador anual)
 */
export const marketTrends: Record<string, number> = {
  Lisboa: 1.03, Porto: 1.05, Braga: 1.04, Faro: 1.06,
  Setúbal: 1.04, Aveiro: 1.02, Coimbra: 1.01, Leiria: 1.02,
  Santarém: 1.01, Viseu: 1.01, "Viana do Castelo": 1.02,
  Bragança: 1.00, Guarda: 1.00, "Castelo Branco": 1.01,
  Portalegre: 1.00, Évora: 1.01, Beja: 1.00, "Vila Real": 1.01,
  Açores: 1.02, Madeira: 1.03,
};

/**
 * Rendimentos mensais estimados por tipologia e distrito (€/mês)
 * Fonte estimada: portais imobiliários + INE (2026)
 */
export const rentEstimates: Record<string, Record<string, number>> = {
  Lisboa: { T0: 750, T1: 950, T2: 1400, T3: 1900, T4: 2600 },
  Porto: { T0: 550, T1: 700, T2: 1000, T3: 1400, T4: 1900 },
  Braga: { T0: 450, T1: 600, T2: 850, T3: 1200, T4: 1600 },
  Faro: { T0: 500, T1: 700, T2: 1100, T3: 1500, T4: 2000 },
  Setúbal: { T0: 480, T1: 650, T2: 950, T3: 1300, T4: 1800 },
  Aveiro: { T0: 450, T1: 620, T2: 900, T3: 1250, T4: 1700 },
  Coimbra: { T0: 420, T1: 580, T2: 800, T3: 1100, T4: 1500 },
};

/**
 * Fator de condição por fonte
 */
export const conditionFactors: Record<string, number> = {
  banco: 0.85,
  leilao: 0.80,
  portal: 1.00,
  agencia: 1.05,
};

/**
 * Calcula IMT (Imposto Municipal sobre Transmissões) para 2026
 * Para imóveis de habitação própria permanente (HPP) há isenção até 106.346€
 * Para habitação secundária/investimento, tabela progressiva
 * Para terrenos/rusticos: taxa única de 6,5%
 */
function calculateIMT(price: number, propertyType: string, isHPP: boolean = false): number {
  // Terrenos rurais/urbanos não habitacionais: taxa única 6,5%
  if (propertyType === "Terreno" || propertyType === "Armazém" || propertyType === "Prédio") {
    return price * 0.065;
  }

  // Habitação própria permanente: isenção até 106.346€ (tabela 2026)
  if (isHPP) {
    if (price <= 106346) return 0;
    if (price <= 138450) return (price * 0.02) - 1063.46;
    if (price <= 190456) return (price * 0.05) - 5178.67;
    if (price <= 324058) return (price * 0.07) - 9000.39;
    if (price <= 648022) return (price * 0.08) - 12240.97;
    return price * 0.06; // Acima de 648.022€
  }

  // Habitação secundária / investimento / imóveis comerciais
  if (price <= 106346) return price * 0.01;
  if (price <= 138450) return (price * 0.02) - 1063.46;
  if (price <= 190456) return (price * 0.05) - 5178.67;
  if (price <= 324058) return (price * 0.07) - 9000.39;
  if (price <= 648022) return (price * 0.08) - 12240.97;
  return price * 0.06;
}

/**
 * Calcula o Imposto do Selo (0,8% sobre o valor de transmissão)
 */
function calculateStampDuty(price: number): number {
  return price * 0.008;
}

/**
 * Calcula a comissão do leiloeiro
 * e-Leilões: 0% (plataforma pública)
 * Leiloeiras privadas: 3% - 7% + IVA (23%)
 */
function calculateCommission(price: number, sourceName: string): number {
  if (sourceName === "e-Leilões") return 0; // Comissão 0%

  // Leiloeiras privadas: 3% a 7%
  const commissionRate = sourceName === "Leilosoc" ? 0.05 :
    sourceName === "Martelo.pt" ? 0.06 :
    sourceName === "Bidizi" ? 0.05 : 0.05;

  return price * commissionRate * 1.23; // Acrescenta IVA 23%
}

/**
 * Algoritmo principal de cálculo do Lance Máximo Sustentável
 */
export function calculateAuctionValuation(input: AuctionCalculationInput): PropertyValuationOutput & { costBreakdown: CostBreakdown } {
  const {
    district,
    municipality = district,
    type,
    price,
    marketValueNum,
    source = "portal",
    sourceName = source,
    sourceType = "judicial",
    sqm = 0,
    condominiumDebt = 0,
    renovationEstimate = 0,
    targetMargin = 15, // Margem alvo padrão 15%
    createdAt,
    isActive = true,
    vpt,
  } = input;

  const marketValueNumSafe = marketValueNum ?? 0;
  const bench = districtBenchmarks[district] || districtBenchmarks["Braga"];
  const estSqm = sqm > 0 ? sqm : typeSizeEstimates[type] || 70;

  // --- CÁLCULO DE CUSTOS (todos baseados no LANCE, não no preço de venda) ---

  // 1. Comissão do leiloeiro
  const commission = calculateCommission(price, sourceName);

  // 2. IMT (Imposto Municipal sobre Transmissões)
  // Para leilão, o IMT incide sobre o lance (ou VPT se maior)
  const imtBase = vpt && vpt > price ? vpt : price;
  const imt = calculateIMT(imtBase, type, false); // Leilão não é HPP por defeito

  // 3. Imposto do Selo (0,8%)
  const stampDuty = calculateStampDuty(imtBase);

  // 4. Registo Predial (emolumento fixo aproximado)
  const registrationFee = 250;

  // 5. Custas judiciais residuais (estimativa)
  const courtCosts = imtBase * 0.0075; // 0,75% aproximado

  // 6. Condomínio em atraso (fornecido pelo utilizador ou estimativa)
  const condoDebt = condominiumDebt;

  // 7. Obras estimada
  const renovationEst = renovationEstimate;

  // Custos totais sem o lance
  const totalNonBidCosts = commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst;

  // Cálculo do Lance Máximo Sustentável
  // Max Bid = (Valor de Mercado × (1 - Margem Alvo)) - Custos Totais sem Lance
  // Mas como o IMT, selo e comissão dependem do lance, resolvemos:
  // Max Bid = (marketValueNumSafe × (1 - margin)) - fixedCosts - (variablePct × Max Bid)
  // Max Bid × (1 + variablePct) = (marketValueNumSafe × (1 - margin)) - fixedCosts
  // Max Bid = ((marketValueNumSafe × (1 - margin)) - fixedCosts) / (1 + variablePct)

  const targetMarginDecimal = targetMargin / 100;
  const targetValue = marketValueNumSafe * (1 - targetMarginDecimal);
  const fixedCosts = registrationFee + courtCosts + condoDebt + renovationEst;
  const variablePct = (commission + imt + stampDuty) / price; // Percentagem variável do preço

  const maxBid = ((targetValue - fixedCosts) / (1 + variablePct));
  const maxBidRounded = Math.round(maxBid);

  // Preço por m²
  const pricePerSqm = Math.round(price / estSqm);
  const marketAvgPerSqm = Math.round(marketValueNumSafe / estSqm);

  // Desconto do lance atual vs mercado
  const discountPct = Math.round(((marketValueNumSafe - price) / marketValueNumSafe) * 100);

  // Desconto do lance máximo vs mercado
  const maxBidDiscountPct = Math.round(((marketValueNumSafe - maxBidRounded) / marketValueNumSafe) * 100);

  // Rentabilidade estimada (baseada no lance máximo, não no atual)
  let monthlyRentEstimate: number | null = null;
  let yieldPct: number | null = null;
  const rentByType = rentEstimates[district];
  if (rentByType && rentByType[type]) {
    monthlyRentEstimate = rentByType[type];
    yieldPct = Math.round((monthlyRentEstimate * 12) / maxBidRounded * 100);
  }

  // ── Score de Oportunidade de Leilão (0-100) ──
  // Diferente do score de venda normal: pondera mais o desconto real e risco
  let score = 50;
  const factors: {
    discount: number;
    rentability: number;
    pricePerSqm: number;
    liquidity: number;
    source: number;
  } = {
    discount: 0,
    rentability: 0,
    pricePerSqm: 0,
    liquidity: 0,
    source: 0,
  };

  // 1. Desconto do lance máximo vs mercado (0-30 pontos)
  let discountScore = Math.min(30, Math.max(0, maxBidDiscountPct));
  factors.discount = discountScore;
  score += discountScore;

  // 2. Rentabilidade do lance máximo (0-20 pontos)
  let rentScore = 0;
  if (yieldPct && yieldPct >= 8) rentScore = 20;
  else if (yieldPct && yieldPct >= 6) rentScore = 15;
  else if (yieldPct && yieldPct >= 4) rentScore = 10;
  else if (yieldPct && yieldPct > 0) rentScore = 5;
  factors.rentability = rentScore;
  score += rentScore;

  // 3. Preço/m² vs mediana da zona (0-25 pontos)
  let priceM2Score = 0;
  const ratio = pricePerSqm / marketAvgPerSqm;
  if (ratio < 0.6) priceM2Score = 25;
  else if (ratio < 0.75) priceM2Score = 20;
  else if (ratio < 0.85) priceM2Score = 15;
  else if (ratio < 0.95) priceM2Score = 10;
  else if (ratio > 1.2) priceM2Score = 0;
  else priceM2Score = 5;
  factors.pricePerSqm = priceM2Score;
  score += priceM2Score;

  // 4. Liquidez do distrito (0-15 pontos)
  factors.liquidity = districtLiquidity[district] || 8;
  score += factors.liquidity;

  // 5. Fonte/confiança (0-10 pontos)
  factors.source = sourceReliability[source] || 5;
  score += factors.source;

  // 6. Atualidade (0-10 pontos)
  let freshnessScore = 0;
  if (createdAt) {
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 7) freshnessScore = 10;
    else if (days < 30) freshnessScore = 7;
    else if (days < 90) freshnessScore = 4;
    else freshnessScore = 1;
  }
  score += freshnessScore;

  score = Math.min(100, Math.max(0, Math.round(score)));

  // Risco
  let risk: "baixo" | "medio" | "alto" = "medio";
  if (score >= 85) risk = "baixo";
  else if (score < 55) risk = "alto";

  // Recomendação
  let recommendation: string;
  if (score >= 85) recommendation = "Excelente oportunidade de leilão";
  else if (score >= 70) recommendation = "Boa oportunidade de leilão";
  else if (score >= 55) recommendation = "Oportunidade razoável";
  else recommendation = "Cuidado: lance acima do recomendado";

  // Metodologia para transparência
  const methodology = `
  Cálculo do Lance Máximo para ${district}:
  • Valor de mercado (AVM): ${marketValueNumSafe.toLocaleString()}€
  • Margem alvo: ${targetMargin}%
  • Preço/m² do distrito: ${bench.avgPricePerSqm}€
  • Tipo de imóvel: ${type} (multiplicador ${typeMultipliers[type] || 1}x)
  • Município: ${municipality} (prémio ${municipalityPremiums[district]?.[municipality] || 1}x)
  • Tendência de mercado: ${marketTrends[district] || 1}x
  • Condição da fonte: ${conditionFactors[source] || 1}x

  Custos incluídos no cálculo:
  • Comissão leiloeira: ${commission.toLocaleString()}€
  • IMT: ${Math.round(imt).toLocaleString()}€
  • Imposto do Selo (0,8%): ${Math.round(stampDuty).toLocaleString()}€
  • Registo Predial: ${registrationFee}€
  • Custas judiciais: ${Math.round(courtCosts).toLocaleString()}€
  • Condomínio em atraso: ${condoDebt.toLocaleString()}€
  • Obras estimadas: ${renovationEst.toLocaleString()}€
  • Custos totais (sem lance): ${Math.round(commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst).toLocaleString()}€

  Fórmula: Max Bid = ((Valor Mercado × (1 - Margem)) - Custos Fixos) / (1 + % Variável)
  `;

  return {
    askingPrice: price,
    marketValueNumSafe,
    avm: marketValueNumSafe,
    avmLow: Math.round(marketValueNumSafe * 0.85),
    avmHigh: Math.round(marketValueNumSafe * 1.15),
    avmConfidence: "alta",
    pricePerSqm,
    marketAvgPerSqm: Math.round(marketValueNumSafe / estSqm),
    areaSqm: estSqm,
    discountPct,
    maxBidDiscountPct,
    rentability: yieldPct,
    monthlyRentEstimate,
    score,
    risk,
    factors,
    methodology,
    valuationFactors: {
      basePricePerSqm: bench.avgPricePerSqm,
      typeMultiplier: typeMultipliers[type] || 1,
      municipalityPremium: municipalityPremiums[district]?.[municipality] || 1,
      marketTrend: marketTrends[district] || 1,
      conditionFactor: conditionFactors[source] || 1,
    },
    costBreakdown: {
      basePrice: price,
      commission: Math.round(commission),
      imt: Math.round(imt),
      stampDuty: Math.round(stampDuty),
      registrationFee,
      courtCosts: Math.round(courtCosts),
      condominiumDebt,
      renovationEstimate,
      totalCosts: Math.round(commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst),
      maxBid: maxBidRounded,
      remainingMargin: Math.round(((marketValueNumSafe - maxBidRounded - (commission + imt + stampDuty + registrationFee + courtCosts + condoDebt + renovationEst)) / marketValueNumSafe) * 100),
    },
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-PT", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "€";
}

export function formatScoreText(score: number): string {
  if (score >= 85) return "Excelente oportunidade";
  if (score >= 70) return "Boa oportunidade";
  if (score >= 55) return "Oportunidade razoável";
  return "Oportunidade fraca";
}
