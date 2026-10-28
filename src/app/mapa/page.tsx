import { getAllActiveProperties } from "@/lib/queries";
import MapView from "@/components/MapView";

export default async function MapaPage() {
  const properties = await getAllActiveProperties();

  const withCoords = properties.filter((p) => p.lat && p.lng);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-2">Mapa de Oportunidades</h1>
      <p className="text-secondary mb-8">
        {withCoords.length} de {properties.length} imóveis com localização no mapa.
      </p>

      <MapView properties={properties} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary">{properties.filter((p) => p.district === "Lisboa").length}</div>
          <div className="text-sm text-secondary">Lisboa</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary">{properties.filter((p) => p.district === "Porto").length}</div>
          <div className="text-sm text-secondary">Porto</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary">{properties.filter((p) => p.district === "Braga").length}</div>
          <div className="text-sm text-secondary">Braga</div>
        </div>
      </div>
    </main>
  );
}
