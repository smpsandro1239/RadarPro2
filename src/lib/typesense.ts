import { isTypesenseConfigured } from "./search-config";

let client: any = null;

export function getTypesenseClient(): any {
  if (!client && isTypesenseConfigured()) {
    const { Client: TypeSenseClient } = require("typesense");
    client = new TypeSenseClient({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST!,
          port: parseInt(process.env.TYPESENSE_PORT || "8108"),
          protocol: process.env.TYPESENSE_PROTOCOL || "http",
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY!,
      connectionTimeoutSeconds: 2,
    });
  }
  return client;
}

export const TYPESENSE_COLLECTION = "properties";

export function isTypesenseReady(): boolean {
  return isTypesenseConfigured() && getTypesenseClient() !== null;
}

export async function ensureTypesenseSchema() {
  if (!isTypesenseConfigured()) {
    console.info("Typesense não configurado — a pular ensureTypesenseSchema(). A busca usará BD.");
    return;
  }
  const tc = getTypesenseClient();
  try {
    await tc.collections(TYPESENSE_COLLECTION).retrieve();
  } catch {
    await tc.collections().create({
      name: TYPESENSE_COLLECTION,
      fields: [
        { name: "id", type: "string" },
        { name: "source", type: "string", facet: true },
        { name: "source_name", type: "string" },
        { name: "url", type: "string" },
        { name: "title", type: "string" },
        { name: "district", type: "string", facet: true },
        { name: "municipality", type: "string", facet: true },
        { name: "type", type: "string", facet: true },
        { name: "price", type: "int32", facet: true },
        { name: "market_value", type: "int32" },
        { name: "discount_pct", type: "int32", facet: true },
        { name: "score", type: "int32", facet: true },
        { name: "rentability", type: "float" },
        { name: "is_auction", type: "bool", facet: true },
        { name: "is_active", type: "bool", facet: true },
        { name: "created_at", type: "int64" },
        { name: "updated_at", type: "int64" },
      ],
      default_sorting_field: "score",
    });
  }
}

export async function indexProperty(property: any): Promise<{ indexed: boolean; error?: string }> {
  if (!isTypesenseConfigured()) {
    console.info("Typesense não configurado — a pular indexProperty().");
    return { indexed: false };
  }
  const tc = getTypesenseClient();
  try {
    await tc.collections(TYPESENSE_COLLECTION).documents().upsert(property);
    return { indexed: true };
  } catch (err: any) {
    console.error("Typesense indexProperty falhou (não-bloqueante):", err);
    return { indexed: false, error: String(err) };
  }
}

export async function indexProperties(properties: any[]): Promise<{ indexed: number; error?: string }> {
  if (!isTypesenseConfigured()) {
    console.info("Typesense não configurado — a pular indexProperties().");
    return { indexed: 0 };
  }
  const tc = getTypesenseClient();
  try {
    await tc.collections(TYPESENSE_COLLECTION).documents().import(properties, {
      action: "upsert",
    });
    return { indexed: properties.length };
  } catch (err: any) {
    console.error("Typesense indexProperties falhou (não-bloqueante):", err);
    return { indexed: 0, error: String(err) };
  }
}

export async function searchProperties({
  q = "",
  district,
  type,
  source,
  minPrice,
  maxPrice,
  minScore,
  isAuction,
  page = 1,
  perPage = 20,
}: {
  q?: string;
  district?: string;
  type?: string;
  source?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  isAuction?: boolean;
  page?: number;
  perPage?: number;
}): Promise<{ hits: any[]; found: number; page: number; perPage: number; facets: any[] } | null> {
  if (!isTypesenseConfigured()) {
    return null;
  }
  const tc = getTypesenseClient();
  if (!tc) return null;

  const filterParts: string[] = [];
  if (district) filterParts.push(`district:=${district}`);
  if (type) filterParts.push(`type:=${type}`);
  if (source) filterParts.push(`source:=${source}`);
  if (minPrice !== undefined) filterParts.push(`price:>=${minPrice}`);
  if (maxPrice !== undefined) filterParts.push(`price:<=${maxPrice}`);
  if (minScore !== undefined) filterParts.push(`score:>=${minScore}`);
  if (isAuction !== undefined) filterParts.push(`is_auction:=${isAuction}`);
  filterParts.push("is_active:=true");

  try {
    const response = await tc
      .collections(TYPESENSE_COLLECTION)
      .documents()
      .search({
        q,
        query_by: "title,district,municipality,type,source_name",
        filter_by: filterParts.join(" && "),
        page,
        per_page: perPage,
        sort_by: "score:desc",
        facet_by: "district,type,source,is_auction,price,discount_pct,score",
        max_facet_values: 100,
      });

    return {
      hits: response.hits.map((h: any) => h.document),
      found: response.found,
      page,
      perPage,
      facets: response.facet_counts,
    };
  } catch (err: any) {
    console.error("Typesense search falhou:", err);
    return null;
  }
}

