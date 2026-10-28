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

  // Only show properties with coordinates
  const mappable = properties.filter((p) => p.lat && p.lng);

  // Center on Portugal
  const center: [number, number] = [39.5, -8.0];

  return (
    <div className="h-[600px] rounded-2xl overflow-hidden border">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappable.map((prop) => (
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
                {prop.geoQuality && (
                  <p className="text-xs text-gray-400">
                    Localização: {prop.geoQuality}
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
  );
}
