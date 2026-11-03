# Progresso — RadarPro (modo continuo)

Historico por iteracao, mais recente no topo.

## Iteração 1 – WP1 Gate de release: token rodado + segredos no repo (2026-11-03 00:38)

Semáforo: Dados 🟡 (sem BD local; a unica base configurada e a live) · Motor 🟡 (v1 e v2 em paralelo, `ValuationCard` ainda usa v1) · UI 🟡 (rankings tratam null como 0; badge de fonte com escala trocada) · Segurança 🔴 (token Turso vazado em uso e presente em 19 commits do historico) · Deploy 🟡 (build local passa; `CRON_SECRET` por definir na Vercel e preview por fazer)

✅ O que esta bem — so o que MEDISTE
- `npm run verify` -> typecheck + typecheck:scripts + vitest + build passam (build gerou as rotas `/oportunidades/[distrito]`, `/api/valuation`, `/sitemap.xml`).
- `npm run release:check` -> exit 1 com 3 bloqueios: token em uso com fingerprint `1bb0c1abb032` (`.env` e `.env.local`) e token em uso presente no historico git (75 commits); avisos: `CRON_SECRET` definido, BD remota, JWT de CDN em `scripts/seed.mjs`.
- `npx vitest run src/lib/__tests__/release-check.test.ts` -> 14 testes passam (inclui casos de CLI que falham sem a correcao: token vazado -> exit 1; token novo -> exit 0; `--only-env-file` fora de teste -> FALHA; git indisponivel -> FALHA).
- `git log --all -S<token>` -> 19 commits mudaram o token em uso (desde `f60dbc7`); `git grep -F -f` confirma o token em 75 arvores de commit. O commit `26da8ae` removeu-o dos scripts, mas o historico mantem o valor.
- Deteção de segredos em ficheiros versionados e nao versionados: 0 bloqueios; 1 aviso (JWT assinado dentro de URL de CDN em `scripts/seed.mjs:54`).
- Revisao de seguranca (subagente security-auditor): 1a ronda REPROVADO com 6 bloqueantes -> corrigidos -> 2a ronda APROVADO.

❌ O que esta mal / riscos
- Token Turso por rodar: o gate de release fica vermelho ate a rotacao (acao do dono).
- O token em uso esta no historico git: reescrever o historico e acao do dono (alerta do prompt, regra 4).
- `scripts/seed.mjs:90` faz `DELETE FROM properties` antes de inserir e le `.env.local` (que aponta para a live): correr o seed apaga a base live. Nao foi executado.
- `scripts/add_all_districts.mjs:113` gera ids `gen-*` com dados sinteticos: ids que nao distinguem origem real de dados de demonstracao.
- `scripts/backfill-*.ts` escrevem diretamente na BD configurada, sem `--write`/dry-run nem bloqueio para BD remota.
- Erros meus nesta iteracao, corrigidos antes do commit: (1) a 1a versao do detetor de segredos marcou como FALHA um JWT de URL de CDN em `scripts/seed.mjs` (falso positivo) — corrigido com validacao do header JWT e classificacao URL-embedded como AVISO, com teste de regressao; (2) `String.matchAll` com regex nao-global lancou TypeError e o script crashou — corrigido com `/g`; (3) um teste falhava porque `runChecks` nao aceitava a lista de fingerprints extra — parametrizei; (4) `tsc` falhou porque `ProcessEnv` exige `NODE_ENV` — tipo corrigido; (5) o verificador de seguranca reprovou o WP1 na 1a ronda (6 bloqueantes: env herdado no teste, `--env-file` que bypassava o gate, flags de salto sem restricao, git a falhar em modo fail-open, `.env.production`/`.env.development`/`.env.test` nao lidos, `export VAR=` mal parseado) — todos corrigidos e re-aprovados na 2a ronda.
- O gate agora falha fechado: se o git nao responder, sai em FALHA; se nao houver token em nenhum `.env*`, sai em AVISO "nada foi verificado"; as flags de bypass so funcionam com `NODE_ENV=test` e imprimem "MODO TESTE - invalido para release".
- `npm run typecheck` inclui o ficheiro de teste em `src/` que importa `scripts/`: o gate de release fica coberto pelo typecheck principal, mas `scripts/` continua fora do `include` principal.

🆕 O que deves acrescentar — propostas (nao implementadas)
- Bloquear escrita contra BD remota nos scripts de backfill · porquê: hoje `backfill-*.ts` pode escrever na live sem querer · impacto M · esforco M (WP11).
- `data_origin` por coluna em vez de inferir pelo prefixo do id · porquê: `gen-*` e ids manuais nao distinguem seed de scrape real · impacto M · esforco M (WP4).
- Verificar o historico git em modo offline (bundle) no CI · porquê: hoje so o gate local apanha o token no historico · impacto B · esforco M.

🔧 Decisoes que tomei por defeito
- O gate classifica JWT dentro de URL como AVISO e nao como bloqueio: em `scripts/seed.mjs` e um link assinado de CDN, nao um segredo do projeto. Podes vetar: se preferires bloquear qualquer JWT versionado, mudo o nivel para FALHA.
- O fingerprint de referencia (`1bb0c1abb032`) fica em codigo como lista de tokens vazados, e `RADARPRO_EXTRA_LEAKED_FINGERPRINTS` so acrescenta (nunca substitui).
- Sem BD local criada nesta iteracao: o unico `TURSO_DATABASE_URL` aponta para a live, e criar/escrever em BD live e acao do dono. Medicoes de dados ficam para a iteracao do WP4.

👤 Fila para o dono (nao bloqueia o ciclo)
1. Rodar o token Turso e revogar o antigo (fingerprint `1bb0c1abb032`).
2. Decidir o historico git: reescrever ou aceitar o risco com o token rodado.
3. Definir `CRON_SECRET` na Vercel.
4. Preview da `fase1-integracao` (log ou URL) e merge para `main`.
5. Confirmar se `scripts/seed.mjs`/`add_all_districts.mjs` devem continuar a apontar para a live (proposta: exigirem `--write` + base local).

📊 Numeros
- BD local: inexistente (0 imoveis) — a base configurada e a live, que nao foi lida nem escrita nesta iteracao.
- Repo: 48 imoveis no `scripts/seed.mjs` (ids manuais `cs-*`, `iv-*`, `ib-*`), 0 ids `gen-*` no seed (os `gen-*` estao em `scripts/add_all_districts.mjs`), 1 JWT versionado (aviso, link CDN).
- Testes: 14 testes novos do gate de release; suite completa a verde no `npm run verify`.
- Historico git: 75 arvores de commit contem o token em uso (19 commits alteraram-no).
- Ficheiros de ambiente: `.env`, `.env.local` (token `1bb0c1abb032`); `.env.production`, `.env.development`, `.env.test` nao existem e passam a ser lidos e bloqueados pelo `.gitignore`.

▶ Proxima iteracao: WP2 — triagem de termos de utilizacao dos portais -> `docs/PORTAIS.md`

⚠ PENDENTE: rotacao do token Turso (hash 1bb0c1abb032 = vazado). Gate final: nao esta feito.

## Estado para retomar

- Branch: `fase2-dev` (base `fase1-integracao`). `main` intocada. Sem push para `main`.
- WP atual: WP1 concluido (commit local em Preparation). Proximo: WP2.
- Em aberto / por decidir: nivel do aviso para JWT dentro de URL; estrategia para o historico git com o token; dados de mercado do `src/lib/market-data.ts` (estaticos em codigo, com fontes declaradas INE/Confidencial) — carecem de confirmacao do dono.
- BD: nao existe base local. Live = `libsql://...turso.io` (intocada). Para trabalho local: criar ficheiro libsql local e apontar `TURSO_DATABASE_URL` para ele.
- Comandos uteis: `npm run verify` (typecheck + typecheck:scripts + vitest + build), `npm run release:check` (gate; exit 1 enquanto o token estiver vazado), `npx vitest run <ficheiro>`.
- Regras ativas: sem dependencias novas, commits pequenos, teste novo por correcao, nada inventado (sem dados -> null + aviso), relatorio em `docs/PROGRESS.md`, backlog em `docs/BACKLOG.md`.
