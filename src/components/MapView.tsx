"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false }
);

// Component to handle map clicks
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((m) => {
      const { useMapEvents } = m;
      function ClickHandler({ onClick }: { onClick: (e: any) => void }) {
        useMapEvents({ click: onClick });
        return null;
      }
      return ClickHandler;
    }),
  { ssr: false }
);

interface Property {
  id: string;
  title: string;
  district: string;
  municipality: string;
  price: number;
  score: number | null;
  discountPct: number | null;
  lat?: number | null;
  lng?: number | null;
  geoQuality?: string | null;
}

export default function MapView({ properties }: { properties: Property[] }) {
  const [mounted, setMounted] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [filteredIds, setFilteredIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[600px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <p className="text-secondary">A carregar mapa...</p>
      </div>
    );
  }

  const mappable = properties.filter((p) => p.lat && p.lng);

  const isInsidePolygon = (lat: number, lng: number, polygon: [number, number][]) => {
    if (polygon.length < 3) return true;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  const handleMapClick = (e: any) => {
    if (!isDrawing) return;
    const { lat, lng } = e.latlng;
    setPolygonPoints((prev) => [...prev, [lat, lng]]);
  };

  const finishDrawing = () => {
    if (polygonPoints.length >= 3) {
      const inside = new Set(
        mappable
          .filter((p) => isInsidePolygon(p.lat!, p.lng!, polygonPoints))
          .map((p) => p.id)
      );
      setFilteredIds(inside);
    }
    setIsDrawing(false);
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    setFilteredIds(null);
    setIsDrawing(false);
  };

  const displayProperties = filteredIds
    ? mappable.filter((p) => filteredIds.has(p.id))
    : mappable;

  const center: [number, number] = [39.5, -8.0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsDrawing(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            isDrawing ? "bg-primary text-white" : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          {isDrawing ? "Desenhar (clique no mapa)" : "Desenhar área"}
        </button>
        {isDrawing && (
          <button
            onClick={finishDrawing}
            className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Concluir
          </button>
        )}
        {polygonPoints.length > 0 && (
          <button
            onClick={clearPolygon}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
          >
            Limpar área
          </button>
        )}
        {filteredIds && (
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
            {displayProperties.length} imóveis na área selecionada
          </span>
        )}
      </div>

      <div className="h-[600px] rounded-2xl overflow-hidden border relative">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <MapClickHandler onClick={handleMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polygonPoints.length > 0 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.1 }}
            />
          )}
          {displayProperties.map((prop) => (
            <Marker
              key={prop.id}
              position={[prop.lat!, prop.lng!]}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <h3 className="font-bold text-sm mb-1">{prop.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {prop.municipality}, {prop.district}
                  </p>
                  <p className="font-bold text-blue-600 text-lg">
                    {prop.price.toLocaleString()}€
                  </p>
                  {prop.score && (
                    <p className="text-xs mt-1">
                      Score: {prop.score}/100 | -{prop.discountPct}%
                    </p>
                  )}
                  <a
                    href={`/imovel/${prop.id}`}
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Ver detalhes →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="text-xs text-secondary">
        Dica: clique em "Desenhar área" e depois clique no mapa para definir os vértices do polígono.
        Clique em "Concluir" para filtrar os imóveis dentro da área.
      </p>
    </div>
  );
}
