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

const MODES = [
  { id: "car", label: "Carro", Icon: Car },
  { id: "transit", label: "Transporte público", Icon: Train },
  { id: "walk", label: "A pé", Icon: Footprints },
] as const;

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
    <section className="border border-rp-line bg-rp-surface p-5 shadow-rp-1">
      <h2 className="rp-display flex items-center gap-2 text-[24px] leading-tight text-rp-ink">
        <Clock size={20} className="text-rp-cobalt" aria-hidden="true" />
        Estimativa de deslocação
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="commute-destination" className="rp-eyebrow mb-1 block text-rp-muted">
            Destino
          </label>
          <select
            id="commute-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="min-h-11 w-full rounded-rp border border-rp-line bg-rp-bg px-3 py-2 text-[14px] text-rp-ink transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:border-rp-ink-2"
          >
            {Object.keys(cityCenters).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="rp-eyebrow mb-1 block text-rp-muted">Modo</span>
          <div className="flex gap-2">
            {MODES.map(({ id, label, Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-label={label}
                  aria-pressed={active}
                  title={label}
                  className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-rp border transition-[transform,box-shadow,color,background-color,border-color] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] ${
                    active
                      ? "border-rp-ink bg-rp-ink text-rp-surface shadow-rp-2"
                      : "border-rp-line bg-rp-bg text-rp-ink-2 hover:-translate-y-px hover:border-rp-ink-2 hover:text-rp-ink"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-rp-line bg-rp-ceramic p-4 text-center">
        <p className="rp-num text-[32px] leading-none text-rp-cobalt">
          {timeMinutes < 60 ? `${timeMinutes} min` : `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`}
        </p>
        <p className="mt-2 text-[13px] text-rp-muted">
          Distância: {distance.toFixed(1)} km (estimativa)
        </p>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-rp-muted">
        * Estimativa baseada em distância em linha reta. Tempos reais podem variar.
      </p>
    </section>
  );
}
