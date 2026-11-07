# Skills — OpenCode (Fase 2 do prompt mestre)

Data: 2026-11-07
Contexto: Fase 2 de 13 do MASTER PROMPT — RadarPro2 Autonomous Development.

## Situação

O OpenCode disponibiliza um catálogo próprio de Skills (o diretório separado
`~/.config/opencode/skills/` não existe neste ambiente; os skills ativas
pertencem ao catálogo do harness OpenCode).

## Skills relevantes para o RadarPro2 (Fase 2)

| Skill | Origem | Finalidade | Estado |
|---|---|---|---|
| `frontend-design` | OpenCode harness | Design de interfaces profissionais, design tokens, componentes | Ativa |
| `design-tokens-theming` | OpenCode harness | Tokens de design, cores, tipografia, temas | Ativa |
| `tailwind-patterns` | OpenCode harness | Tailwind CSS v4, padrões, design tokens | Ativa |
| `web-design-guidelines` | OpenCode harness | Padrões de design web, acessibilidade visual | Ativa |
| `responsive-layout` | OpenCode harness | Layout responsivo, breakpoints | Ativa |
| `empty-and-loading-states` | OpenCode harness | Estados vazios/carregamento | Ativa |
| `frontend-react-best-practices` | OpenCode harness | React/Next performance | Ativa |
| `nextjs-developer` | OpenCode harness | Next.js App Router | Ativa |
| `clean-code` | OpenCode harness | Padrões de código | Ativa |

## Skills avaliadas e não adotadas nesta fase

- `motion-design`: não existe skill dedicada no catálogo ativo; microinterações
  passam a ser tratadas via CSS/Tailwind (ver Fase 5).
- `accessibility` (WCAG completa): coberta parcialmente por `frontend-design` /
  `web-design-guidelines`; auditoria dedicada registada na Fase 7.

## Instalação

Não foram necessárias instalações adicionais: o catálogo do OpenCode já cobre as
áreas de frontend design, design tokens, Tailwind e estados. Instalações
adicionais só serão feitas quando uma fase exigir uma capability específica
e documentar-se-á aqui.

## Verificação

Skills acima listadas reconhecidas no catálogo ativo do OpenCode (v2.2.5) no
momento da auditoria.

## Próximos passos (Fase 3)

- Consolidar Design System completo em `src/app/globals.css` + `docs/DESIGN_SYSTEM.md`.
