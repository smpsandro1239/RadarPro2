"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { formatOptional, formatScoreOutOf100 } from "@/lib/format";
import Button from "@/components/ds/Button";

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
      <div className="flex h-[600px] items-center justify-center rounded-rp border border-rp-line bg-rp-ceramic">
        <p className="rp-eyebrow text-rp-muted">A carregar mapa…</p>
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
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => setIsDrawing(true)}
          variant={isDrawing ? "primary" : "secondary"}
          size="md"
        >
          {isDrawing ? "Desenhar (clique no mapa)" : "Desenhar área"}
        </Button>
        {isDrawing && (
          <Button type="button" onClick={finishDrawing} variant="primary" size="md">
            Concluir
          </Button>
        )}
        {polygonPoints.length > 0 && (
          <Button type="button" onClick={clearPolygon} variant="secondary" size="md">
            Limpar área
          </Button>
        )}
        {filteredIds && (
          <span className="rp-eyebrow inline-flex min-h-11 items-center border border-rp-cobalt bg-rp-ceramic px-3 text-rp-cobalt">
            {displayProperties.length} imóveis na área selecionada
          </span>
        )}
      </div>

      <div className="relative h-[600px] overflow-hidden rounded-rp border border-rp-line">
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
              pathOptions={{ color: "#1F4FA3", fillColor: "#1F4FA3", fillOpacity: 0.1 }}
            />
          )}
          {displayProperties.map((prop) => (
            <Marker
              key={prop.id}
              position={[prop.lat!, prop.lng!]}
            >
              <Popup>
                <div className="min-w-[220px] text-[var(--rp-ink)]">
                  <h3 className="rp-display text-[15px] leading-snug text-[var(--rp-ink)]">{prop.title}</h3>
                  <p className="mt-1 text-[12px] text-[var(--rp-muted)]">
                    {prop.municipality}, {prop.district}
                  </p>
                  <p className="rp-num mt-2 text-[18px] leading-none text-[var(--rp-cobalt)]">
                    {prop.price.toLocaleString()}€
                  </p>
                  {prop.score && (
                    <p className="rp-num mt-1 text-[12px] text-[var(--rp-ink-2)]">
                      Score: {formatScoreOutOf100(prop.score)} | {formatOptional(prop.discountPct === null ? null : -prop.discountPct, "%")}
                    </p>
                  )}
                  <a
                    href={`/imovel/${prop.id}`}
                    className="mt-2 inline-block text-[12px] text-[var(--rp-cobalt)] underline underline-offset-4 hover:text-[var(--rp-ink)]"
                  >
                    Ver detalhes →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="max-w-[70ch] text-[13px] leading-relaxed text-rp-muted">
        Dica: clique em "Desenhar área" e depois clique no mapa para definir os vértices do polígono.
        Clique em "Concluir" para filtrar os imóveis dentro da área.
      </p>
    </div>
  );
}
