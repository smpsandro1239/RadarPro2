import type { AssetClass, ListingType, PropertyInput } from "./types";
import { fold } from "./utils";

export interface AssetClassResult {
  assetClass: AssetClass;
  /** true quando a classe foi deduzida do texto ou assumida por omissão. */
  inferred: boolean;
  reason: string | null;
}

/**
 * Usa asset_class guardado; se não existir, deduz de type/title.
 * "mixed" é respeitado (tem tratamento próprio no dispatcher).
 */
export function deriveAssetClass(p: PropertyInput): AssetClassResult {
  if (p.assetClass) return { assetClass: p.assetClass, inferred: false, reason: null };

  const text = fold(`${p.type ?? ""} ${p.title ?? ""}`);
  const has = (re: RegExp) => re.test(text);

  if (has(/\b(terreno|lote)\b/)) {
    if (has(/rustic|agricol|florest|quinta|olival|vinha|pinhal/)) {
      return { assetClass: "rural_land", inferred: true, reason: "Classe deduzida do texto: terreno rústico" };
    }
    return { assetClass: "urban_land", inferred: true, reason: "Classe deduzida do texto: terreno (PDM desconhecido)" };
  }
  if (has(/garagem|\bbox\b|estacionamento|parqueamento|arrecadacao/)) {
    return { assetClass: "garage", inferred: true, reason: "Classe deduzida do texto: garagem/arrecadação" };
  }
  if (has(/loja|armazem|escritorio|comerc|industrial|pavilhao|servicos/)) {
    return { assetClass: "commercial", inferred: true, reason: "Classe deduzida do texto: comercial" };
  }
  if (has(/predio|edificio/)) {
    return { assetClass: "mixed", inferred: true, reason: "Classe deduzida do texto: prédio (avaliação manual)" };
  }
  if (has(/moradia|vivenda|\bcasa\b|\bvilla\b|\bv[2-9]\b/)) {
    return { assetClass: "house", inferred: true, reason: "Classe deduzida do texto: moradia" };
  }
  if (has(/apartamento|\bt[0-9]\b|duplex|studio/)) {
    return { assetClass: "apartment", inferred: true, reason: "Classe deduzida do texto: apartamento" };
  }
  return { assetClass: "apartment", inferred: true, reason: "Classe desconhecida: assumido apartamento" };
}

export function deriveListingType(p: PropertyInput): { listingType: ListingType; assumed: boolean } {
  if (!p.isAuction) return { listingType: "fixed_price", assumed: false };
  const t = fold(p.auctionType);
  if (t.includes("judicial")) return { listingType: "auction_judicial", assumed: false };
  if (t.includes("fiscal")) return { listingType: "auction_fiscal", assumed: false };
  if (t.includes("priv") || t.includes("particular")) return { listingType: "auction_private", assumed: false };
  return { listingType: "auction_private", assumed: true };
}
