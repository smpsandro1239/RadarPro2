/**
 * RadarPro Portugal - Simulador de custos de aquisicao (custos reais de compra).
 *
 * Valores publicos (taxa do IMT por escalas de valores declarados; imposto do
 * selo de 0,8%; estimativas de honorarios notariais). Nao sao dados de mercado,
 * sao taxas oficiais usadas na simulacao.
 */

export interface AcquisitionCosts {
  imt: number;
  selo: number;
  escritura: number;
  registro: number;
  comissao: number;
  total: number;
}

export interface AcquisitionCostsInput {
  /** Valor declarado / preco de compra (EUR). */
  price: number;
  /** Percentagem de comissao de mediação (default 0 = sem comissao). */
  comissaoPct?: number;
}

interface Bracket {
  to: number;
  rate: number;
}

const IMT_BRACKETS: Bracket[] = [
  { to: 100000, rate: 0 },
  { to: 150000, rate: 0.015 },
  { to: 250000, rate: 0.045 },
  { to: 350000, rate: 0.06 },
  { to: 500000, rate: 0.075 },
  { to: 1000000, rate: 0.085 },
  { to: 2000000, rate: 0.095 },
];
const IMT_TOP_RATE = 0.10;
const SELO_RATE = 0.008;
const ESCRITURA_RATE = 0.015;
const REGISTRO_RATE = 0.005;

export function calculateIMT(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  const value = Math.min(price, 2000000);
  const topBracket = IMT_BRACKETS[IMT_BRACKETS.length - 1];
  const tax = IMT_BRACKETS.reduce((acc, b, i) => {
    const lower = i === 0 ? 0 : IMT_BRACKETS[i - 1].to;
    const upper = Math.min(value, b.to);
    const portion = Math.max(0, upper - lower);
    return acc + portion * b.rate;
  }, 0);
  const topPortion = Math.max(0, value - topBracket.to);
  const topTax = topPortion * IMT_TOP_RATE;
  return Math.round((tax + topTax) * 100) / 100;
}

export function calculateAcquisitionCosts(input: AcquisitionCostsInput): AcquisitionCosts {
  const price = Number.isFinite(input.price) ? input.price : 0;
  const imt = calculateIMT(price);
  const selo = price * SELO_RATE;
  const escritura = price * ESCRITURA_RATE;
  const registro = price * REGISTRO_RATE;
  const comissao = price * (input.comissaoPct ?? 0) / 100;
  const total = imt + selo + escritura + registro + comissao;
  return {
    imt: Math.round(imt * 100) / 100,
    selo: Math.round(selo * 100) / 100,
    escritura: Math.round(escritura * 100) / 100,
    registro: Math.round(registro * 100) / 100,
    comissao: Math.round(comissao * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
