"use client";

import { useId } from "react";
import { GROUND, PARTS, type MaquettePart } from "./maquette-data";
import styles from "./CityMaquette.module.css";

/** Projecao isometrica (30 graus) usada na versao movel. */
const COS30 = Math.cos(Math.PI / 6);

type Point = { X: number; Y: number };

function project(x: number, y: number, z: number): Point {
  return { X: (x - y) * COS30, Y: (x + y) * 0.5 - z };
}

function points(list: Point[]): string {
  return list.map((point) => `${point.X.toFixed(1)},${point.Y.toFixed(1)}`).join(" ");
}

const PATTERN_BY_MATERIAL: Record<string, string | null> = {
  ceramic: "ceramic",
  glass: "glass",
  opportunity: "opportunity",
  anomaly: "anomaly",
  metal: null,
};

const TOP_BY_MATERIAL: Record<string, string> = {
  ceramic: "#f7f9fa",
  glass: "#7c9bb6",
  opportunity: "#f26b3a",
  anomaly: "#e7b04a",
  metal: "#c4cdd6",
};

const SIDE_BY_MATERIAL: Record<string, string> = {
  ceramic: "#e7ebee",
  glass: "#35506b",
  opportunity: "#3a3f4a",
  anomaly: "#2b3138",
  metal: "#8d98a5",
};

const SHADE_BY_MATERIAL: Record<string, string> = {
  ceramic: "#dbe1e5",
  glass: "#2a3f54",
  opportunity: "#2e323a",
  anomaly: "#232930",
  metal: "#78838f",
};

function PartShapes({ part, prefix }: { part: MaquettePart; prefix: string }) {
  const z = part.z ?? 0;
  const topA = project(part.x, part.y, z + part.h);
  const topB = project(part.x + part.w, part.y, z + part.h);
  const topC = project(part.x + part.w, part.y + part.d, z + part.h);
  const topD = project(part.x, part.y + part.d, z + part.h);
  const botB = project(part.x + part.w, part.y, z);
  const botC = project(part.x + part.w, part.y + part.d, z);
  const botD = project(part.x, part.y + part.d, z);

  if (part.ghost) {
    return (
      <g>
        <polygon points={points([topA, topB, topC, topD])} fill="rgba(31,79,163,.16)" stroke="rgba(31,79,163,.85)" strokeWidth={1} />
        <polygon points={points([topB, topC, botC, botB])} fill="rgba(31,79,163,.16)" stroke="rgba(31,79,163,.85)" strokeWidth={1} />
        <polygon points={points([topD, topC, botC, botD])} fill="rgba(31,79,163,.16)" stroke="rgba(31,79,163,.85)" strokeWidth={1} />
      </g>
    );
  }

  const pattern = PATTERN_BY_MATERIAL[part.material];
  const topFill = pattern ? `url(#${prefix}-${pattern})` : TOP_BY_MATERIAL[part.material];
  return (
    <g>
      <polygon points={points([topB, topC, botC, botB])} fill={SHADE_BY_MATERIAL[part.material]} />
      <polygon points={points([topD, topC, botC, botD])} fill={SIDE_BY_MATERIAL[part.material]} />
      <polygon points={points([topA, topB, topC, topD])} fill={topFill} />
    </g>
  );
}

export default function MaquetteSvg({ onSelect }: { onSelect?: (itemId: string) => void }) {
  const rawId = useId();
  const prefix = `rp-svg${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const sorted = [...PARTS].sort((a, b) => {
    const depth = a.x + a.y - (b.x + b.y);
    if (depth !== 0) return depth;
    return (a.z ?? 0) - (b.z ?? 0);
  });

  return (
    <svg
      className={styles.svgPlate}
      viewBox="-400 -160 800 620"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={`${prefix}-ceramic`} width="10" height="9" patternUnits="userSpaceOnUse">
          <rect width="10" height="9" fill="#e7ebee" />
          <rect width="10" height="2" fill="rgba(30,50,75,.3)" />
        </pattern>
        <pattern id={`${prefix}-glass`} width="10" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill="#35506b" />
          <rect width="10" height="3" fill="rgba(175,220,255,.6)" />
          <rect x="9" width="1" height="8" fill="rgba(10,22,38,.55)" />
        </pattern>
        <pattern id={`${prefix}-opportunity`} width="10" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill="#3a3f4a" />
          <rect width="10" height="3" fill="rgba(255,180,100,.95)" />
          <rect x="9" width="1" height="8" fill="rgba(40,20,10,.6)" />
        </pattern>
        <pattern id={`${prefix}-anomaly`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#2b3138" />
          <rect width="5" height="10" fill="#e7b04a" />
        </pattern>
      </defs>

      <polygon
        points={points([
          project(0, 0, 0),
          project(440, 0, 0),
          project(440, 440, 0),
          project(0, 440, 0),
        ])}
        fill="#f4f6f7"
        stroke="rgba(18,24,33,.2)"
        strokeWidth={1}
      />

      {GROUND.map((ground) => {
        const fill = ground.kind === "road" ? "#2a313b" : ground.kind === "park" ? "#a9cdb4" : "#8db3e0";
        return (
          <polygon
            key={ground.id}
            points={points([
              project(ground.x, ground.y, 0.5),
              project(ground.x + ground.w, ground.y, 0.5),
              project(ground.x + ground.w, ground.y + ground.d, 0.5),
              project(ground.x, ground.y + ground.d, 0.5),
            ])}
            fill={fill}
          />
        );
      })}

      {sorted.map((part) => (
        <g
          key={part.id}
          onClick={part.itemId && onSelect ? () => onSelect(part.itemId as string) : undefined}
          style={part.itemId ? { cursor: "pointer" } : undefined}
        >
          <PartShapes part={part} prefix={prefix} />
        </g>
      ))}
    </svg>
  );
}
