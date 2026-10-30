/**
 * RadarPro Portugal - Testes unitários da calculadora de leilões
 *
 * Valida calculateMaxBid com 3 casas leiloeiras reais:
 * - Leilosoc (comissão 5%)
 * - Bidizi (comissão 10%)
 * - e-Leilões (comissão 0%)
 *
 * Executa com: npx vitest run src/lib/__tests__/auction-calculator.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  calculateMaxBid,
  getCostBreakdownText,
  AUCTION_HOUSE_CONFIG,
  DEFAULT_AUCTION_HOUSE,
} from "../auction-calculator";

describe("AUCTION_HOUSE_CONFIG", () => {
  it("tem comissões corretas para cada casa leiloeira", () => {
    expect(AUCTION_HOUSE_CONFIG["Leilosoc"].commissionPct).toBe(5);
    expect(AUCTION_HOUSE_CONFIG["Bidizi"].commissionPct).toBe(10);
    expect(AUCTION_HOUSE_CONFIG["e-Leilões"].commissionPct).toBe(0);
    expect(AUCTION_HOUSE_CONFIG["Martelo"].commissionPct).toBe(7);
    expect(AUCTION_HOUSE_CONFIG["Estamo"].commissionPct).toBe(5);
  });

  it("tem IMT e selo consistentes", () => {
    for (const [name, config] of Object.entries(AUCTION_HOUSE_CONFIG)) {
      expect(config.imtPct).toBe(6.5);
      expect(config.stampDutyPct).toBe(0.8);
    }
  });
});

describe("calculateMaxBid", () => {
  const MARKET_VALUE = 140_000;
  const CURRENT_BID = 100_000;
  const TARGET_MARGIN = 15;

  it("Leilosoc (5% comissão): max_bid esperado", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "Leilosoc",
      targetMargin: TARGET_MARGIN,
    });

    // Cálculo manual:
    // Valor de mercado: 140.000€
    // Comissão Leilosoc (5%): 7.000€
    // IMT (6.5%): 9.100€
    // Selo (0.8%): 1.120€
    // Total custos reais (sem margem): 7.000 + 9.100 + 1.120 = 17.220€
    // Margem de segurança (15%): 21.000€
    // Max bid: 140.000 - 21.000 - 17.220 = 101.780€
    expect(result.maxBid).toBe(101_780);
    expect(result.currentBidExceedsMax).toBe(false);
    expect(result.headroom).toBe(1_780);
    expect(result.totalCosts).toBe(17_220);
    expect(result.additionalCosts).toBe(0);
    expect(result.commission).toBe(7_000);
    expect(result.imt).toBe(9_100);
    expect(result.stampDuty).toBe(1_120);
  });

  it("Bidizi (10% comissão): max_bid significativamente menor que Leilosoc", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "Bidizi",
      targetMargin: TARGET_MARGIN,
    });

    // Cálculo manual:
    // Comissão Bidizi (10%): 14.000€
    // IMT (6.5%): 9.100€
    // Selo (0.8%): 1.120€
    // Total custos reais (sem margem): 14.000 + 9.100 + 1.120 = 24.220€
    // Margem de segurança (15%): 21.000€
    // Max bid: 140.000 - 21.000 - 24.220 = 94.780€
    expect(result.maxBid).toBe(94_780);
    expect(result.currentBidExceedsMax).toBe(true);
    expect(result.headroom).toBe(-5_220); // currentBid 100.000 > maxBid 94.780
    expect(result.totalCosts).toBe(24_220);
    expect(result.additionalCosts).toBe(0);
    expect(result.commission).toBe(14_000);
  });

  it("e-Leilões (0% comissão): max_bid é o maior dos três", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "e-Leilões",
      targetMargin: TARGET_MARGIN,
    });

    // Cálculo manual:
    // Comissão e-Leilões (0%): 0€
    // IMT (6.5%): 9.100€
    // Selo (0.8%): 1.120€
    // Total custos reais (sem margem): 0 + 9.100 + 1.120 = 10.220€
    // Margem de segurança (15%): 21.000€
    // Max bid: 140.000 - 21.000 - 10.220 = 108.780€
    expect(result.maxBid).toBe(108_780);
    expect(result.commission).toBe(0);
    expect(result.totalCosts).toBe(10_220);
    expect(result.additionalCosts).toBe(0);
  });

  it("e-Leilões max_bid > Leilosoc max_bid > Bidizi max_bid", () => {
    const eleiloes = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "e-Leilões",
      targetMargin: TARGET_MARGIN,
    });
    const leilosoc = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "Leilosoc",
      targetMargin: TARGET_MARGIN,
    });
    const bidizi = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "Bidizi",
      targetMargin: TARGET_MARGIN,
    });

    expect(eleiloes.maxBid).toBeGreaterThan(leilosoc.maxBid);
    expect(leilosoc.maxBid).toBeGreaterThan(bidizi.maxBid);
  });

  it("quando currentBid > maxBid, currentBidExceedsMax é true", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: 110_000, // acima do maxBid de qualquer casa
      auctionHouse: "Leilosoc",
      targetMargin: TARGET_MARGIN,
    });

    expect(result.currentBidExceedsMax).toBe(true);
    expect(result.headroom).toBeLessThan(0);
  });

  it("quando currentBid < maxBid, currentBidExceedsMax é false", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: 80_000, // bem abaixo do maxBid
      auctionHouse: "Bidizi", // tem o maxBid mais baixo (94.780)
      targetMargin: TARGET_MARGIN,
    });

    expect(result.currentBidExceedsMax).toBe(false);
    expect(result.headroom).toBeGreaterThan(0);
  });

  it("DEFAULT_AUCTION_HOUSE usa comissão 5% quando casa não reconhecida", () => {
    const result = calculateMaxBid({
      marketValue: MARKET_VALUE,
      currentBid: CURRENT_BID,
      auctionHouse: "Casa Inexistente", // não está em AUCTION_HOUSE_CONFIG
      targetMargin: TARGET_MARGIN,
    });

    // Deve usar DEFAULT_AUCTION_HOUSE (5% comissão, mesmo que Leilosoc)
    expect(result.auctionHouseConfig.commissionPct).toBe(5);
    expect(result.maxBid).toBe(101_780);
  });

  it("sem custos adicionais (condomínio, renovação, VPT)", () => {
    const result = calculateMaxBid({
      marketValue: 100_000,
      currentBid: 70_000,
      auctionHouse: "e-Leilões",
      targetMargin: 15,
      condominiumDebt: 0,
      renovationEstimate: 0,
      vpt: null,
    });

    // 100.000 - (0 + 6.500 + 800 + 15.000) = 77.700€
    expect(result.maxBid).toBe(77_700);
    expect(result.additionalCosts).toBe(0);
    expect(result.currentBidExceedsMax).toBe(false);
    expect(result.headroom).toBe(7_700);
  });

  it("com custos adicionais (condomínio + renovação)", () => {
    const result = calculateMaxBid({
      marketValue: 100_000,
      currentBid: 70_000,
      auctionHouse: "e-Leilões",
      targetMargin: 15,
      condominiumDebt: 3_000,
      renovationEstimate: 5_000,
      vpt: null,
    });

    // 100.000 - (0 + 6.500 + 800 + 15.000 + 3.000 + 5.000) = 69.700€
    expect(result.maxBid).toBe(69_700);
    expect(result.additionalCosts).toBe(8_000);
    expect(result.headroom).toBe(-300); // 69.700 - 70.000 = -300€
    expect(result.currentBidExceedsMax).toBe(true);
  });

  it("margem de segurança personalizada (20% para leilão judicial)", () => {
    const result15 = calculateMaxBid({
      marketValue: 140_000,
      currentBid: CURRENT_BID,
      auctionHouse: "Leilosoc",
      targetMargin: 15,
    });
    const result20 = calculateMaxBid({
      marketValue: 140_000,
      currentBid: CURRENT_BID,
      auctionHouse: "Leilosoc",
      targetMargin: 20,
    });

    // Margem maior = max_bid menor
    expect(result20.maxBid).toBeLessThan(result15.maxBid);
    // 140.000 - (7.000 + 9.100 + 1.120 + 28.000) = 94.780€
    expect(result20.maxBid).toBe(94_780);
  });

  it("marketValue = 0 → maxBid = 0 sem crash", () => {
    const result = calculateMaxBid({
      marketValue: 0,
      currentBid: 50_000,
      auctionHouse: "Leilosoc",
      targetMargin: 15,
    });

    expect(result.maxBid).toBe(0);
    expect(result.currentBidExceedsMax).toBe(true);
    expect(result.totalCosts).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.imt).toBe(0);
    expect(result.stampDuty).toBe(0);
  });
});

describe("getCostBreakdownText", () => {
  it("inclui todos os custos na explicação", () => {
    const result = calculateMaxBid({
      marketValue: 140_000,
      currentBid: 100_000,
      auctionHouse: "Leilosoc",
      targetMargin: 15,
    });

    const lines = getCostBreakdownText(result);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((l) => l.includes("Comissão da leiloeira"))).toBe(true);
    expect(lines.some((l) => l.includes("IMT"))).toBe(true);
    expect(lines.some((l) => l.includes("Imposto do Selo"))).toBe(true);
    expect(lines.some((l) => l.includes("Lance máximo recomendado"))).toBe(true);
    expect(lines.some((l) => l.includes("780€"))).toBe(true);
  });
});
