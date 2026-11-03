import { getLatestProperties } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import PropertyGrid from "@/components/PropertyGrid";
import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import PageShell from "@/components/ds/PageShell";
import Button from "@/components/ds/Button";

export default async function OportunidadesPage() {
  unstable_noStore();
  const session = await getSession();
  if (!session) redirect("/auth");

  const properties = await getLatestProperties();

  return (
    <PageShell
      eyebrow="Área pessoal"
      title="Oportunidades em Portugal"
      description={`Olá, ${session.email} — ${properties.length} imóveis disponíveis`}
      actions={
        <form action="/api/auth/logout" method="POST">
          <Button type="submit" variant="secondary" size="md">
            <LogOut size={16} aria-hidden="true" /> Sair
          </Button>
        </form>
      }
    >
      <Suspense
        fallback={
          <div className="mb-8 h-96 animate-pulse border border-rp-line bg-rp-ceramic" />
        }
      >
        <PropertyGrid
          properties={properties}
          totalCount={properties.length}
          pageParam={1}
          perPage={24}
        />
      </Suspense>
    </PageShell>
  );
}
