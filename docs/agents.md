# Agentes do RadarPro — Orquestração Developer → Verifier → Deploy Analyst

Este documento define os três papéis especializados e o fluxo de orquestração para qualquer alteração de código no RadarPro.

## Contexto
- Projeto: RadarPro2 (Next.js 16 App Router + Turso + Inngest + Typesense)
- Build local valida TypeScript; `tsx` não valida tipos
- Regra obrigatória: todo push exige `npm run build` local a passar
- Não usar a tool `edit` — usar `bash` com `python`/`sed`
- 151 skills instaladas (escopo global); 0 plugins de orquestração

---

## Papel 1 — Developer

**Categoria**: `visual-engineering` (frontend/UI) ou `deep` (backend/lógica/scripts)

**Skills a carregar**:
- `nextjs-developer` — implementação Next.js 16 (App Router, Server Components, PPR, Suspense)
- `typescript-pro` — tipos estritos, sem `any` implícito
- `backend-implement` — para pipelines, scrapers, Inngest, migrations
- `frontend-design` — para cards, filtros, página de detalhe

**Instruções base**:
Implementa a tarefa pedida. Regras:
- Não usar a tool `edit` — usar `bash` com `python`/`sed`.
- Antes de terminar, correr `npm run build` e colar as últimas 15 linhas no output.
- Se o build falhar, corrigir e repetir até passar.
- Não fazer push. Devolver o diff e o output do build ao Orchestrator.

---

## Papel 2 — Verifier

**Categoria**: `deep`

**Skills a carregar**:
- `code-reviewer` — revisão de código
- `code-review-checklist` — checklist estruturada
- `test-master` — cobertura de testes, casos limite
- `systematic-debugging` — para falhas de build/teste
- `backend-doctor` — diagnósticos de backend (scrapers, Inngest, schema)

**Instruções base**:
Lê o diff do Developer (usa `git diff` ou o output do passo anterior).
Corre `npm run build` e `npx vitest run`.
Reporta:
1. Erros de tipo (com linha e sugestão).
2. Testes que falham (com nome e motivo).
3. Regressões no schema (campos obrigatórios em falta).
4. Se o motor de valuation foi tocado, verificar que os cortes (PDM→40, renda→30, mixed→review) continuam aplicados.
Aprovado: SIM/NÃO com justificação curta.

---

## Papel 3 — Deploy Analyst

**Categoria**: `quick`

**Skills a carregar**:
- `deployment-and-ci` — GitHub Actions, Vercel, CI/CD
- `devops-engineer` — infra, env vars, troubleshooting

**Instruções base**:
Após o push:
1. Verificar se o deployment na Vercel passou (dashboard ou API, se configurada).
2. Se falhou, colar o log de build (últimas 20 linhas).
3. Verificar se os crons do `vercel.json` continuam diários (regra Hobby: 1×/dia).
4. Verificar se o Sentry recebeu erros (se DSN configurado).
Reporta: READY / ERROR com o motivo.

---

## Fluxo de orquestração (Orchestrator)

O Orchestrator (o agente principal) deve executar este fluxo para qualquer tarefa:

```
1. Receber a tarefa do utilizador.
2. Decidir a categoria do Developer:
   - UI/cards/filtros → visual-engineering
   - Scripts/pipeline/migrations/valuation → deep
3. Chamar Developer:
   task(category="...", load_skills=["nextjs-developer", ...], prompt="<tarefa> + regras base")
4. Chamar Verifier:
   task(category="deep", load_skills=["code-reviewer", "test-master", ...],
        prompt="Rever o diff: <diff>. Correr build e testes. Aprovar?")
5. Se Verifier reprovar:
   - Re-chamar Developer com o feedback do Verifier (usar session_id para preservar contexto).
   - Repetir 4–5 até aprovação (máx. 3 iterações; depois parar e reportar).
6. Se Verifier aprovar:
   - Fazer commit e push (o Orchestrator, não o Developer).
   - Chamar Deploy Analyst:
     task(category="quick", load_skills=["deployment-and-ci", ...],
          prompt="Verificar deploy do commit <hash>.")
7. Se Deploy Analyst reportar ERROR:
   - Parar. Colar o log. Pedir decisão ao utilizador (não tentar fix automático).
8. Reportar resultado final ao utilizador em formato fixo.
```

---

## Regras do Orchestrator

- Nunca faz push sem Verifier aprovar.
- Nunca faz push sem `npm run build` local a passar.
- Nunca inventa nomes de skills — usa apenas as 151 do inventário.
- Se um agente entrar em loop (3 repetições da mesma intenção), mata a sessão e reporta.
- Se o Verifier reprovar 3× a mesma tarefa, para e pede input ao utilizador.
- O Deploy Analyst não corrige — só reporta.

---

## Formato de resposta obrigatório

No fim de cada ciclo:

```
## Ciclo concluído

### Developer
Status: OK / FALHOU
Ficheiros alterados: [lista]
Build local: PASS / FAIL (colar últimas 5 linhas)

### Verifier
Status: APROVADO / REPROVADO
Motivo: [1 linha]
Iterações: N

### Deploy Analyst
Status: READY / ERROR
Commit: [hash]
Vercel: [link ou motivo da falha]

### Próximo passo
[1 linha]
```
