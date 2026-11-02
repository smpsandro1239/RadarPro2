/** Fixture de TESTE: aproxima a forma de calculateMaxBid; não replica a lógica real (IMT, selo, leiloeira). */
export interface MaxBidInput {
  marketValue: number;
  currentBid: number;
  auctionHouse?: string;
  vpt?: number;
  condominiumDebt: number;
  renovationEstimate: number;
  targetMargin: number;
}
export function calculateMaxBid(i: MaxBidInput) {
  const costsRate = 0.1;
  const raw = (i.marketValue * (1 - i.targetMargin / 100)) / (1 + costsRate) - i.condominiumDebt - i.renovationEstimate;
  const maxBid = Math.max(0, Math.round(raw));
  return {
    maxBid,
    currentBid: i.currentBid,
    headroom: maxBid - i.currentBid,
    currentBidExceedsMax: i.currentBid >= maxBid,
    totalCosts: Math.round(i.currentBid * costsRate),
    commission: Math.round(i.currentBid * 0.04),
    imt: Math.round(i.currentBid * 0.05),
    stampDuty: Math.round(i.currentBid * 0.008),
    auctionHouseConfig: { name: i.auctionHouse ?? "default" },
    vpt: i.vpt ?? null,
  };
}
