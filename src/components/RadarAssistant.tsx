"use client";

import { useState } from "react";
import { Search, Send } from "lucide-react";
import Button from "@/components/ds/Button";

const KEYWORD_MAP: Record<string, { district?: string; type?: string; maxPrice?: number; minDiscount?: number; description: string; isAuction?: boolean }> = {
  lisboa: { district: "Lisboa", description: "Imóveis em Lisboa" },
  porto: { district: "Porto", description: "Imóveis no Porto" },
  braga: { district: "Braga", description: "Imóveis em Braga" },
  t2: { type: "T2", description: "Apartamentos T2" },
  t3: { type: "T3", description: "Apartamentos T3" },
  t1: { type: "T1", description: "Apartamentos T1" },
  moradia: { type: "V3", description: "Moradias V3" },
  garagem: { type: "Garagem", description: "Garagens" },
  leilao: { isAuction: true as const, description: "Imóveis em leilão" },
  barato: { maxPrice: 150000, description: "Imóveis até 150.000€" },
  desconto: { minDiscount: 30, description: "Imóveis com desconto de 30%+" },
};

interface RadarAssistantProps {
  onApplyFilters: (filters: {
    district?: string;
    type?: string;
    maxPrice?: number;
    minDiscount?: number;
    isAuction?: boolean;
  }) => void;
}

export default function RadarAssistant({ onApplyFilters }: RadarAssistantProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Olá! Sou o Radar Assistant. Posso ajudar a encontrar imóveis com base nas suas necessidades. Tente escrever:\n\n• \"Apartamento T2 em Lisboa até 200.000€\"\n• \"Moradia em Braga com desconto de 30%+\"\n• \"Imóveis em leilão no Porto\"\n• \"Casa com jardim até 300.000€\"",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const parseQuery = (text: string) => {
    const lower = text.toLowerCase();
    const filters: {
      district?: string;
      type?: string;
      maxPrice?: number;
      minDiscount?: number;
      isAuction?: boolean;
    } = {};

    // Check for districts
    const districts = ["lisboa", "porto", "braga", "faro", "setúbal", "setubal", "aveiro", "coimbra"];
    for (const d of districts) {
      if (lower.includes(d)) {
        filters.district = d.charAt(0).toUpperCase() + d.slice(1);
        if (d === "setubal") filters.district = "Setúbal";
        break;
      }
    }

    // Check for types
    const types: Record<string, string> = {
      t0: "T0", t1: "T1", t2: "T2", t3: "T3", t4: "T4",
      moradia: "V3", garagem: "Garagem", loja: "Loja",
    };
    for (const [key, val] of Object.entries(types)) {
      if (lower.includes(key)) {
        filters.type = val;
        break;
      }
    }

    // Check for price
    const priceMatch = lower.match(/(\d+)\s*[k€]/);
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1]) * 1000;
    }

    // Check for discount
    const discountMatch = lower.match(/(\d+)%/);
    if (discountMatch) {
      filters.minDiscount = parseInt(discountMatch[1]);
    }

    // Check for auction
    if (lower.includes("leilao") || lower.includes("leilão")) {
      filters.isAuction = true;
    }

    return filters;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    const filters = parseQuery(query);
    const response = buildResponse(query, filters);

    setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    setQuery("");
    setLoading(false);

    // Apply filters
    onApplyFilters(filters);
  };

  const buildResponse = (query: string, filters: any): string => {
    const parts: string[] = [];

    if (filters.district) parts.push(`Distrito: ${filters.district}`);
    if (filters.type) parts.push(`Tipo: ${filters.type}`);
    if (filters.maxPrice) parts.push(`Preço máximo: ${filters.maxPrice.toLocaleString()}€`);
    if (filters.minDiscount) parts.push(`Desconto mínimo: ${filters.minDiscount}%`);
    if (filters.isAuction) parts.push("Tipo: Leilão");

    if (parts.length === 0) {
      return "Não consegui identificar critérios específicos na sua pesquisa. Tente ser mais específico, por exemplo: \"Apartamento T2 em Lisboa até 200.000€\".";
    }

    return `Encontrei oportunidades que correspondem à sua busca:\n\n${parts.map((p) => `• ${p}`).join("\n")}\n\nApliquei os filtros automaticamente. Pode ajustar os resultados na lista abaixo.`;
  };

  return (
    <div className="border border-rp-line bg-rp-surface p-6">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-rp-cobalt" aria-hidden="true" />
        <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Radar Assistant</h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-rp-muted">
        Descreva o que procura em linguagem natural e eu aplico os filtros automaticamente.
      </p>

      <div
        className="mb-4 mt-4 h-64 overflow-y-auto border border-rp-line bg-rp-ceramic p-4"
        role="log"
        aria-live="polite"
        aria-label="Conversa com o Radar Assistant"
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex gap-3 mb-3 flex-row-reverse" : "flex gap-3 mb-3"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] whitespace-pre-line border border-rp-ink bg-rp-ink p-3 text-[14px] leading-relaxed text-rp-surface"
                  : "max-w-[80%] whitespace-pre-line border border-rp-line bg-rp-surface p-3 text-[14px] leading-relaxed text-rp-ink-2"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 p-3" aria-label="A processar">
            <div className="w-2 h-2 bg-rp-cobalt rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-rp-cobalt rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="w-2 h-2 bg-rp-cobalt rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <label htmlFor="radar-assistant-query" className="sr-only">
          Descreva o imóvel que procura
        </label>
        <input
          id="radar-assistant-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Descreva o que procura..."
          className="flex-1 min-h-11 rounded-rp border border-rp-line bg-rp-surface px-4 py-2 text-[15px] text-rp-ink placeholder:text-rp-muted focus:border-rp-cobalt focus:outline-none"
          disabled={loading}
        />
        <Button type="submit" ariaLabel="Enviar" disabled={loading || !query.trim()}>
          <Send size={18} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
