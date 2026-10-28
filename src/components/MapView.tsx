"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components (client-side only)
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
  lat?: number;
  lng?: number;
}

// Default coordinates for districts
const districtCoords: Record<string, [number, number]> = {
  Lisboa: [38.7223, -9.1393],
  Porto: [41.1579, -8.6291],
  Braga: [41.5454, -8.4265],
};

export default function MapView({ properties }: { properties: Property[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[500px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <p className="text-secondary">A carregar mapa...</p>
      </div>
    );
  }

  // Center on average of properties
  const center: [number, number] = [40.0, -8.5];

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border">
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
        {properties.map((prop) => {
          const coords = prop.lat && prop.lng
            ? [prop.lat, prop.lng] as [number, number]
            : districtCoords[prop.district] || [40.0, -8.5];
          // Add small random offset for properties in same district
          const offsetLat = (Math.random() - 0.5) * 0.05;
          const offsetLng = (Math.random() - 0.5) * 0.05;

          return (
            <Marker
              key={prop.id}
              position={[coords[0] + offsetLat, coords[1] + offsetLng]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{prop.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {prop.municipality}, {prop.district}
                  </p>
                  <p className="font-bold text-blue-600">
                    {prop.price.toLocaleString()}€
                  </p>
                  {prop.score && (
                    <p className="text-xs">
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
          );
        })}
      </MapContainer>
    </div>
  );
}
