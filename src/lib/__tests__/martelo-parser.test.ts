import { describe, expect, it } from "vitest";
import {
  detectAuctionType,
  detectPlaceholder,
  extractRssItems,
  isPropertyEvent,
  mapAuctionHouse,
  mapMarteloEvent,
  type MarteloEvent,
} from "@/lib/martelo-parser";

const FULL_EVENT: MarteloEvent = {
  reference: "LEIL_LEILOSOC_167827",
  titulo: "Moradia · Cadima, Cantanhede",
  tipo: "Imóvel",
  subtipo: "Moradia",
  tipologia: null,
  valor_base: 149800,
  lance_atual: 75000,
  valor_abertura: 75000,
  data_fim: "2026-11-03T08:59:59",
  distrito: "Coimbra",
  concelho: "Cantanhede",
  freguesia: "Cadima",
  area_util: 136,
  area_privativa: 140,
  area_efetiva: 136,
  piso: "2º andar",
  source: "leilosoc",
  source_url: "https://leilosoc.com/pt-PT/lot/45473/167827-moradia-cadima-cantanhede/",
  tipo_processo: "execução",
  latitude: 40.3439,
  longitude: -8.66954,
  gps_approximate: false,
  tags: [{ slug: "origem-judicial" }],
};

describe("parser do canal oficial Martelo.pt", () => {
  it("mapeia um evento completo para a linha interna", () => {
    const row = mapMarteloEvent(FULL_EVENT);

    expect(row.id).toBe("martelo-leil_leilosoc_167827");
    expect(row.source).toBe("martelo");
    expect(row.sourceName).toBe("Martelo.pt");
    expect(row.url).toBe(FULL_EVENT.source_url);
    expect(row.district).toBe("Coimbra");
    expect(row.municipality).toBe("Cantanhede");
    expect(row.parish).toBe("Cadima");
    expect(row.type).toBe("Moradia");
    expect(row.price).toBe(75000);
    expect(row.currentBid).toBe(75000);
    expect(row.reservePrice).toBe(149800);
    expect(row.areaSqm).toBe(136);
    expect(row.floor).toBe(2);
    expect(row.isAuction).toBe(true);
    expect(row.auctionType).toBe("judicial");
    expect(row.auctionHouse).toBe("Leilosoc");
    expect(row.lat).toBe(40.3439);
    expect(row.lng).toBe(-8.66954);
    expect(row.geoQuality).toBe("exact");
  });

  it("usa a area da primeira fonte disponivel (util, privativa, efetiva)", () => {
    expect(mapMarteloEvent({ ...FULL_EVENT, area_util: null }).areaSqm).toBe(140);
    expect(mapMarteloEvent({ ...FULL_EVENT, area_util: null, area_privativa: null }).areaSqm).toBe(136);
    expect(mapMarteloEvent({ ...FULL_EVENT, area_util: null, area_privativa: null, area_efetiva: null }).areaSqm).toBeNull();
  });

  it("ignora areas a zero e usa a primeira area valida", () => {
    expect(mapMarteloEvent({ ...FULL_EVENT, area_util: 0 }).areaSqm).toBe(140);
    expect(mapMarteloEvent({ ...FULL_EVENT, area_util: 0, area_privativa: 0 }).areaSqm).toBe(136);
  });

  it("em leiloes sem lance usa o valor de abertura e deixa o current_bid a null", () => {
    const row = mapMarteloEvent({ ...FULL_EVENT, lance_atual: 0, valor_abertura: 10000, valor_base: 20000 });
    expect(row.currentBid).toBeNull();
    expect(row.price).toBe(10000);
    expect(row.reservePrice).toBe(20000);
  });

  it("acrescenta a tipologia ao tipo quando e uma tipologia valida", () => {
    expect(mapMarteloEvent({ ...FULL_EVENT, subtipo: "Apartamento", tipologia: "T3" }).type).toBe("Apartamento T3");
    expect(mapMarteloEvent({ ...FULL_EVENT, tipologia: "T6 ou superior" }).type).toBe("Moradia T6");
    expect(mapMarteloEvent({ ...FULL_EVENT, tipologia: "não aplicável" }).type).toBe("Moradia");
    expect(mapMarteloEvent({ ...FULL_EVENT, tipologia: null }).type).toBe("Moradia");
  });

  it("converte a data de fim para epoch ms na hora de Lisboa", () => {
    const row = mapMarteloEvent(FULL_EVENT);
    expect(row.auctionEndDate).toBe(Date.UTC(2026, 10, 3, 8, 59, 59));
  });

  it("converte o piso textual para numero", () => {
    expect(mapMarteloEvent({ ...FULL_EVENT, piso: "1º andar" }).floor).toBe(1);
    expect(mapMarteloEvent({ ...FULL_EVENT, piso: "r/c" }).floor).toBe(0);
    expect(mapMarteloEvent({ ...FULL_EVENT, piso: "cave" }).floor).toBe(-1);
    expect(mapMarteloEvent({ ...FULL_EVENT, piso: "3º" }).floor).toBe(3);
    expect(mapMarteloEvent({ ...FULL_EVENT, piso: null }).floor).toBeNull();
  });

  it("deteta a origem do leilao pelas tags e pelo processo", () => {
    expect(detectAuctionType({ ...FULL_EVENT, tags: [{ slug: "origem-fiscal" }] })).toBe("fiscal");
    expect(detectAuctionType({ ...FULL_EVENT, tags: [{ slug: "origem-insolvência" }] })).toBe("judicial");
    expect(detectAuctionType({ ...FULL_EVENT, tags: [{ slug: "origem-outra" }] })).toBeNull();
    expect(detectAuctionType({ ...FULL_EVENT, tags: null, tipo_processo: "Insolvência pessoa singular (Requerida)" })).toBe(
      "judicial",
    );
    expect(detectAuctionType({ ...FULL_EVENT, tags: null, tipo_processo: null })).toBeNull();
  });

  it("usa o nome canonico da casa de leilao", () => {
    expect(mapAuctionHouse("leilosoc")).toBe("Leilosoc");
    expect(mapAuctionHouse("eleiloes")).toBe("e-Leilões");
    expect(mapAuctionHouse("Leilosoc")).toBe("Leilosoc");
    expect(mapAuctionHouse(null)).toBe("Outra");
    expect(mapAuctionHouse("casa nova")).toBe("casa nova");
  });

  it("marca como imovel apenas os eventos do tipo Imovel", () => {
    expect(isPropertyEvent(FULL_EVENT)).toBe(true);
    expect(isPropertyEvent({ ...FULL_EVENT, tipo: "Veículo" })).toBe(false);
    expect(isPropertyEvent({ ...FULL_EVENT, tipo: "Equipamento" })).toBe(false);
    expect(isPropertyEvent({ ...FULL_EVENT, tipo: "Direito" })).toBe(false);
    expect(isPropertyEvent({ ...FULL_EVENT, tipo: undefined })).toBe(false);
  });

  it("deixa null o que a API nao traz", () => {
    const row = mapMarteloEvent({
      reference: "X1",
      titulo: "Terreno",
      tipo: "Imóvel",
      subtipo: "Terreno Construção",
      lance_atual: 1000,
    });
    expect(row.district).toBeNull();
    expect(row.municipality).toBeNull();
    expect(row.parish).toBeNull();
    expect(row.areaSqm).toBeNull();
    expect(row.auctionType).toBeNull();
    expect(row.auctionEndDate).toBeNull();
    expect(row.reservePrice).toBeNull();
    expect(row.geoQuality).toBe("NA");
  });
});

describe("feed RSS do Estamo", () => {
  const XML = `<?xml version="1.0"?>
    <rss><channel>
      <item>
        <title><![CDATA[Moradia T3 em Lisboa]]></title>
        <link>https://www.estamo.pt/imovel/1</link>
        <description><![CDATA[150 m2, 3 quartos]]></description>
      </item>
      <item>
        <title>Apartamento T2 no Porto</title>
        <link>https://www.estamo.pt/imovel/2</link>
        <description>Exemplo: lorem ipsum dolor sit amet</description>
      </item>
    </channel></rss>`;

  it("extrai titulo, link e descricao de cada item", () => {
    const items = extractRssItems(XML);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      title: "Moradia T3 em Lisboa",
      link: "https://www.estamo.pt/imovel/1",
      description: "150 m2, 3 quartos",
    });
    expect(items[1].title).toBe("Apartamento T2 no Porto");
  });

  it("reconhece conteudo de exemplo", () => {
    const items = extractRssItems(XML);
    expect(detectPlaceholder(`${items[0].title} ${items[0].description}`)).toBe(false);
    expect(detectPlaceholder(`${items[1].title} ${items[1].description}`)).toBe(true);
    expect(detectPlaceholder("Nome do empreendimento: Lorem ipsum")).toBe(true);
  });

  it("devolve lista vazia quando o feed nao tem items", () => {
    expect(extractRssItems("<rss><channel></channel></rss>")).toEqual([]);
  });
});
