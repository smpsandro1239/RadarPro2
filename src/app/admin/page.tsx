import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { properties, users, searchAlerts, savedProperties } from "@/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";

const ADMIN_EMAIL = "smpsandro1239@gmail.com";

export default async function AdminPage() {
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

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{allProperties.length}</div>
          <div className="text-xs text-secondary">Total imóveis</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{activeProps.length}</div>
          <div className="text-xs text-secondary">Ativos</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{inactiveProps.length}</div>
          <div className="text-xs text-secondary">Inativos</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{auctionProps.length}</div>
          <div className="text-xs text-secondary">Leilões</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{allUsers.length}</div>
          <div className="text-xs text-secondary">Utilizadores</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{allUsers.filter((u) => u.plan === "pro").length}</div>
          <div className="text-xs text-secondary">Subscritores Pro</div>
        </div>
      </div>

      {/* Data quality */}
      <h2 className="text-2xl font-bold mb-4">Qualidade de dados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-4">Imagens</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${(withImages.length / allProperties.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold">{withImages.length}/{allProperties.length}</span>
          </div>
          <p className="text-xs text-secondary">
            {withImages.length} com imagens reais, {withoutImages.length} com placeholder
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-4">Geocoding</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full"
                style={{ width: `${(geocoded.length / allProperties.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold">{geocoded.length}/{allProperties.length}</span>
          </div>
          <p className="text-xs text-secondary">
            {geocoded.length} geocodificados, {notGeocoded.length} pendentes
          </p>
        </div>
      </div>

      {/* Check status */}
      <h2 className="text-2xl font-bold mb-4">Verificação de links</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{checkStats.ok}</div>
          <div className="text-xs text-secondary">OK (vivos)</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{checkStats.notFound}</div>
          <div className="text-xs text-secondary">Não encontrados</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{checkStats.error}</div>
          <div className="text-xs text-secondary">Erros</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-secondary">{checkStats.pending}</div>
          <div className="text-xs text-secondary">Pendentes</div>
        </div>
      </div>

      {lastChecked && (
        <p className="text-sm text-secondary mb-8">
          Última verificação: {new Date(lastChecked.lastChecked!).toLocaleString("pt-PT")}
        </p>
      )}

      {/* Actions */}
      <h2 className="text-2xl font-bold mb-4">Ações</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-2">Scraping</h3>
          <p className="text-secondary text-sm mb-4">Disparar scraping de fontes imobiliárias.</p>
          <form action="/api/scrape" method="POST" className="flex gap-2 items-end">
            <select name="district" className="px-3 py-2 border rounded-lg text-sm">
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Braga">Braga</option>
            </select>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">
              Iniciar
            </button>
          </form>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-2">Verificação de links</h3>
          <p className="text-secondary text-sm mb-4">Verifica se imóveis ainda estão à venda (50 por execução).</p>
          <a href="/api/cron/check-links" className="inline-block bg-slate-100 text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">
            Verificar agora
          </a>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-2">Geocoding</h3>
          <p className="text-secondary text-sm mb-4">Geocodifica imóveis sem coordenadas (30 por execução).</p>
          <a href="/api/cron/geocode" className="inline-block bg-slate-100 text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">
            Geocodificar agora
          </a>
        </div>
      </div>

      {/* By source */}
      <h2 className="text-2xl font-bold mb-4">Por fonte</h2>
      <div className="bg-white border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Fonte</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Ativos</th>
              <th className="text-right p-3">Com imagem</th>
            </tr>
          </thead>
          <tbody>
            {sourceStats.map((s) => (
              <tr key={s.source} className="border-t">
                <td className="p-3 font-medium">{s.source}</td>
                <td className="p-3 text-right">{s.count}</td>
                <td className="p-3 text-right text-success">{s.active}</td>
                <td className="p-3 text-right">{s.withImages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* By district */}
      <h2 className="text-2xl font-bold mb-4">Por distrito</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {districtStats.map((d) => (
          <div key={d.district} className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-2">{d.district}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Total</span>
                <span className="font-bold">{d.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Ativos</span>
                <span className="font-bold text-success">{d.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Leilões</span>
                <span className="font-bold text-orange-500">{d.auctions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent properties */}
      <h2 className="text-2xl font-bold mb-4">Últimos imóveis</h2>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Distrito</th>
              <th className="text-left p-3">Preço</th>
              <th className="text-left p-3">Fonte</th>
              <th className="text-left p-3">Score</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {allProperties
              .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
              .slice(0, 20)
              .map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 truncate max-w-[200px]">{p.title}</td>
                  <td className="p-3">{p.district}</td>
                  <td className="p-3">{p.price.toLocaleString()}€</td>
                  <td className="p-3 text-xs">{p.sourceName}</td>
                  <td className="p-3">{p.score}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      p.checkStatus === "ok" ? "bg-green-100 text-green-700" :
                      p.checkStatus === "not_found" ? "bg-red-100 text-red-700" :
                      p.checkStatus === "error" ? "bg-yellow-100 text-yellow-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {p.checkStatus || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
