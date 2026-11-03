import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Badge from "@/components/ds/Badge";
import Button from "@/components/ds/Button";
import DataTable from "@/components/ds/DataTable";
import DemoDataBanner from "@/components/ds/DemoDataBanner";
import Legend, { type LegendItem } from "@/components/ds/Legend";
import PriceEstimateBar from "@/components/ds/PriceEstimateBar";
import PropertyCard from "@/components/ds/PropertyCard";
import SectionHeader from "@/components/ds/SectionHeader";
import SiteFooter from "@/components/ds/SiteFooter";
import Tooltip from "@/components/ds/Tooltip";

export const metadata: Metadata = {
  title: "Styleguide — RadarPro Portugal",
  description: "Tokens e componentes do design system RadarPro.",
  robots: { index: false, follow: false },
};

// A flag e lida por pedido: sem isto a pagina seria prerenderizada no build
// e o `STYLEGUIDE_ENABLED` nunca teria efeito em producao.
export const dynamic = "force-dynamic";

const TOKENS = [
  { name: "Fundo", token: "--rp-bg", hex: "#E3E8EC" },
  { name: "Superfície", token: "--rp-surface", hex: "#FAFBFC" },
  { name: "Cerâmica", token: "--rp-ceramic", hex: "#F4F6F7" },
  { name: "Tinta", token: "--rp-ink", hex: "#121821" },
  { name: "Tinta 2", token: "--rp-ink-2", hex: "#2A3340" },
  { name: "Suave", token: "--rp-muted", hex: "#4A5563" },
  { name: "Filete", token: "--rp-line", hex: "rgba(18,24,33,.2)" },
  { name: "Cobalto", token: "--rp-cobalt", hex: "#1F4FA3" },
  { name: "Laranja", token: "--rp-orange", hex: "#F26B3A" },
  { name: "Destaque", token: "--rp-accent", hex: "#D9480F" },
  { name: "Anomalia", token: "--rp-anomaly", hex: "#A8472B" },
  { name: "Âmbar", token: "--rp-amber", hex: "#E0A030" },
  { name: "Vidro", token: "--rp-glass", hex: "#35506B" },
];

const BADGE_KINDS = [
  "opportunity",
  "to-verify",
  "no-valuation",
  "confidence-high",
  "confidence-medium",
  "confidence-low",
] as const;

const LEGEND_ITEMS: LegendItem[] = [
  { label: "Edificado", tone: "solid" },
  { label: "Zona de influência", tone: "ghost" },
  { label: "Oportunidade", tone: "opportunity" },
  { label: "A verificar", tone: "anomaly" },
  { label: "Via", tone: "road" },
  { label: "Parque", tone: "park" },
  { label: "Água", tone: "water" },
];

type TableRow = {
  id: string;
  name: string;
  area: string;
  asking: number;
  estimated: number | null;
  score: number | null;
};

const TABLE_ROWS: TableRow[] = [
  { id: "RP-0043", name: "T2 · Arroios", area: "Lisboa", asking: 185000, estimated: 245000, score: 82 },
  { id: "RP-0117", name: "Moradia · Cedofeita", area: "Porto", asking: 312000, estimated: 298000, score: 54 },
  { id: "RP-0208", name: "Lote · São Pedro", area: "Braga", asking: 96000, estimated: null, score: null },
];

function Showcase({
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-rp-line pt-10">
      <div className="flex items-baseline gap-3">
        <span className="rp-num text-[12px] text-[var(--rp-muted)]">{index}</span>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="flex-1"
        />
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production" && process.env.STYLEGUIDE_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-rp-bg text-rp-ink">
      <DemoDataBanner force />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6">
        <SectionHeader
          eyebrow="Design system"
          title="Styleguide RadarPro"
          description="Tokens, tipografia e componentes do sistema visual. Todos os valores derivam dos tokens --rp-* definidos em globals.css."
        />

        <Showcase index="01" eyebrow="Cores" title="Paleta" description="Treze tokens de cor, sem excepções.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {TOKENS.map((token) => (
              <div key={token.token} className="border border-rp-line bg-rp-surface">
                <div
                  className="h-16 w-full border-b border-rp-line"
                  style={{ backgroundColor: `var(${token.token})` }}
                />
                <div className="p-3">
                  <p className="rp-eyebrow text-[var(--rp-muted)]">{token.name}</p>
                  <p className="rp-num mt-1 text-[12px] text-[var(--rp-ink)]">{token.token}</p>
                  <p className="rp-num mt-1 text-[12px] text-[var(--rp-muted)]">{token.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Showcase>

        <Showcase index="02" eyebrow="Tipografia" title="Famílias e escalas">
          <div className="flex flex-col gap-8 border border-rp-line bg-rp-surface p-6">
            <div className="flex flex-col gap-3">
              <p className="rp-eyebrow text-[var(--rp-cobalt)]">Fraunces — títulos</p>
              <p className="rp-display text-[64px] leading-none">Oportunidade</p>
              <p className="rp-display text-[48px] leading-none">Abaixo do mercado</p>
              <p className="rp-display text-[32px] leading-tight">Apartamento T2 em Arroios</p>
              <p className="rp-display text-[24px] leading-tight">Ver o imóvel</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-rp-line pt-6">
              <p className="rp-eyebrow text-[var(--rp-cobalt)]">Instrument Sans — texto corrido</p>
              <p className="text-[19px] leading-relaxed">
                Análise do mercado imobiliário português, palavra por palavra.
              </p>
              <p className="text-[16px] leading-relaxed">
                Texto corrido a 16 px, a medida de leitura de todos os parágrafos do produto.
              </p>
              <p className="text-[14px] leading-relaxed">
                Texto de apoio a 14 px para descrições, legendas e notas de fonte.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-rp-line pt-6">
              <p className="rp-eyebrow text-[var(--rp-cobalt)]">IBM Plex Mono — números e etiquetas</p>
              <p className="rp-eyebrow text-[var(--rp-ink)]">Oportunidade</p>
              <p className="rp-num text-[14px] text-[var(--rp-ink)]">245 000 € · ±12% · Lisboa</p>
              <p className="rp-num text-[12px] text-[var(--rp-muted)]">Referência RP-0043</p>
            </div>
          </div>
        </Showcase>

        <Showcase index="03" eyebrow="Ações" title="Botões" description="Variantes, tamanhos e estados.">
          <div className="flex flex-col gap-6 border border-rp-line bg-rp-surface p-6">
            {[
              { label: "Primary", nodes: [<Button key="p-md" size="md">Ver oportunidades</Button>, <Button key="p-lg" size="lg">Comparar imóveis</Button>] },
              { label: "Secondary", nodes: [<Button key="s-md" variant="secondary" size="md">Ver o mapa</Button>, <Button key="s-lg" variant="secondary" size="lg">Exportar relatório</Button>] },
              { label: "Link", nodes: [<Button key="l-md" variant="link" size="md">Saber mais</Button>, <Button key="l-lg" variant="link" size="lg">Ver o relatório</Button>] },
              { label: "Desativado", nodes: [<Button key="d-p" disabled>Sem saldo</Button>, <Button key="d-s" variant="secondary" disabled>Expirado</Button>, <Button key="d-l" variant="link" disabled>Indisponível</Button>] },
            ].map((group) => (
              <div key={group.label} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="rp-eyebrow w-28 shrink-0 text-[var(--rp-muted)]">{group.label}</p>
                <div className="flex flex-wrap items-center gap-4">{group.nodes}</div>
              </div>
            ))}
          </div>
        </Showcase>

        <Showcase index="04" eyebrow="Estados" title="Selos" description="Cada selo codifica um estado de leitura.">
          <div className="flex flex-wrap items-center gap-3 border border-rp-line bg-rp-surface p-6">
            {BADGE_KINDS.map((kind) => (
              <Badge key={kind} kind={kind} />
            ))}
            <Badge kind="opportunity" label="Desconto 12%" />
            <Badge kind="to-verify" label="Fonte por confirmar" />
          </div>
        </Showcase>

        <Showcase
          index="05"
          eyebrow="Preço"
          title="Preço pedido vs. estimado"
          description="Barra sólida para o pedido, extensão cobalto para a diferença face ao estimado."
        >
          <div className="flex flex-col gap-8 border border-rp-line bg-rp-surface p-6">
            <div>
              <p className="rp-eyebrow mb-2 text-[var(--rp-muted)]">Estimado</p>
              <PriceEstimateBar askingPrice={185000} estimatedValue={245000} rangePct={12} />
            </div>
            <div>
              <p className="rp-eyebrow mb-2 text-[var(--rp-muted)]">A verificar</p>
              <PriceEstimateBar
                askingPrice={320000}
                estimatedValue={298000}
                rangePct={18}
                status="to-verify"
              />
            </div>
            <div>
              <p className="rp-eyebrow mb-2 text-[var(--rp-muted)]">Sem avaliação</p>
              <PriceEstimateBar askingPrice={96000} estimatedValue={null} />
            </div>
          </div>
        </Showcase>

        <Showcase index="06" eyebrow="Ajuda" title="Tooltip" description="Aparece ao passar o rato ou ao focar.">
          <div className="flex flex-wrap items-center gap-6 border border-rp-line bg-rp-surface p-6">
            <Tooltip label="Estimativa calculada a partir de 12 anúncios comparáveis nos últimos 90 dias.">
              <Button variant="secondary" size="md">Como calculamos?</Button>
            </Tooltip>
            <Tooltip label="Margem de confiança da avaliação, não do preço pedido.">
              <span className="rp-eyebrow text-[var(--rp-cobalt)] underline decoration-dotted underline-offset-4">
                Confiança alta
              </span>
            </Tooltip>
          </div>
        </Showcase>

        <Showcase index="07" eyebrow="Dados" title="Tabela" description="Números em monoespaçado tabular.">
          <div className="border border-rp-line bg-rp-surface p-6">
            <DataTable<TableRow>
              caption="Oportunidades recentes"
              columns={[
                { key: "id", header: "Referência", render: (row) => row.id },
                { key: "name", header: "Imóvel", render: (row) => row.name },
                { key: "area", header: "Zona", render: (row) => row.area },
                {
                  key: "asking",
                  header: "Preço pedido",
                  numeric: true,
                  render: (row) => `${row.asking.toLocaleString("pt-PT")} €`,
                },
                {
                  key: "estimated",
                  header: "Estimado",
                  numeric: true,
                  render: (row) =>
                    row.estimated === null ? "—" : `${row.estimated.toLocaleString("pt-PT")} €`,
                },
                {
                  key: "score",
                  header: "Pontuação",
                  numeric: true,
                  render: (row) => (row.score === null ? "—" : `${row.score}/100`),
                },
              ]}
              rows={TABLE_ROWS}
            />
          </div>
        </Showcase>

        <Showcase index="08" eyebrow="Mapa" title="Legenda" description="Materiais da maquete e estados de leitura.">
          <div className="border border-rp-line bg-rp-surface p-6">
            <Legend items={LEGEND_ITEMS} />
          </div>
        </Showcase>

        <Showcase index="09" eyebrow="Cartão" title="Imóvel" description="Preço pedido, selos e barra de estimativa.">
          <div className="grid gap-6 sm:grid-cols-2">
            <PropertyCard
              title="Apartamento T2 em Arroios"
              location="Arroios, Lisboa"
              askingPrice={185000}
              estimatedValue={245000}
              rangePct={12}
              source="Casasapo"
              href="/oportunidades"
              badges={[
                { kind: "opportunity" },
                { kind: "confidence-high" },
              ]}
            />
            <PropertyCard
              title="Moradia V4 em Cedofeita"
              location="Cedofeita, Porto"
              askingPrice={320000}
              estimatedValue={298000}
              rangePct={18}
              status="to-verify"
              source="Imóveisonline"
              badges={[{ kind: "to-verify" }, { kind: "confidence-medium" }]}
            />
          </div>
        </Showcase>

        <Showcase index="10" eyebrow="Estrutura" title="Cabeçalho de secção" description="Alinhamento à esquerda ou centrado.">
          <div className="flex flex-col gap-10 border border-rp-line bg-rp-surface p-6">
            <SectionHeader
              eyebrow="Como funciona"
              title="Do anúncio à oportunidade"
              description="Rastreamos cada anúncio, comparamos com o mercado local e publicamos apenas as diferenças que sustentam uma decisão."
            />
            <SectionHeader
              align="center"
              eyebrow="Preços"
              title="Planos claros, sem surpresas"
              description="Mensalidade fixa, sem comissão sobre a compra."
            />
          </div>
        </Showcase>
      </div>

      <SiteFooter />
    </div>
  );
}
