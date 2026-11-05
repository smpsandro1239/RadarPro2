"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";

export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export default function HeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  const key = useMemo(
    () => points.map((p) => `${p.lat}:${p.lng}:${p.intensity}`).join("|"),
    [points],
  );

  useEffect(() => {
    const cleanup = () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };

    if (points.length === 0) {
      cleanup();
      return;
    }

    let cancelled = false;
    import("leaflet.heat").then(({ HeatLayer }) => {
      if (cancelled) return;
      const layer = new (HeatLayer as any)(points.map((p) => [p.lat, p.lng, p.intensity]), {
        radius: 30,
        blur: 20,
        minOpacity: 0.35,
        max: 1,
        gradient: { 0: "#ef4444", 0.5: "#eab308", 1: "#16a34a" },
        maxZoom: 12,
      });
      layerRef.current = layer;
      map.addLayer(layer);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [map, key]);

  return null;
}
