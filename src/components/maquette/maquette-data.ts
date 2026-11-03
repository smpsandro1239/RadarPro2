/**
 * Dados da maquete "cidade" (hero da landing).
 *
 * ATENCAO: valores FICTICIOS. As alturas seguem a regra do prototipo
 * (`preco pedido = altura solida x 2 400 EUR`) e servem apenas para
 * explicar o produto. Quando existirem dados reais (WP5), a mesma estrutura
 * passa a ser alimentada por imoveis com avaliacao nao nula.
 */

export type MaquetteKind = "opportunity" | "anomaly" | "standard";

export type MaquetteItem = {
  id: string;
  kind: MaquetteKind;
  /** Preco pedido (EUR) — derivacao da altura solida. */
  askingPrice: number;
  /** Valor estimado (EUR) ou null quando nao ha estimativa. */
  estimatedValue: number | null;
  /** Faixa de erro em percentagem (+/-). */
  rangePct: number;
  label: string;
};

export type MaquetteMaterial = "ceramic" | "glass" | "opportunity" | "anomaly" | "metal";

export type MaquettePart = {
  id: string;
  /** Edificio a que a parte pertence (para o cartao de leitura). */
  itemId?: string;
  x: number;
  y: number;
  w: number;
  d: number;
  /** Altura solida desta parte (px). */
  h: number;
  /** Base elevada (px). */
  z?: number;
  /** Rotacao em torno do centro (deg). */
  rot?: number;
  material: MaquetteMaterial;
  /** Volume fantasma: diferenca entre o preco pedido e o valor estimado. */
  ghost?: boolean;
};

export type MaquetteGround = {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  kind: "road" | "park" | "water";
};

/** EUR por unidade de altura na maquete (regra do prototipo). */
export const PRICE_PER_HEIGHT_UNIT = 2400;

export const PLATE_SIZE = 440;

export const GROUND: MaquetteGround[] = [
  { id: "road-v", x: 214, y: 0, w: 12, d: 440, kind: "road" },
  { id: "road-h", x: 0, y: 214, w: 440, d: 12, kind: "road" },
  { id: "park", x: 240, y: 330, w: 70, d: 90, kind: "park" },
  { id: "water", x: 310, y: 240, w: 110, d: 60, kind: "water" },
];

/** Partes solidas + volumes fantasma, por edificio. */
export const PARTS: MaquettePart[] = [
  // b0 — bloco ceramico com coroa e antena
  { id: "b0-base", itemId: "b0", x: 30, y: 30, w: 50, d: 50, h: 110, material: "ceramic" },
  { id: "b0-crown", itemId: "b0", x: 40, y: 40, w: 30, d: 30, h: 30, z: 110, material: "ceramic" },
  { id: "b0-antenna", itemId: "b0", x: 50, y: 50, w: 4, d: 4, h: 38, z: 140, material: "metal" },
  // b1 — torre de vidro
  { id: "b1-base", itemId: "b1", x: 110, y: 40, w: 44, d: 44, h: 160, material: "glass" },
  { id: "b1-antenna", itemId: "b1", x: 130, y: 60, w: 4, d: 4, h: 30, z: 160, material: "metal" },
  // b2 — oportunidade (janelas acesas) + diferenca
  { id: "b2-base", itemId: "b2", x: 40, y: 120, w: 52, d: 52, h: 84, material: "opportunity" },
  { id: "b2-ghost", itemId: "b2", x: 40, y: 120, w: 52, d: 52, h: 36, z: 84, material: "ceramic", ghost: true },
  // b3 — pavilhao + ponte
  { id: "b3-base", itemId: "b3", x: 120, y: 130, w: 60, d: 50, h: 40, material: "ceramic" },
  { id: "b3-bridge", itemId: "b3", x: 80, y: 48, w: 30, d: 8, h: 5, z: 70, material: "metal" },
  // b4 — torre em espiral (8 lajes)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `b4-slab-${i}`,
    itemId: "b4",
    x: 308,
    y: 78,
    w: 44,
    d: 44,
    h: 22,
    z: i * 22,
    rot: i * 9,
    material: (i % 2 === 0 ? "glass" : "ceramic") as MaquetteMaterial,
  })),
  // b5 — edificio de vidro
  { id: "b5-base", itemId: "b5", x: 250, y: 30, w: 40, d: 40, h: 90, material: "glass" },
  // b6 — degraus
  { id: "b6-base", itemId: "b6", x: 370, y: 40, w: 46, d: 46, h: 70, material: "ceramic" },
  { id: "b6-mid", itemId: "b6", x: 378, y: 48, w: 30, d: 30, h: 40, z: 70, material: "glass" },
  { id: "b6-top", itemId: "b6", x: 386, y: 56, w: 14, d: 14, h: 30, z: 110, material: "metal" },
  // b7 — anomalo (tracejado) + diferenca
  { id: "b7-base", itemId: "b7", x: 255, y: 140, w: 50, d: 50, h: 60, material: "anomaly" },
  { id: "b7-ghost", itemId: "b7", x: 255, y: 140, w: 50, d: 50, h: 100, z: 60, material: "ceramic", ghost: true },
  // b8 — arena em camadas
  { id: "b8-l1", itemId: "b8", x: 30, y: 260, w: 100, d: 100, h: 12, material: "ceramic" },
  { id: "b8-l2", itemId: "b8", x: 40, y: 270, w: 80, d: 80, h: 14, z: 12, material: "ceramic" },
  { id: "b8-l3", itemId: "b8", x: 52, y: 282, w: 56, d: 56, h: 14, z: 26, material: "glass" },
  { id: "b8-l4", itemId: "b8", x: 64, y: 294, w: 32, d: 32, h: 8, z: 40, material: "metal" },
  // b9 — torre fina
  { id: "b9-base", itemId: "b9", x: 150, y: 250, w: 36, d: 36, h: 120, material: "glass" },
  { id: "b9-antenna", itemId: "b9", x: 166, y: 266, w: 4, d: 4, h: 30, z: 120, material: "metal" },
  // b10 — oportunidade + diferenca
  { id: "b10-base", itemId: "b10", x: 150, y: 330, w: 44, d: 44, h: 96, material: "opportunity" },
  { id: "b10-ghost", itemId: "b10", x: 150, y: 330, w: 44, d: 44, h: 50, z: 96, material: "ceramic", ghost: true },
  // b11 — bloco alto + ponte
  { id: "b11-base", itemId: "b11", x: 250, y: 250, w: 46, d: 46, h: 130, material: "ceramic" },
  { id: "b11-bridge", itemId: "b11", x: 186, y: 262, w: 64, d: 10, h: 6, z: 90, material: "metal" },
  // b13 — torre de vidro
  { id: "b13-base", itemId: "b13", x: 330, y: 340, w: 44, d: 44, h: 76, material: "glass" },
  // b14 — oportunidade + diferenca
  { id: "b14-base", itemId: "b14", x: 382, y: 340, w: 36, d: 36, h: 56, material: "opportunity" },
  { id: "b14-ghost", itemId: "b14", x: 382, y: 340, w: 36, d: 36, h: 16, z: 56, material: "ceramic", ghost: true },
];

/** Altura solida total (sem fantasma) de cada edificio. */
const SOLID_HEIGHTS: Record<string, number> = {
  b0: 110,
  b1: 160,
  b2: 84,
  b3: 40,
  b4: 176,
  b5: 90,
  b6: 70,
  b7: 60,
  b8: 40,
  b9: 120,
  b10: 96,
  b11: 130,
  b13: 76,
  b14: 56,
};

/** Altura total (solida + diferenca) = altura estimada. */
const ESTIMATED_HEIGHTS: Record<string, number> = {
  b2: 120,
  b7: 160,
  b10: 146,
  b14: 72,
};

const ITEM_META: Record<string, { kind: MaquetteKind; rangePct: number; label: string }> = {
  b0: { kind: "standard", rangePct: 8, label: "Bloco ceramico" },
  b1: { kind: "standard", rangePct: 8, label: "Torre de vidro" },
  b2: { kind: "opportunity", rangePct: 12, label: "Oportunidade A" },
  b3: { kind: "standard", rangePct: 8, label: "Pavilhao" },
  b4: { kind: "standard", rangePct: 10, label: "Torre em espiral" },
  b5: { kind: "standard", rangePct: 8, label: "Edificio de vidro" },
  b6: { kind: "standard", rangePct: 8, label: "Bloco em degraus" },
  b7: { kind: "anomaly", rangePct: 20, label: "A verificar" },
  b8: { kind: "standard", rangePct: 10, label: "Arena" },
  b9: { kind: "standard", rangePct: 8, label: "Torre fina" },
  b10: { kind: "opportunity", rangePct: 12, label: "Oportunidade B" },
  b11: { kind: "standard", rangePct: 8, label: "Bloco alto" },
  b13: { kind: "standard", rangePct: 8, label: "Torre de vidro" },
  b14: { kind: "opportunity", rangePct: 10, label: "Oportunidade C" },
};

export const ITEMS: MaquetteItem[] = Object.entries(ITEM_META).map(([id, meta]) => {
  const solid = SOLID_HEIGHTS[id] ?? 0;
  const estimated = ESTIMATED_HEIGHTS[id];
  return {
    id,
    kind: meta.kind,
    askingPrice: solid * PRICE_PER_HEIGHT_UNIT,
    estimatedValue: estimated === undefined ? null : estimated * PRICE_PER_HEIGHT_UNIT,
    rangePct: meta.rangePct,
    label: meta.label,
  };
});

export const ITEMS_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));

/** Os quatro exemplos navegaveis por teclado (cartao de leitura). */
export const KEYBOARD_EXAMPLES = ["b2", "b7", "b10", "b14"] as const;

export { formatEuros } from "@/lib/format";
