"use client";

import { useState } from "react";
import { Car, Train, Footprints, Clock } from "lucide-react";

interface CommuteEstimatorProps {
  propertyLat: number;
  propertyLng: number;
}

// Estimate commute time based on straight-line distance (Haversine formula)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// City centers
const cityCenters: Record<string, [number, number]> = {
  Lisboa: [38.7223, -9.1393],
  Porto: [41.1579, -8.6291],
  Braga: [41.5454, -8.4265],
  Faro: [37.0194, -7.9304],
  Coimbra: [40.2033, -8.4103],
};

export default function CommuteEstimator({ propertyLat, propertyLng }: CommuteEstimatorProps) {
  const [destination, setDestination] = useState("Lisboa");
  const [mode, setMode] = useState<"car" | "transit" | "walk">("car");

  const dest = cityCenters[destination];
  if (!dest) return null;

  const distance = haversineDistance(propertyLat, propertyLng, dest[0], dest[1]);

  // Estimate time based on mode (rough estimates for Portugal)
  const speedKmh = mode === "car" ? 40 : mode === "transit" ? 25 : 5;
  const timeMinutes = Math.round((distance / speedKmh) * 60);

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Clock size={20} className="text-primary" />
        Estimativa de deslocação
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-secondary mb-1">Destino</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {Object.keys(cityCenters).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary mb-1">Modo</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("car")}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition ${mode === "car" ? "bg-primary text-white" : "bg-slate-100"}`}
            >
              <Car size={14} className="mx-auto" />
            </button>
            <button
              onClick={() => setMode("transit")}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition ${mode === "transit" ? "bg-primary text-white" : "bg-slate-100"}`}
            >
              <Train size={14} className="mx-auto" />
            </button>
            <button
              onClick={() => setMode("walk")}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition ${mode === "walk" ? "bg-primary text-white" : "bg-slate-100"}`}
            >
              <Footprints size={14} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-primary">
          {timeMinutes < 60 ? `${timeMinutes} min` : `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`}
        </div>
        <div className="text-xs text-secondary mt-1">
          Distância: {distance.toFixed(1)} km (estimativa)
        </div>
      </div>

      <p className="text-xs text-secondary">
        * Estimativa baseada em distância em linha reta. Tempos reais podem variar.
      </p>
    </div>
  );
}
