import { getAllActiveProperties } from "@/lib/queries";
import MapView from "@/components/MapView";
import PageShell from "@/components/ds/PageShell";
import StatCard from "@/components/ds/StatCard";

export default async function MapaPage() {
  const properties = await getAllActiveProperties();

  const withCoords = properties.filter((p) => p.lat && p.lng);
  const districts = ["Lisboa", "Porto", "Braga"];

  return (
    <PageShell
      eyebrow="Mapa"
      title="Mapa de oportunidades"
      description={`${withCoords.length} de ${properties.length} imóveis com localização no mapa.`}
      backHref="/"
      backLabel="Voltar ao início"
    >
      <MapView properties={properties} />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {districts.map((district) => (
          <StatCard
            key={district}
            label={district}
            value={properties.filter((p) => p.district === district).length}
            hint="imóveis registados"
          />
        ))}
      </div>
    </PageShell>
  );
}
