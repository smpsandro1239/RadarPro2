"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MaquetteSvg from "./MaquetteSvg";
import {
  GROUND,
  ITEMS_BY_ID,
  KEYBOARD_EXAMPLES,
  PARTS,
  formatEuros,
  type MaquetteMaterial,
  type MaquettePart,
} from "./maquette-data";
import styles from "./CityMaquette.module.css";

const MATERIAL_CLASS: Record<MaquetteMaterial, { top: string; side: string }> = {
  ceramic: { top: styles.matCeramicTop, side: styles.matCeramic },
  glass: { top: styles.matGlassTop, side: styles.matGlass },
  opportunity: { top: styles.matOpportunityTop, side: styles.matOpportunity },
  anomaly: { top: styles.matAnomalyTop, side: styles.matAnomaly },
  metal: { top: styles.matMetalTop, side: styles.matMetal },
};

const GROUND_CLASS: Record<string, string> = {
  road: styles.roadV,
  park: styles.park,
  water: styles.water,
};

function GroundPatches() {
  return (
    <>
      {GROUND.map((ground) => (
        <div
          key={ground.id}
          className={`${styles.ground} ${GROUND_CLASS[ground.kind] ?? ""}`}
          style={{ left: ground.x, top: ground.y, width: ground.w, height: ground.d }}
        />
      ))}
    </>
  );
}

type Part3DProps = {
  part: MaquettePart;
  isHighlighted: boolean;
  onEnter: (itemId: string) => void;
  onLeave: () => void;
  onSelect: (itemId: string) => void;
};

function Part3D({ part, isHighlighted, onEnter, onLeave, onSelect }: Part3DProps) {
  const { x, y, w, d, h, z = 0, rot = 0, material, ghost, itemId } = part;
  const side = MATERIAL_CLASS[material].side;
  const top = MATERIAL_CLASS[material].top;
  const faceClass = ghost ? styles.ghost : "";

  const faces = [
    { key: "top", className: `${styles.face} ${styles.faceTop} ${ghost ? faceClass : top}`, style: { left: 0, top: 0, width: w, height: d, transform: `translateZ(${h}px)` } },
    { key: "front", className: `${styles.face} ${styles.faceFront} ${ghost ? faceClass : side}`, style: { left: 0, top: d, width: w, height: h, transformOrigin: "top", transform: "rotateX(90deg)" } },
    { key: "back", className: `${styles.face} ${styles.faceBack} ${ghost ? faceClass : side}`, style: { left: 0, top: 0, width: w, height: h, transformOrigin: "top", transform: "rotateX(90deg)" } },
    { key: "right", className: `${styles.face} ${styles.faceRight} ${ghost ? faceClass : side}`, style: { left: w, top: 0, width: h, height: d, transformOrigin: "left", transform: "rotateY(-90deg)" } },
    { key: "left", className: `${styles.face} ${styles.faceLeft} ${ghost ? faceClass : side}`, style: { left: 0, top: 0, width: h, height: d, transformOrigin: "left", transform: "rotateY(-90deg)" } },
  ];

  return (
    <div
      className={styles.part}
      style={{
        left: x,
        top: y,
        width: w,
        height: d,
        transform: `translateZ(${z}px) rotateZ(${rot}deg)`,
        ...(isHighlighted && ghost ? { outline: "1px solid rgba(31,79,163,.9)" } : null),
      }}
      onPointerEnter={itemId ? () => onEnter(itemId) : undefined}
      onPointerLeave={itemId ? onLeave : undefined}
      onClick={itemId ? () => onSelect(itemId) : undefined}
    >
      {faces.map((face) => (
        <div key={face.key} className={face.className} style={face.style} />
      ))}
    </div>
  );
}

export default function CityMaquette() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const plate = plateRef.current;
    if (!stage || !plate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let current = 0;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = stage.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width - 0.5;
      target = Math.max(-1, Math.min(1, ratio * 2)) * 16;
    };

    const tick = () => {
      current += (target - current) * 0.08;
      plate.style.setProperty("--tilt", `${current.toFixed(2)}deg`);
      frame = requestAnimationFrame(tick);
    };

    stage.addEventListener("pointermove", onPointerMove);
    frame = requestAnimationFrame(tick);
    return () => {
      stage.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toggle = useCallback((itemId: string) => {
    setActiveId((current) => (current === itemId ? null : itemId));
  }, []);

  const active = activeId ? ITEMS_BY_ID.get(activeId) ?? null : null;
  const highlighted = hoveredId ?? activeId;

  return (
    <div>
      <figure style={{ margin: 0 }}>
        <div className={styles.stage} ref={stageRef} aria-hidden="true">
          <div className={styles.scene3d}>
            <div className={styles.plate} ref={plateRef}>
              <GroundPatches />
              {PARTS.map((part) => (
                <Part3D
                  key={part.id}
                  part={part}
                  isHighlighted={highlighted === part.itemId}
                  onEnter={setHoveredId}
                  onLeave={() => setHoveredId(null)}
                  onSelect={toggle}
                />
              ))}
              <div className={styles.plateEdge} />
              <div className={styles.sweep}>
                <div className={styles.arm} />
              </div>
              <div
                className={styles.part}
                style={{ left: 215, top: 215, width: 10, height: 10, transform: "translateZ(2px)" }}
              >
                <div
                  className={`${styles.face} ${styles.faceTop} ${styles.matGoldTop}`}
                  style={{ left: 0, top: 0, width: 10, height: 10, transform: "translateZ(10px)" }}
                />
                <div
                  className={`${styles.face} ${styles.faceFront} ${styles.matGold}`}
                  style={{ left: 0, top: 10, width: 10, height: 10, transformOrigin: "top", transform: "rotateX(90deg)" }}
                />
                <div
                  className={`${styles.face} ${styles.faceRight} ${styles.matGold}`}
                  style={{ left: 10, top: 0, width: 10, height: 10, transformOrigin: "left", transform: "rotateY(-90deg)" }}
                />
              </div>
            </div>
          </div>
          <div className={styles.svgScene}>
            <MaquetteSvg onSelect={toggle} />
          </div>
        </div>
        <figcaption className={styles.caption}>
          <strong className="rp-mono" style={{ color: "var(--rp-ink-2)" }}>EXEMPLO ILUSTRATIVO · FICTÍCIO</strong>{" "}
          — cada edifício é um imóvel: a altura é o preço pedido e o volume cobalto é a diferença até ao valor estimado.
        </figcaption>
      </figure>

      <div className={styles.readout}>
        <p className="rp-eyebrow" style={{ color: "var(--rp-cobalt)", margin: 0 }}>
          Exemplo ilustrativo · fictício
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600 }}>
          {active ? active.label : "Cartão de leitura"}
        </p>
        {active ? (
          <div className={styles.readoutGrid}>
            <div>
              <p className="rp-eyebrow" style={{ color: "var(--rp-muted)", margin: 0 }}>preço pedido</p>
              <p className={`${styles.readoutValue} rp-num`} style={{ margin: "2px 0 0" }}>
                {formatEuros(active.askingPrice)}
              </p>
            </div>
            <div>
              <p className="rp-eyebrow" style={{ color: "var(--rp-muted)", margin: 0 }}>valor estimado</p>
              <p className={`${styles.readoutValue} rp-num`} style={{ margin: "2px 0 0" }}>
                {active.estimatedValue === null ? "Sem avaliação" : formatEuros(active.estimatedValue)}
              </p>
            </div>
            <div>
              <p className="rp-eyebrow" style={{ color: "var(--rp-muted)", margin: 0 }}>nota</p>
              <p className={`${styles.readoutValue} rp-num`} style={{ margin: "2px 0 0" }}>
                {active.estimatedValue === null ? "—" : `± ${active.rangePct}%`}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--rp-ink-2)" }}>
            Passe o rato por um edifício — ou escolha um exemplo na lista — para ver o preço pedido, o valor estimado e a
            nota. Valores fictícios, apenas para explicar o produto.
          </p>
        )}
      </div>

      <ul className={styles.examples}>
        {KEYBOARD_EXAMPLES.map((id) => {
          const item = ITEMS_BY_ID.get(id);
          if (!item) return null;
          return (
            <li key={id}>
              <button
                type="button"
                className={styles.exampleButton}
                aria-pressed={activeId === id}
                onClick={() => toggle(id)}
              >
                <span>{item.label}</span>
                <span className="rp-num" style={{ fontSize: 12, color: "var(--rp-muted)" }}>
                  {formatEuros(item.askingPrice)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
