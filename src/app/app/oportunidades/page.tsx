import { getLatestProperties } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import PropertyGrid from "@/components/PropertyGrid";
import { Suspense } from "react";

export default async function OportunidadesPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  const properties = await getLatestProperties();

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Oportunidades em Portugal</h1>
          <p className="text-secondary">
            Olá, {session.email} — {properties.length} imóveis disponíveis
          </p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <LogOut size={16} /> Sair
          </button>
        </form>
      </div>

        <Suspense fallback={<div className="animate-pulse h-96 bg-slate-100 rounded-xl mb-8"></div>}>
          <PropertyGrid
            properties={properties}
            totalCount={properties.length}
            pageParam={1}
            perPage={24}
          />
        </Suspense>
    </main>
  );
}
