import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseCasaSapoListings,
  parseImovirtualListingsFromHtml,
  parsePrice,
  unwrapCasaSapoUrl,
} from "@/lib/portal-parsers";

const fixture = (name: string) =>
  readFileSync(resolve(process.cwd(), "src/lib/__tests__/fixtures", name), "utf8");

describe("parseCasaSapoListings", () => {
  const listings = parseCasaSapoListings(fixture("casasapo-search.html"));

  it("extrai titulo, preco, localizacao e url real", () => {
    expect(listings).toHaveLength(1);
    expect(listings[0].title).toBe("Apartamento T2");
    expect(listings[0].price).toBe(399000);
    expect(listings[0].location).toBe("São Vicente, Lisboa, Distrito de Lisboa");
    expect(listings[0].url).toContain("casa.sapo.pt/comprar-apartamento-t2-lisboa-sao-vicente");
    expect(listings[0].url).not.toContain("gespub");
  });

  it("extrai a area das features do cartao", () => {
    expect(listings[0].areaSqm).toBe(95);
  });

  it("extrai as imagens", () => {
    expect(listings[0].images).toEqual(["https://media.casasapo.pt/Z360x270/ID1.jpg.webp"]);
  });

  it("descarta anuncios de arrendamento", () => {
    expect(listings.some((l) => l.title === "Duplex T1+1")).toBe(false);
  });
});

describe("parseImovirtualListingsFromHtml", () => {
  const listings = parseImovirtualListingsFromHtml(fixture("imovirtual-search.html"));

  it("extrai titulo, preco, area e url", () => {
    expect(listings).toHaveLength(3);
    expect(listings[0].title).toBe("Apartamento T3 na Estrela");
    expect(listings[0].price).toBe(285000);
    expect(listings[0].areaSqm).toBe(119);
    expect(listings[0].url).toBe(
      "https://www.imovirtual.com/pt/ad/apartamento-t3-na-estrela-ID1j7rN",
    );
  });

  it("extrai a geografia estruturada", () => {
    expect(listings[0].district).toBe("Lisboa");
    expect(listings[0].municipality).toBe("Lisboa");
    expect(listings[0].parish).toBe("São Vicente");
    expect(listings[0].location).toBe("São Vicente, Lisboa, Lisboa");
  });
});

describe("unwrapCasaSapoUrl", () => {
  it("extrai o url real do link de tracking", () => {
    expect(
      unwrapCasaSapoUrl(
        "https://gespub.casa.sapo.pt/v3/webinterface/client/counter.aspx?c=1&l=https://casa.sapo.pt/comprar-apartamento-x-ID1.html",
      ),
    ).toBe("https://casa.sapo.pt/comprar-apartamento-x-ID1.html");
  });

  it("mantem urls normais", () => {
    expect(unwrapCasaSapoUrl("https://casa.sapo.pt/comprar-y-ID2.html")).toBe(
      "https://casa.sapo.pt/comprar-y-ID2.html",
    );
  });
});

describe("parsePrice", () => {
  it("le precos em formato pt-PT", () => {
    expect(parsePrice("399.000 €")).toBe(399000);
    expect(parsePrice("1.734.000 €")).toBe(1734000);
    expect(parsePrice("459.000 € 480.000 € -4,38%")).toBe(459000);
    expect(parsePrice("")).toBe(0);
  });
});
