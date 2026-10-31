/**
 * RadarPro Portugal - Testes unitários: leilão (auction)
 * Executa com: npx vitest run src/lib/__tests__/valuation/auction.test.ts
 */
import { describe, it, expect } from "vitest";
import { calculateMaxBid, AUCTION_HOUSE_CONFIG } from "../../auction-calculator";
import { evaluateProperty } from "../../valuation/index";

describe("leilão - comparação de casas leiloeiras", () => {
  const MARKET_VALUE = 140_000;
  const CURRENT_BID = 100_000;

  it("e-Leilões (0%) > Leilosoc (5%) > Bidizi (10%) para max_bid", () => {
    const eleiloes = calculateMaxBid({ marketValue: MARKET_VALUE, currentBid: CURRENT_BID, auctionHouse: "e-Leilões" });
    const leilosoc = calculateMaxBid({ marketValue: MARKET_VALUE, currentBid: CURRENT_BID, auctionHouse: "Leilosoc" });
    const bidizi = calculateMaxBid({ marketValue: MARKET_VALUE, currentBid: CURRENT_BID, auctionHouse: "Bidizi" });

    expect(eleiloes.maxBid).toBeGreaterThan(leilosoc.maxBid);
    expect(leilosoc.maxBid).toBeGreaterThan(bidizi.maxBid);
    expect(eleiloes.maxBid).toBe(108_780);
    expect(leilosoc.maxBid).toBe(101_780);
    expect(bidizi.maxBid).toBe(94_780);
  });

  it("comissões configuradas: Leilosoc 5%, Bidizi 10%, e-Leilões 0%", () => {
    expect(AUCTION_HOUSE_CONFIG["Leilosoc"].commissionPct).toBe(5);
    expect(AUCTION_HOUSE_CONFIG["Bidizi"].commissionPct).toBe(10);
    expect(AUCTION_HOUSE_CONFIG["e-Leilões"].commissionPct).toBe(0);
  });
});

describe("leilão - corte de score", () => {
  it("current_bid >= max_bid → score ≤ 30", () => {
    // Leilosoc com marketValue 140.000 → maxBid 101.780. currentBid 110.000 ≥ maxBid.
    const r = evaluateProperty({
      asset_class: "apartment",
      isAuction: true,
      auction_type: "judicial",
      auctionHouse: "Leilosoc",
      marketValue: 140_000,
      currentBid: 110_000,
      maxBid: 101_780,
      vpt: undefined,
    });

    expect(r.engine).toBe("auction");
    expect(r.breakdown.currentBidExceedsMax).toBe(true);
    expect(r.score).toBeLessThanOrEqual(30);
  });
});

describe("leilão - base de tributação max(lance, VPT)", () => {
  it("IMT e selo incidem sobre max(marketValue, VPT)", () => {
    const comVpt = calculateMaxBid({
      marketValue: 100_000,
      currentBid: 50_000,
      auctionHouse: "Leilosoc",
      vpt: 150_000, // VPT > marketValue → base de impostos = 150.000
    });
    const semVpt = calculateMaxBid({
      marketValue: 100_000,
      currentBid: 50_000,
      auctionHouse: "Leilosoc",
      vpt: undefined,
    });

    // Com VPT=150.000: IMT = 150.000*6.5% = 9.750, Selo = 150.000*0.8% = 1.200
    expect(comVpt.imt).toBe(9_750);
    expect(comVpt.stampDuty).toBe(1_200);
    expect(comVpt.vpt).toBe(150_000);

    // Sem VPT: base = marketValue = 100.000 → IMT 6.500, Selo 800
    expect(semVpt.imt).toBe(6_500);
    expect(semVpt.stampDuty).toBe(800);

    // Impostos maiores com VPT alto → maxBid menor
    expect(comVpt.maxBid).toBeLessThan(semVpt.maxBid);
  });
});
