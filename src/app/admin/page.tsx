import { ADMIN_EMAIL, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { properties, users, searchAlerts, savedProperties } from "@/db/schema";

import { unstable_noStore } from "next/cache";
import PageShell from "@/components/ds/PageShell";
import StatCard from "@/components/ds/StatCard";
import SectionHeader from "@/components/ds/SectionHeader";
import DataTable from "@/components/ds/DataTable";
import Button from "@/components/ds/Button";

export default async function AdminPage() {
  unstable_noStore();
  const session = await getSession();
  if (!session || session.email !== ADMIN_EMAIL) redirect("/");

  const allProperties = await db.select().from(properties);
  const allUsers = await db.select().from(users);
  const allAlerts = await db.select().from(searchAlerts);
  const allSaved = await db.select().from(savedProperties);

  // Stats
  const activeProps = allProperties.filter((p) => p.isActive);
  const inactiveProps = allProperties.filter((p) => !p.isActive);
  const auctionProps = allProperties.filter((p) => p.isAuction);
  const withImages = allProperties.filter((p) => p.images && p.images !== "[]" && p.images !== "null");
  const withoutImages = allProperties.filter((p) => !p.images || p.images === "[]" || p.images === "null");
  const geocoded = allProperties.filter((p) => p.lat && p.lng);
  const notGeocoded = allProperties.filter((p) => !p.lat || !p.lng);

  // Source stats
  const sourceStats = [...new Set(allProperties.map((p) => p.sourceName))].map((source) => ({
    source,
    count: allProperties.filter((p) => p.sourceName === source).length,
    active: allProperties.filter((p) => p.sourceName === source && p.isActive).length,
    withImages: allProperties.filter((p) => p.sourceName === source && p.images && p.images !== "[]").length,
  })).sort((a, b) => b.count - a.count);

  // District stats
  const districtStats = ["Lisboa", "Porto", "Braga"].map((d) => ({
    district: d,
    count: allProperties.filter((p) => p.district === d).length,
    active: allProperties.filter((p) => p.district === d && p.isActive).length,
    auctions: allProperties.filter((p) => p.district === d && p.isAuction).length,
  }));

  // Check status stats
  const checkStats = {
    ok: allProperties.filter((p) => p.checkStatus === "ok").length,
    notFound: allProperties.filter((p) => p.checkStatus === "not_found").length,
    error: allProperties.filter((p) => p.checkStatus === "error").length,
    pending: allProperties.filter((p) => p.checkStatus === "pending" || !p.checkStatus).length,
  };

  // Last checked
  const lastChecked = allProperties
    .filter((p) => p.lastChecked)
    .sort((a, b) => new Date(b.lastChecked!).getTime() - new Date(a.lastChecked!).getTime())[0];

  const total = allProperties.length;
  const imagePct = total ? Math.round((withImages.length / total) * 100) : 0;
  const geoPct = total ? Math.round((geocoded.length / total) * 100) : 0;

  const recentProperties = [...allProperties]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 20);

  return (
    <PageShell eyebrow="Administração" title="Painel de administração">
      {/* Overview cards */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total imóveis" value={total} />
        <StatCard label="Ativos" value={activeProps.length} />
        <StatCard label="Inativos" value={inactiveProps.length} />
        <StatCard label="Leilões" value={auctionProps.length} />
        <StatCard label="Utilizadores" value={allUsers.length} />
        <StatCard label="Subscritores Pro" value={allUsers.filter((u) => u.plan === "pro").length} />
      </div>

      {/* Data quality */}
      <section className="mb-12">
        <SectionHeader eyebrow="Qualidade de dados" title="Imagens e geocodificação" />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="border border-rp-line bg-rp-surface p-6 shadow-rp-1">
            <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Imagens</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-rp-ceramic">
                <div className="h-full bg-rp-cobalt" style={{ width: `${imagePct}%` }} />
              </div>
              <span className="rp-num text-[13px] text-rp-ink">
                {withImages.length}/{total}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-rp-muted">
              {withImages.length} com imagens reais, {withoutImages.length} com placeholder
            </p>
          </article>

          <article className="border border-rp-line bg-rp-surface p-6 shadow-rp-1">
            <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Geocoding</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-rp-ceramic">
                <div className="h-full bg-rp-cobalt" style={{ width: `${geoPct}%` }} />
              </div>
              <span className="rp-num text-[13px] text-rp-ink">
                {geocoded.length}/{total}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-rp-muted">
              {geocoded.length} geocodificados, {notGeocoded.length} pendentes
            </p>
          </article>
        </div>
      </section>

      {/* Check status */}
      <section className="mb-12">
        <SectionHeader eyebrow="Verificação de links" title="Estado das fontes" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="OK (vivos)" value={checkStats.ok} />
          <StatCard label="Não encontrados" value={checkStats.notFound} />
          <StatCard label="Erros" value={checkStats.error} />
          <StatCard label="Pendentes" value={checkStats.pending} />
        </div>
        {lastChecked ? (
          <p className="rp-num mt-4 text-[13px] text-rp-muted">
            Última verificação: {new Date(lastChecked.lastChecked!).toLocaleString("pt-PT")}
          </p>
        ) : null}
      </section>

      {/* Actions */}
      <section className="mb-12">
        <SectionHeader eyebrow="Ações" title="Operações manuais" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="border border-rp-line bg-rp-surface p-6">
            <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Scraping</h3>
            <p className="mt-2 mb-4 text-[14px] leading-relaxed text-rp-ink-2">
              Disparar scraping de fontes imobiliárias.
            </p>
            <form action="/api/scrape" method="POST" className="flex items-end gap-2">
              <div>
                <label htmlFor="admin-district" className="sr-only">
                  Distrito
                </label>
                <select
                  id="admin-district"
                  name="district"
                  className="min-h-11 rounded-rp border border-rp-line bg-rp-surface px-3 py-2 text-[14px] text-rp-ink focus:border-rp-cobalt focus:outline-none"
                >
                  <option value="Lisboa">Lisboa</option>
                  <option value="Porto">Porto</option>
                  <option value="Braga">Braga</option>
                </select>
              </div>
              <Button type="submit" variant="primary" size="md">
                Iniciar
              </Button>
            </form>
          </article>

          <article className="border border-rp-line bg-rp-surface p-6">
            <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Verificação de links</h3>
            <p className="mt-2 mb-4 text-[14px] leading-relaxed text-rp-ink-2">
              Verifica se imóveis ainda estão à venda (50 por execução).
            </p>
            <Button href="/api/cron/check-links" variant="secondary" size="md">
              Verificar agora
            </Button>
          </article>

          <article className="border border-rp-line bg-rp-surface p-6">
            <h3 className="rp-display text-[20px] leading-tight text-rp-ink">Geocoding</h3>
            <p className="mt-2 mb-4 text-[14px] leading-relaxed text-rp-ink-2">
              Geocodifica imóveis sem coordenadas (30 por execução).
            </p>
            <Button href="/api/cron/geocode" variant="secondary" size="md">
              Geocodificar agora
            </Button>
          </article>
        </div>
      </section>

      {/* By source */}
      <section className="mb-12">
        <SectionHeader eyebrow="Por fonte" title="Cobertura por portal" />
        <div className="mt-6 border border-rp-line bg-rp-surface p-4">
          <DataTable
            caption="Total, ativos e imóveis com imagem por fonte"
            columns={[
              { key: "source", header: "Fonte", render: (row) => row.source },
              { key: "count", header: "Total", numeric: true, render: (row) => row.count },
              { key: "active", header: "Ativos", numeric: true, render: (row) => row.active },
              { key: "withImages", header: "Com imagem", numeric: true, render: (row) => row.withImages },
            ]}
            rows={sourceStats}
          />
        </div>
      </section>

      {/* By district */}
      <section className="mb-12">
        <SectionHeader eyebrow="Por distrito" title="Distribuição" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {districtStats.map((d) => (
            <article key={d.district} className="border border-rp-line bg-rp-surface p-4">
              <h3 className="rp-display text-[20px] leading-tight text-rp-ink">{d.district}</h3>
              <dl className="mt-3 space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-rp-muted">Total</dt>
                  <dd className="rp-num text-[14px] text-rp-ink">{d.count}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-rp-muted">Ativos</dt>
                  <dd className="rp-num text-[14px] text-rp-ink">{d.active}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[13px] text-rp-muted">Leilões</dt>
                  <dd className="rp-num text-[14px] text-rp-ink">{d.auctions}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* Recent properties */}
      <section>
        <SectionHeader eyebrow="Últimos imóveis" title="Entradas mais recentes" />
        <div className="mt-6 border border-rp-line bg-rp-surface p-4">
          <DataTable
            caption="20 imóveis mais recentes"
            columns={[
              { key: "title", header: "Título", render: (row) => row.title },
              { key: "district", header: "Distrito", render: (row) => row.district },
              {
                key: "price",
                header: "Preço",
                numeric: true,
                render: (row) => `${row.price.toLocaleString()}€`,
              },
              { key: "source", header: "Fonte", render: (row) => row.sourceName },
              { key: "score", header: "Score", numeric: true, render: (row) => row.score ?? "—" },
              { key: "status", header: "Status", render: (row) => row.checkStatus || "pending" },
            ]}
            rows={recentProperties}
          />
        </div>
      </section>
    </PageShell>
  );
}
