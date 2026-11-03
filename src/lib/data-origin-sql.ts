import { sql } from "drizzle-orm";
import { properties } from "@/db/schema";

/**
 * Padroes GLOB (SQLite) que reproduzem `isDemoId` (src/lib/data-origin.ts):
 * o id termina em 1-3 digitos, nao tem numeros de 4+ digitos (o preco) e tem
 * 3 ou 4 segmentos separados por "-".
 */
const ENDS_WITH_DIGITS = ["*-[0-9]", "*-[0-9][0-9]", "*-[0-9][0-9][0-9]"];

/**
 * Condicao SQL que exclui os ids de demonstracao (mesmo formato do `isDemoId`).
 * Usada nas consultas publicas para nao apresentar dados sinteticos como reais.
 */
export function demoDataCondition() {
  const endings = ENDS_WITH_DIGITS.map((glob) => sql`${properties.id} GLOB ${glob}`);
  return sql`NOT (
    (${sql.join(endings, sql` OR `)})
    AND ${properties.id} NOT GLOB ${"*[0-9][0-9][0-9][0-9]*"}
    AND (length(${properties.id}) - length(replace(${properties.id}, '-', ''))) BETWEEN 2 AND 3
  )`;
}
