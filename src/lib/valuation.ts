/**
 * @deprecated Use `@/lib/valuation/index` (motor v2) directly.
 *
 * Este ficheiro existe apenas por compatibilidade. O motor v2 é a única fonte
 * de verdade: `evaluateProperty`. Todos os consumidores devem importar de
 * `@/lib/valuation` (diretório) ou `@/lib/valuation/index`.
 */
export { evaluateProperty, normalizeProperty, calculateScore, SCORE_WEIGHTS } from "./valuation/index";
export type * from "./valuation/types";
