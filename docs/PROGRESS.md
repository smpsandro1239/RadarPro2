# Progresso — RadarPro (modo continuo)

Historico por iteracao, mais recente no topo.

## Iteração 4 – WP4 Origem dos dados: `data_origin`, `SHOW_SEED_DATA` e banner (2026-11-03 02:35)

Semáforo: Dados 🟢 (base local criada, migracoes aplicadas e origem registada por imovel) · Motor 🟡 (o motor v2 continua a ler area/freguesia que a base local nao tem) · UI 🟡 (banner implementado mas so aparece com `SHOW_SEED_DATA=true`) · Segurança 🟢 (dados sinteticos fora das listagens publicas por omissao) · Deploy 🟡 (a base live nao tem a coluna `data_origin`; decisao do dono pendente)

✅ O que esta bem — so o que MEDISTE
- `npm run db:local:seed` -> `local.db` criada; migracoes aplicadas por ordem: `drizzle/0000`, `drizzle/0001`, `scripts/sql/0002`, `scripts/sql/0003` (data_origin); seed local -> 48 imoveis.
- `npm run backfill:origin` (dry-run) -> "Imoveis: 48, Distribuicao: {"demo":48}"; com `--write` -> "48 imoveis actualizados". `--write` contra URL remoto -> "RECUSA" e exit 1.
- `npm run db:stats` (BD local) -> 48 imoveis; `area_sqm` 0 (0%); `parish` 0 (0%); `market_value` 48 (100%); `score` 48 (100%); `rentability > 0` 43 (89,6%); `data_origin = 'demo'` 48 (100%); scores: 28 em 80-100 e 20 em 60-79; anomalias: 0 em todas as 6 categorias; URLs duplicadas: 0.
- `npx vitest run src/lib/__tests__/data-origin.test.ts` -> 8 testes passam, incluindo um que executa a condicao SQL gerada pelo Drizzle numa base temporaria e compara o resultado com a funcao TypeScript (mesmo conjunto de ids).
- Consultas publicas (`src/lib/queries.ts`)ja filtram os dados de demonstracao por omissao; `SHOW_SEED_DATA=true` desliga o filtro e mostra o banner "Dados de demonstracao".

❌ O que esta mal / riscos
- Os 100% de `market_value` e `score` na base local vem de valores fixos do `scripts/seed.mjs`, nao do motor v2: medem a qualidade do seed, nao a do motor. Com 0% de area e 0% de freguesia o motor v2 nao consegue produzir avaliacoes em EUR/m2.
- `data_origin` existe apenas na base local: `src/db/schema.ts` continua sem a coluna, para nao partir a base live (o runtime faz `select` de todas as colunas declaradas). Ate o dono aplicar a migracao, a origem nas consultas publicas vem da heuristica do id.
- A heuristica de id e uma inferencia, nao uma prova: `cs-bra-real-1` (demo) e `cs-lisboa-165000-1a2b3c` (scrape) so se distinguem pelo formato; ha 3 formatos diferentes de id de demo nos scripts de seed (`cs-lis-1`, `cs-bra-real-1`, `bidizi-bra-1`).
- O `scripts/seed.mjs` grava `created_at` em segundos e o schema Drizzle espera milissegundos: datas dos imoveis do seed ficam em 1970 no site.
- O banner so aparece com `SHOW_SEED_DATA=true`; se o dono quiser o site em producao com dados de demonstracao, tem de ligar a flag e o banner aparece.
- Erro meu: a primeira versao da heuristica aceitava so ids de 3 segmentos (`[a-z]{2,4}`) e classificava 10 ids de demo (`cs-bra-real-1`) como "scraped" — o teste "todos os ids dos scripts de seed sao de demonstracao" apanhou-o; regra corrigida para "termina em 1-3 digitos, sem numeros de 4+ digitos, 3 ou 4 segmentos".

🆕 O que deves acrescentar — propostas (nao implementadas)
- Coluna `data_origin` no `src/db/schema.ts` + migracao na live em conjunto · porquê: hoje a origem e inferida, e o motor le dados que a BD live nao tem · impacto M · esforco M (decisao do dono).
- Corrigir `created_at` em unidades na ingestao e no seed · porquê: datas erradas em 48 imoveis do seed · impacto B · esforco B.
- Backfill de `parish`/`area_sqm` a partir do texto de localizacao e do detalhe do anuncio · porunque: sem area e freguesia o motor v2 nao avalia em EUR/m2 · impacto A · esforco M (WP6).

🔧 Decisoes que tomei por defeito
- `SHOW_SEED_DATA` e falso por omissao: as listagens publicas excluem os dados de demonstracao. Podes vetar: com a flag a true o site volta a mostrar-los (com banner).
- Nao acrescentei `data_origin` a `src/db/schema.ts`: a base live nao tem a coluna e o runtime faz `select` de todas as colunas declaradas — mudar o schema antes da migracao live parte o site.
- O backfill de `data_origin` corre em dry-run por omissao e recusa `--write` contra uma base remota.

👤 Fila para o dono (nao bloqueia o ciclo)
1. Aplicar as migracoes 0002 e 0003 na base live (ou autorizar a alteracao do schema.ts em conjunto com a migracao).
2. Decidir se o site em producao mostra ou nao os dados de demonstracao (SHOW_SEED_DATA).
3. Confirmar as unidades e os valores de mercado reais (o `src/lib/market-data.ts` tem dados estaticos em codigo com fontes declaradas).

📊 Numeros (BD local, `local.db`)
- Imoveis: 48 | demo: 48 (100%) | scraped: 0 | area: 0 (0%) | freguesia: 0 (0%) | market_value: 48 (100%) | score: 48 (100%) | rentability > 0: 43 (89,6%)
- Scores: 80-100 -> 28 | 60-79 -> 20 | 1-39 -> 0 | sem score -> 0
- Fontes: Casa Sapo 22 | Millennium BCP 7 | Santander 6 | Montepio 5 | Caixa Imobiliario 4 | Credito Agricola 3 | Imovirtual 1
- Anomalias: 0 (preco <= 0, score sem preco, market_value abaixo do preco, rendimento > 20%, area <= 0, sem score e sem market_value) | URLs duplicadas: 0

▶ Proxima iteracao: WP5 — dry-run de scraping real so na BD local (apenas canais oficiais: Martelo.pt API e Estamo RSS)

⚠ PENDENTE: rotacao do token Turso (hash 1bb0c1abb032 = vazado). Gate final: nao esta feito.

## Iteração 3 – WP3 Correções pendentes: `authorizeWrite`, `it.fails` e ids (2026-11-03 01:50)

Semáforo: Dados 🟡 (sem base local) · Motor 🟡 (v1 e v2 em paralelo) · UI 🟡 (rankings com null tratado como 0) · Segurança 🟢 (comparacao do segredo em tempo constante e gate de release aprovado) · Deploy 🟡 (CI agora corre o gate de release)

✅ O que esta bem — so o que MEDISTE
- `src/lib/api-auth.ts` passou a comparar o segredo em tempo constante sobre digests SHA-256 (32 bytes fixos): o tamanho do segredo deixa de vazar pelo tempo de execucao.
- `npx vitest run src/lib/__tests__/api-auth.test.ts` -> 8 testes passam (sem `CRON_SECRET` -> 500; token errado/vazio/prefixo do segredo -> 401; `Bearer` e `x-cron-secret` correctos -> autorizado; sessao de admin -> autorizado sem `CRON_SECRET`; sessao de outro utilizador -> 401).
- `npx vitest run src/lib/__tests__/legacy-it-fails.test.ts` -> 3 testes passam: limite de 6 `it.fails` no repo e `TODO` obrigatorio a menos de 12 linhas de cada `it.fails` (o TODO foi acrescentado aos 5 testes legados e ao do contrato de schema).
- `npm run check:ids` -> 170 ids analisados; 18 ids duplicados entre scripts de insercao (bloqueio, exit 1); 21 ids repetidos no total (3 desses so em scripts de correccao, que reescrevem de proposito); 1 id sintetico `gen-${...}`.
- `npm run verify` -> typecheck + typecheck:scripts + vitest + build a verde (19 ficheiros de teste, 153 testes + 6 `it.fails` esperados).

❌ O que esta mal / riscos
- 18 ids duplicados entre scripts de insercao (`el-lis-1`, `ls-lis-1`, `mart-lis-1`, `id-lis-1`, `iv-por-1`, `ib-lis-1`...): se dois scripts forem corridos em sequencia, o segundo falha por violacao de chave primaria ou substitui dados.
- O limite de 6 `it.fails` e uma baseline: so desce quando o WP7 migrar os 5 testes legados; enquanto nao descer, o CI nao avisa.
- `scripts/fix_urls.mjs`, `fix_all.mjs`, `fix_auction_urls.mjs` e `fix_martelo_urls.mjs` reutilizam ids dos scripts de insercao: classificado como "repetido" e nao bloqueia, mas continua a ser ambiguo.
- O `x-cron-secret` continua a ser aceite como header alternativo: mantem-se por compatibilidade com o que ja esta em producao, mas duplica a superficie de segredo.
- Erro meu: o primeiro teste de inventario contava as suas propias ocorrencias de `it.fails(` (ficava fora do limite) — corrigido com auto-exclusao do ficheiro de teste.

🆕 O que deves acrescentar — propostas (nao implementadas)
- Prefixo unico para os scripts de correccao (ex.: `fix:`) ou ficheiro de ids por script · porquê: ids repetidos entre insercao e correccao sao a fonte de bugs de chave primaria · impacto B · esforco B.
- Teste de integracao que corra os scripts de seed numa base temporaria e falhe com ids duplicados · porquê: hoje so o script `check:ids` deteta a colisao · impacto B · esforco M.

🔧 Decisoes que tomei por defeito
- O `check:ids` bloqueia so em duplicados entre scripts de insercao; ids repetidos em scripts de correccao ficam como aviso, porque ali a repeticao e o objectivo.
- Mantive o header `x-cron-secret` (nao o removi) para nao partir chamadas ja existentes; a rotacao do segredo continua a ser a forma suportada de o inutilizar.

👤 Fila para o dono (nao bloqueia o ciclo)
1. Rodar o token Turso (fingerprint `1bb0c1abb032`).
2. Confirmar se o `scripts/seed.mjs`/`add_all_districts.mjs` devem continuar a apontar para a live (proposta: exigirem `--write` e base local).

📊 Numeros
- BD local: inexistente (esta iteracao nao criou base). Repo: 170 ids de seed analisados, 18 duplicados bloqueantes, 1 id sintetico, 6 `it.fails` com limite fixado.

▶ Proxima iteracao: WP4 — `data_origin`, `SHOW_SEED_DATA` e banner "Dados de demonstracao"

⚠ PENDENTE: rotacao do token Turso (hash 1bb0c1abb032 = vazado). Gate final: nao esta feito.

### Resumo executivo (iteracoes 1-3)
1. O gate de release existe e esta vermelho por uma razao unica e externa: o token Turso esta vazado e presente em 75 arvores de commit.
2. A revisao de seguranca reprovou o WP1 na 1a ronda; as 12 correcoes foram aplicadas e a 2a ronda approveu.
3. Sem base local, nada de dados podia ser medido: a base live ficou intocada.
4. `authorizeWrite` ja nao vaza o tamanho do segredo; 8 testes cobrem os caminhos de autorizacao.
5. Os 5 testes legados com `it.fails` tem agora limite (6) e `TODO` obrigatorio.
6. 18 ids duplicados entre scripts de insercao estao identificados e a bloquear (exit 1).
7. O codigo faz hoje scraping de portais cujos termos proíbem recolha automatica — risco juridico registado no WP2.
8. Semáforo: Dados 🟡 | Motor 🟡 | UI 🟡 | Seguranca 🟡 | Deploy 🟡 (o unico 🔴 era o token, que e acao do dono).
9. Numeros: 145 testes + 6 `it.fails` antes; 153 + 6 agora; 170 ids de seed analisados; 18 duplicados.
10. Proximo bloco: criar a base local (WP4) e so depois medir dados.

## Iteração 2 – WP2 Triagem de termos de utilização dos portais (2026-11-03 01:20)

Semáforo: Dados 🟡 (sem base local) · Motor 🟡 (v1 e v2 em paralelo) · UI 🟡 · Segurança 🔴 (os scrapers activos violam os termos de 9 portais) · Deploy 🟡

✅ O que esta bem — so o que MEDISTE
- `docs/PORTAIS.md` criado com 18 portais, cada um com: estado da recolha automatica, citacao curta da clausula, URL exacta, data de consulta (2026-11-03), API/feed oficial e resumo do `robots.txt`.
- Veredictos: `recolher` 2 (Martelo.pt via API oficial `https://martelo.pt/public-api/events`; Estamo via feed RSS `https://www.estamo.pt/imoveis/feed/`), `nao recolher` 9 (Casa Sapo, Idealista, OLX, CustoJusto, Imobancos, Millennium BCP, Montepio, Credito Agricola, BPI Expresso), `depende do dono` 6 (Imovirtual, e-Leiloes, Leilosoc, Bidizi, Santander, Caixa Imobiliario, Novo Banco).
- Clausulas com texto exato obtidas: Casa Sapo ("A reproducao, alteracao, copia, uso... sem autorizacao da Janela Digital"), Idealista ("...utilizando qualquer tipo de robot, spider, scraper ou outro meio automatico"), OLX ("E proibida qualquer agregacao e processamento de dados... tendo em vista a sua partilha com terceiros"), CustoJusto (robots.txt: "E expressamente proibido usar spiders ou outros metodos automatizados").

❌ O que esta mal / riscos
- Os scrapers existentes (`src/lib/scrapers.ts`) fazem recolha automatica de HTML em Casa Sapo, Imovirtual, Idealista, OLX, CustoJusto, Imobancos, Millennium BCP, Santander, Montepio, Caixa Imobiliario, Credito Agricola, Novo Banco e BPI Expresso: em 9 desses portais os termos proíbem explicitamente, e o resto ficou ambiguo ou por verificar.
- `www.bpiexpressoimobiliario.pt` (usado em `scrapeBPI`) nao existe (NXDOMAIN): esse scraper esta partido.
- 4 portais ficaram com termos `nao verificados` porque o texto so e servido por JavaScript (Imovirtual: Help Center Salesforce; Santander, Caixa Imobiliario, Novo Banco): sem decisao do dono, nada se recolhe dali.
- O `robots.txt` do Imovirtual traz `Content-Signal: ai-input=no, ai-train=no`; o da Casa Sapo traz `ai-train=no`.
- Nao ha nenhuma chave de API configurada no repositorio (Martelo.pt e Bidizi exigem plano Silver/Gold).

🆕 O que deves acrescentar — propostas (nao implementadas)
- Adaptador para a API publica do Martelo.pt e para o feed RSS do Estamo · porquê: sao os unicos canais permitidos encontrados · impacto M · esforco M.
- Politica de recolha por portal no codigo (allowlist em `src/lib/scrapers.ts`) · porquê: hoje qualquer scraper corre sem verificacao de termos · impacto M · esforco M.
- Pedir autorizacao escrita a Casa Sapo/Imovirtual/Idealista · porquê: sao as tres maiores fontes de anuncios em Portugal · impacto A · esforco M (depende do dono).

🔧 Decisoes que tomei por defeito
- O dry-run do WP5 fica limitado aos canais oficiais (Martelo.pt API, Estamo RSS). Nao ha recolha de HTML em portal nenhum ate haver decisao do dono.
- Nao contornei nenhuma proteccao anti-bot nem robots.txt bloqueado.

👤 Fila para o dono (nao bloqueia o ciclo)
1. Decidir os portais `depende do dono` (Imovirtual, e-Leiloes, Leilosoc, Bidizi, Santander, Caixa Imobiliario, Novo Banco).
2. Obter/confirmar chave da API do Martelo.pt e o uso comercial permitido (plano Silver/Gold).
3. Confirmar se a autorizacao da OLX Developer Portal (OAuth2) e via a usar.

📊 Numeros
- 18 portais triados: 2 recolher, 9 nao recolher, 6 dependem do dono (1 dos quais com dominio inexistente). 0 recolhas de HTML autorizadas.

▶ Proxima iteracao: WP3 — `authorizeWrite`, `it.fails` legados e ids duplicados/`gen-*`

⚠ PENDENTE: rotacao do token Turso (hash 1bb0c1abb032 = vazado). Gate final: nao esta feito.

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
- Commits: `3c925e7` WP1 gate de release; `5775dbf` WP3 seguranca/it.fails/ids. (WP2 e WP4 por confirmar no commit em curso.)
- WP actual: WP4 terminado (base local + `data_origin` + `SHOW_SEED_DATA` + banner). Proximo: WP5 (dry-run so via Martelo.pt API e Estamo RSS).
- Base local: `local.db` (gitignored) com migracoes 0000, 0001, 0002, 0003 e 48 imoveis de seed (todos `data_origin = 'demo'`). A live (`libsql://...turso.io`) continua intocada.
- Em aberto / por decidir: migrar a live (0002 e 0003) ou alterar `src/db/schema.ts`; `SHOW_SEED_DATA` em producao; portais `depende do dono` do WP2; unidades e valores de mercado reais (o `src/lib/market-data.ts` tem dados estaticos em codigo).
- Comandos uteis: `npm run verify` (typecheck + typecheck:scripts + vitest + build), `npm run release:check` (gate; exit 1 enquanto o token estiver vazado), `npm run db:local:reset` / `db:local:seed`, `npm run db:stats`, `npm run backfill:origin` (dry-run; `--write` recusa base remota), `npm run check:ids`.
- Regras ativas: sem dependencias novas, commits pequenos, teste novo por correcao, nada inventado (sem dados -> null + aviso), relatorio em `docs/PROGRESS.md`, backlog em `docs/BACKLOG.md`, termos dos portais em `docs/PORTAIS.md`.
