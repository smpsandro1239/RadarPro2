# Design System — RadarPro2

Data: 2026-11-07
Contexto: Fase 3 de 13 do MASTER PROMPT — RadarPro2 Autonomous Development.

## 1. Tokens

Definição central em `src/app/globals.css` (CSS custom properties + `@theme`).

### Cores

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#FAFAF9` | Fundo principal (off-white quente) |
| `--surface` | `#FFFFFF` | Superfície padrão |
| `--surface-elevated` | `#FFFFFF` | Superfície elevada |
| `--border` | `#E2E8F0` | Bordas |
| `--foreground` | `#334155` | Texto principal |
| `--text-primary` | `#0F172A` | Texto forte (navy) |
| `--text-secondary` | `#64748B` | Texto secundário |
| `--text-disabled` | `#94A3B8` | Texto desativado |
| `--primary` | `#0F172A` | Cor primária (navy profundo) |
| `--secondary` | `#64748B` | Cor secundária neutra |
| `--accent` | `#B45309` | Destaque (terracota/amber) |
| `--success` | `#22C55E` | Sucesso |
| `--warning` | `#D97706` | Aviso |
| `--error` | `#DC2626` | Erro |
| `--info` | `#2563EB` | Informação |

### Tipografia

- **Família:** Inter (Google Fonts importado em `globals.css`), fallback system-ui.
- **Pesos:** 400, 500, 600, 700, 800.
- **Títulos:** `font-extrabold`; hierarquia via Tailwind scale.
- **Números:** `tabular-nums` (substituiu `font-mono` em valores monetários).

### Espaçamento, dimensões, efeitos

- Escala Tailwind default (4px base) — sem valores arbitrários novos introduzidos.
- Border radius padrão Tailwind (rounded-2xl etc.).
- Shadows Tailwind (`shadow-sm`…`shadow-xl`).

## 2. Componentes

- Buttons: `bg-primary text-white rounded-lg font-bold hover:opacity-90`.
- Cards: `border rounded-2xl`.
- Badges: score/verification/etc via tokens semânticos.

## 3. Estado atual

- Tokens consolidados nesta fase; componentes migrados aos tokens (navy/terracota).
- Design System documentado em `docs/DESIGN_SYSTEM.md`.

## 4. Próximos passos (Fases 4–8)

- Página interna de demonstração de componentes (se compatível).
- Motion design, charts, responsividade, a11y, QA.
