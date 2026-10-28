import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { properties, users } from "@/db/schema";

const ADMIN_EMAIL = "smpsandro1239@gmail.com";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.email !== ADMIN_EMAIL) redirect("/");

  const allProperties = await db.select().from(properties);
  const allUsers = await db.select().from(users);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">{allProperties.length}</div>
          <div className="text-secondary text-sm">Imóveis</div>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">{allUsers.length}</div>
          <div className="text-secondary text-sm">Utilizadores</div>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">
            {allUsers.filter((u) => u.plan === "pro").length}
          </div>
          <div className="text-secondary text-sm">Subscritores Pro</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Scraping</h2>
      <div className="bg-white border rounded-xl p-6 mb-8">
        <p className="text-secondary mb-4">
          Disparar scraping de fontes imobiliárias portuguesas.
        </p>
        <form action="/api/scrape" method="POST" className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Distrito</label>
            <select name="district" className="px-4 py-2 border rounded-lg">
              <option value="Lisboa">Lisboa</option>
              <option value="Porto">Porto</option>
              <option value="Braga">Braga</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"
          >
            Iniciar Scraping
          </button>
        </form>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {allProperties.slice(0, 20).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.district}</td>
                <td className="p-3">{p.price.toLocaleString()}€</td>
                <td className="p-3">{p.sourceName}</td>
                <td className="p-3">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
