# Triagem de Termos de Utilização dos Portais (WP5)

**Data de consulta de todas as fontes:** 2026-11-03
**Âmbito:** apenas páginas de Termos/Condições/Avisos legais, `robots.txt`, documentação de API/feed e documentos oficiais.
**Não foi feito scraping nem fetch de páginas de anúncios.**

## Legenda

| Campo | Valores possíveis |
|---|---|
| Recolha automatica permitida | `permitida` \| `proibida` \| `ambigua` \| `nao verificada` |
| API ou feed oficial | `sim (URL)` \| `nao` \| `desconhecido` |
| Veredicto WP5 | `recolher` \| `nao recolher` \| `depende do dono` |

Notas de método:
- As citações são traduções/ transcrições próprias, com no máximo 25 palavras, da cláusula relevante.
- Quando a página de termos não pôde ser obtida, o estado fica `nao verificada` e são listadas as URLs tentadas. Nenhuma citação foi inventada.
- Duas páginas (Idealista .pt e os Help Centers Salesforce do OLX/Imovirtual) bloqueiam fetch direto (HTTP 403 / renderização só via JavaScript). O texto citado nessas entradas foi obtido do índice de pesquisa da própria página oficial (mesmo URL), e é assinalado como tal.
- Nos portais de crédito/banco é suficiente indicar se existem Termos que proíbam recolha automática e onde estão.

## Resumo

| Portal (nome no código) | Domínio | Recolha automatica | API ou feed oficial | robots.txt | Veredicto WP5 |
|---|---|---|---|---|---|
| Casa Sapo | casa.sapo.pt | proibida | sim (sitemap) | permite listagens; bloqueia áreas internas | nao recolher |
| Imovirtual | www.imovirtual.com | nao verificada | sim (sitemap) | permite `/`; `ai-input=no` | depende do dono |
| Idealista | www.idealista.pt | proibida | desconhecido | permite `/`; bloqueia ordenações/paginação/filtros | nao recolher |
| OLX | www.olx.pt | proibida | sim (developer.olx.pt) | permite `/`; bloqueia `/api/`, `/rss/`, contas | nao recolher |
| CustoJusto | www.custojusto.pt | proibida | desconhecido | declara spiders proibidos | nao recolher |
| e-Leiloes / e-Leilões | www.e-leiloes.pt | ambigua | desconhecido | permite `/`; bloqueia admin e `/api/` | depende do dono |
| Leilosoc | leilosoc.com | ambigua | sim (sitemap) | permite `/` (sem Disallow) | depende do dono |
| Martelo.pt | martelo.pt | ambigua | sim (public-api) | permite `/` e `/public-api/` seletivo | recolher (via API) |
| Bidizi | bidizi.pt | ambigua | sim (`/api/v1/*`) | permite `/`; bloqueia `/api/` | depende do dono |
| Estamo | www.estamo.pt | ambigua | sim (RSS oficial) | permite `/` | recolher (via feed) |
| Imobancos | imobancos.pt | proibida | desconhecido | permite `/`; bloqueia `/api/` | nao recolher |
| Millennium BCP | ind.millenniumbcp.pt | proibida | desconhecido | bloqueia a URL de imóveis alvo | nao recolher |
| Santander | www.santander.pt | nao verificada | desconhecido | permite `/` | depende do dono |
| Montepio | www.bancomontepio.pt | proibida | desconhecido | permite `/` | nao recolher |
| Caixa Imobiliário | www.caixaimobiliario.pt | nao verificada | desconhecido | sem robots.txt (devolve SPA) | depende do dono |
| Crédito Agrícola | cai.pt | proibida | desconhecido | permite `/` | nao recolher |
| Novo Banco | www.novobanco.pt | nao verificada | desconhecido | permite `/` | depende do dono |
| BPI Expresso | www.bpiexpressoimobiliario.pt | nao verificada | desconhecido | domínio inexistente | nao recolher |

---

## 1. Casa Sapo

- **Domínio:** `casa.sapo.pt` (o código usa `https://casa.sapo.pt/comprar-apartamentos/...`; `casasapo.pt` responde mas devolve 403 ao redireccionamento).
- **Recolha automatica permitida:** `proibida`
- **Citação:** "A reprodução, alteração, cópia, uso, distribuição ou qualquer outra utilização da informação contida no Portal sem autorização da Janela Digital." — https://casa.sapo.pt/general/condicoes/condicoes_portal.aspx (consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://casa.sapo.pt/sitemap.xml)` — sitemap index oficial; não encontrei API pública documentada.
- **robots.txt:** permite a raiz (listagens de imóveis); bloqueia áreas internas (`/ApiCall`, `/AJAX/`, `/AreaPessoal/`, `/MapaHTML/`, `/Images/`, `/PopUps/`…) e declara `Content-Signal: ai-train=no, search=yes, ai-input=yes`.
- **Veredicto WP5:** `nao recolher`
- **Notas:** as "Condições Gerais de Uso do Portal CASASAPO" são o único documento localizado; não encontrei cláusula específica sobre robots/scraping, mas a proibição genérica de reproduzir/copiar/utilizar a informação do Portal sem autorização cobre a recolha comercial. A página devolveu 429/403 em fetches diretos posteriores; o texto foi obtido via proxy de renderização de texto sobre o mesmo URL.

## 2. Imovirtual

- **Domínio:** `www.imovirtual.com`
- **Recolha automatica permitida:** `nao verificada`
- **Citação (robots.txt):** "Content-Signal: search=yes, ai-input=no, ai-train=no" — https://www.imovirtual.com/robots.txt (consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://www.imovirtual.com/sitemap.xml)` — o `robots.txt` autoriza explicitamente `/api/query?crawl=true`, mas esse endpoint devolveu HTTP 422 ("invalid request") sem parâmetros de consulta; sem API pública documentada para anúncios.
- **robots.txt:** permite `/` e `/api/query?crawl=true`; bloqueia `/ajax/`, `/adminpanel/`, `/api/query` (sem `crawl=true`), `/imprimir/`, `/pagamento/`; `Content-Signal` com `ai-input=no` e `ai-train=no` (recolha para alimentar modelos de IA não é concedida).
- **Veredicto WP5:** `depende do dono`
- **Notas / URLs tentadas:** Termos de Utilização em https://ajuda.imovirtual.com/imovirtualhelp/s/article/kA009000001vPCTCA2 (redirecciona para https://ajuda.imovirtual.com/imovirtualhelp/s/article/termos-e-condies-para-clientes-individuais-V32IMO); também https://www.imovirtual.com/pt/termos-e-condicoes/, https://www.imovirtual.com/termos-e-condicoes/, https://www.imovirtual.com/pt/avisos-legais/, https://www.imovirtual.com/pt/legal/ — todas 404. O Help Center (Salesforce) carrega o corpo do artigo por JavaScript/Aura; o fetch direto devolve apenas o "shell" e a indexação de pesquisa só devolve excertos parciais, pelo que **não foi possível extrair a cláusula**. Existe também uma "Política de Uso Aceitável" (https://ajuda.imovirtual.com/imovirtualhelp/s/article/poltica-de-uso-aceitvel-V7IMO) que também não foi extraível.

## 3. Idealista

- **Domínio:** `www.idealista.pt`
- **Recolha automatica permitida:** `proibida`
- **Citação:** "Aceder, monitorizar ou copiar qualquer informação contida nesta Web e Apps utilizando qualquer tipo de robot, spider, scraper ou outro meio automático." — https://www.idealista.pt/apoioutilizador/artigos/aviso-legal-e-condicoes-gerais/ (consulta 2026-11-03; texto obtido do índice de pesquisa do próprio URL, porque o fetch directo devolveu HTTP 403 do Cloudflare; cópia oficial em PDF: https://st1.idealista.pt/apoioutilizador/wp-content/uploads/2025/06/Condicoes-Gerais.pdf)
- **API ou feed oficial:** `desconhecido` — não encontrei API pública de anúncios documentada para o portal português (existe o programa de parceiros/"idealista PRO", fora do âmbito público).
- **robots.txt:** `https://www.idealista.pt/robots.txt` devolveu HTTP 403 (Cloudflare); o mesmo ficheiro foi obtido em https://st1.idealista.pt/robots.txt — não bloqueia a raiz, mas bloqueia ordenações, `/*/pagina-`, filtros com 3+ parâmetros, `/favoritos/`, `/imovel/*/foto`, `/imovel/*/virtualtour` e `/pt/`.
- **Veredicto WP5:** `nao recolher`
- **Notas:** a versão em português da mesma cláusula existe no PDF oficial acima ("qualquer tipo de robot, spider, scraper ou outro meio automático ou processo manual para tal finalidade, sem a nossa autorização expressa por escrito").

## 4. OLX

- **Domínio:** `www.olx.pt`
- **Recolha automatica permitida:** `proibida`
- **Citação:** "É proibida qualquer agregação e processamento de dados e outras informações disponíveis no Website tendo em vista a sua partilha com terceiros." — https://help.olx.pt/olxpthelp/s/article/termos-de-utilizao-V22 (consulta 2026-11-03; versão "Válido a partir de 04 de Maio de 2026", texto obtido do índice de pesquisa porque o Help Center Salesforce é renderizado por JavaScript)
- **API ou feed oficial:** `sim (https://developer.olx.pt/pt)` — "Portal de Developers OLX", com acesso à API (OAuth2, conta OLX e aprovação da aplicação) e Termos de Utilização da API em https://developer.olx.pt/doc/regulations.pt.pdf e https://developer.olx.pt/regulamentos.
- **robots.txt:** permite a raiz (`Allow: /`); bloqueia `*/ajax/`, `/adminpanel/`, `/api/`, `*/rss/`, `*/account/`, `*/myaccount/`, `/payment/`, `/adprint/`, `/anuncio/contact/`.
- **Veredicto WP5:** `nao recolher`
- **Notas:** a cláusula proíbe explicitamente a agregação/tratamento de dados do site para partilha com terceiros — que é precisamente o caso de uso do RadarPro. A via correta é a API oficial, sujeita a aprovação.

## 5. CustoJusto

- **Domínio:** `www.custojusto.pt` — o domínio correto é **custojusto.pt** (o código usa `https://www.custojusto.pt/<distrito>/imoveis`); `custaojusto.pt` e `custajusto.pt` não existem (NXDOMAIN).
- **Recolha automatica permitida:** `proibida`
- **Citação (robots.txt):** "É expressamente proibido usar spiders ou outros métodos automatizados para aceder ao CustoJusto.pt; só é permitido se o portal der autorização especial." — https://www.custojusto.pt/robots.txt (consulta 2026-11-03)
- **Citação complementar (Termos):** "Não é permitido copiar os textos dos anúncios de outros anunciantes" — https://www.custojusto.pt/ajuda-rules?section=termos (consulta 2026-11-03)
- **API ou feed oficial:** `desconhecido` — sem API pública documentada; existem sitemaps oficiais (https://www.custojusto.pt/sitemap_list.xml, https://www.custojusto.pt/sitemap_index.xml).
- **robots.txt:** permite a raiz mas bloqueia paginação/filtros (`/*?o=*`, `/*si=0*`), `/payments*`, `/login`, `/signup`, `/user/`, `/v2/`; a primeira linha do ficheiro declara a proibição expressa de spiders e métodos automatizados.
- **Veredicto WP5:** `nao recolher`

## 6. e-Leilões (código: `e-Leiloes` em `src/lib/scrapers.ts`, `e-Leilões` em `src/lib/scoring.ts`)

- **Domínio:** `www.e-leiloes.pt` (plataforma oficial da Ordem dos Solicitadores e dos Agentes de Execução)
- **Recolha automatica permitida:** `ambigua`
- **Citação:** "As regras de funcionamento da plataforma www.e-leiloes.pt foram aprovadas por Despacho da Ministra da Justiça nº 12624/2015." — https://www.e-leiloes.pt/api/Text/Regras/ (texto carregado pela SPA oficial; consulta 2026-11-03)
- **API ou feed oficial:** `desconhecido` — sem API pública documentada; o `robots.txt` bloqueia `/api/` (usada apenas internamente pela SPA); existe sitemap https://www.e-leiloes.pt/sitemap.xml.
- **robots.txt:** permite a raiz; bloqueia apenas áreas administrativas/autenticadas (`/Administracao/`, `/Gestao/`, `/Manutencao/`, `/AutenticacaoGov/`, `/api/`, `/*.axd$`, `/*.ashx$`).
- **Veredicto WP5:** `depende do dono`
- **Notas / URLs tentadas:** https://www.e-leiloes.pt/faq, https://www.e-leiloes.pt/regras, https://www.e-leiloes.pt/termos-e-condicoes, https://www.e-leiloes.pt/politica-de-privacidade, https://www.e-leiloes.pt/avisos-legais, https://www.e-leiloes.pt/regulamento.aspx, https://www.e-leiloes.pt/condicoes-gerais.aspx — todas devolvem apenas o "shell" da SPA (sem texto). Não localizei cláusula que proíba ou autorize recolha automatizada; os regimes aplicáveis são o Despacho n.º 12624/2015 e a legislação de vendas penhoradas.

## 7. Leilosoc

- **Domínio:** `leilosoc.com` (`leilosoc.pt` redirecciona 301 para `leilosoc.com`).
- **Recolha automatica permitida:** `ambigua`
- **Citação:** "O presente regulamento estabelece as regras gerais a que deve obedecer o serviço disponibilizado pela plataforma Leilosoc.com." — https://leilosoc.com/pt/termos-e-condicoes/ (consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://leilosoc.com/sitemap.xml)` — sitemaps oficiais (inclui `/auction/`, `/lot/`, `/category/`); sem API pública documentada (https://leilosoc.com/api devolve 404).
- **robots.txt:** `Allow: /` para `User-agent: *`, sem `Disallow`; declara 5 sitemaps.
- **Veredicto WP5:** `depende do dono`
- **Notas:** a página "Termos e Condições" é na verdade o Regulamento Geral de Venda de Bens (arts. 1.º a 5.º); obtive-o integralmente e **não contém** cláusula sobre recolha automatizada, robots ou reutilização de dados — daí `ambigua`.

## 8. Martelo.pt (código: `Martelo.pt` em `src/lib/scoring.ts`, `Martelo` em `src/lib/auction-calculator.ts`)

- **Domínio:** `martelo.pt`
- **Recolha automatica permitida:** `ambigua`
- **Citação:** "Fazer scraping automatizado massivo dos dados agregados sem autorização" / "Utilizar ferramentas automatizadas (bots) sem respeitar as regras do robots.txt e rate limits" — https://martelo.pt/termos.html (consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://martelo.pt/public-api/events)` — API pública oficial (JSON) que devolve os eventos agregados; sitemaps em https://martelo.pt/sitemap-index.xml. A exportação massiva de dados é, porém, produto Pro nos Termos.
- **robots.txt:** permite a raiz e `Allow` explícito para `/public-api/events`, `/public-api/events/`, `/public-api/leilao/`, `/public-api/sitemap*.xml`, `/public-api/distritos`, `/public-api/map/events`; bloqueia o resto de `/public-api/`, `/dashboard/`, `/login.html`.
- **Veredicto WP5:** `recolher`
- **Notas:** o scraping massivo está proibido, mas o canal sancionado é a API pública (respeitando rate limits); usar `/public-api/*` em vez de raspar HTML.

## 9. Bidizi (código: `Bidizi` em `src/lib/auction-calculator.ts`; portal `bidizi.pt`)

- **Domínio:** `bidizi.pt`
- **Recolha automatica permitida:** `ambigua`
- **Citação:** "A API pública da Bidizi (/api/v1/*) está incluída nos planos Silver e Gold; sem chave não há acesso." — https://bidizi.pt/legal/termos (consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://bidizi.pt/api/v1/*)` — API pública documentada nos Termos (planos Silver/Gold, header `X-API-Key`, limites 40/100 fichas por dia e 60 pedidos por minuto, atribuição "Fonte: Bidizi" obrigatória). Sem feed RSS.
- **robots.txt:** permite a raiz; bloqueia `/api/`, `/admin`, `/favoritos`, `/painel`, `/em-cache/`; para GPTBot/ChatGPT-User/ClaudeBot/OAI-SearchBot bloqueia adicionalmente query strings (`/*?`).
- **Veredicto WP5:** `depende do dono`
- **Notas:** obtive os Termos na íntegra e não localizei cláusula de proibição de recolha automatizada; o uso programático está previsto, mas apenas via API com subscrição e chave pessoal. A Bidizi é agregadora de dados públicos (Citius, Autoridade Tributária, leiloeiras com licença DGAE).

## 10. Estamo

- **Domínio:** `www.estamo.pt`
- **Recolha automatica permitida:** `ambigua`
- **Citação:** "é expressamente proibida qualquer cópia, reprodução, difusão, utilização, venda, modificação, ou qualquer outro uso, quaisquer que sejam os meios utilizados." — https://www.estamo.pt/politica-de-privacidade-e-de-protecao-de-dados-pessoais/ (secção "Direitos de Autor"; consulta 2026-11-03)
- **API ou feed oficial:** `sim (https://www.estamo.pt/imoveis/feed/)` — feed RSS oficial dos imóveis (WordPress) + https://www.estamo.pt/imoveis-sitemap.xml.
- **robots.txt:** permite a raiz; bloqueia apenas `/wp-admin/` (com `Allow: /wp-admin/admin-ajax.php`).
- **Veredicto WP5:** `recolher`
- **Notas:** não existe página de Termos de Utilização própria (só a Política de Privacidade, `page-sitemap.xml` só devolve essa página). A cláusula de direitos de autor proíbe copiar o conteúdo por quaisquer meios, mas o editor publica um feed RSS oficial de imóveis — a recolha deve ser feita **apenas pelo feed**, não por raspagem de páginas HTML.

---

## Portais de crédito / banco (penhores e immobilizado)

### 11. Imobancos

- **Domínio:** `imobancos.pt`
- **Recolha automatica permitida:** `proibida`
- **Citação:** "Recolher dados do portal por meios automatizados (scraping, crawlers) sem autorização prévia e por escrito." — https://imobancos.pt/termos (consulta 2026-11-03)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** permite a raiz; bloqueia `/api/`, `/en/api/`, `/fr/api/`; sitemap em https://imobancos.pt/sitemap.xml.
- **Veredicto WP5:** `nao recolher`

### 12. Millennium BCP

- **Domínio:** `ind.millenniumbcp.pt` (página de imóveis usada pelo código: https://ind.millenniumbcp.pt/pt/Particulares/viver/Imoveis/Pages/imoveis.aspx)
- **Recolha automatica permitida:** `proibida`
- **Citação:** "Não é permitida a reprodução total ou parcial de qualquer conteúdo veiculado nos canais remotos sem autorização prévia dos proprietários." — https://ind.millenniumbcp.pt/pt/info/Pages/cond_forn_informacoes.aspx (consulta 2026-11-03); índice legal em https://www.millenniumbcp.pt/informacao-contratual-legal
- **API ou feed oficial:** `desconhecido` — existe "Millennium API" para clientes/integração bancária, não para anúncios de imóveis.
- **robots.txt:** `ind.millenniumbcp.pt/robots.txt` bloqueia explicitamente a URL alvo do scraper (`Disallow: /pt/Particulares/viver/Imoveis/Pages/imoveis.aspx`), além de `/pt/Particulares/mobile/Pages/list.aspx`; `www.millenniumbcp.pt/robots.txt` permite a raiz (bloqueia `/webinfo`).
- **Veredicto WP5:** `nao recolher`

### 13. Santander

- **Domínio:** `www.santander.pt` (página de imóveis usada pelo código: https://www.santander.pt/pt-pt/pessoais/casa-imoveis/comprar/)
- **Recolha automatica permitida:** `nao verificada`
- **Citação:** — (nenhuma cláusula obtida; não inventar)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** permite a raiz; bloqueia `/pdfs/parcerias-santander/`, parâmetros `utm_source`, `tab`, `ad_campaign`, `clnt` e `/pesquisa?`.
- **Veredicto WP5:** `depende do dono`
- **Notas / URLs tentadas:** https://www.santander.pt/aviso-legal-copyright (Aviso Legal de Copyright — obtido; sem cláusula de recolha automatizada), https://www.santander.pt/condicoes-gerais-utilizacao (Condições Gerais de Utilização da Banca Digital — obtido; sem cláusula de recolha automatizada), https://www.santander.pt/politica-privacidade, https://www.santander.pt/condicoes-de-utilizacao (404), https://www.santander.pt/condicoes-utilizacao (404), https://www.santander.pt/informacao-legal (404).

### 14. Montepio

- **Domínio:** `www.montepio.pt` (redirecciona para `www.bancomontepio.pt`)
- **Recolha automatica permitida:** `proibida`
- **Citação:** "Não é permitida a reprodução de qualquer parte do website ou informação com o intuito de utilização da mesma para ganhos comerciais." — https://www.bancomontepio.pt/termos-utilizacao (n.º 10; consulta 2026-11-03)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** permite a raiz; bloqueia `/content/dam/montepio/...`, `/bin/`, `/system/`, `/apps/`, `/*.infinity.json`, `/*.query.json`, `/*.form.*`.
- **Veredicto WP5:** `nao recolher`
- **Notas:** o n.º 9 permite, apenas "desde que para uso pessoal", pesquisa e reprodução de excertos via impressão/download, com indicação da fonte — incompatível com agregação comercial.

### 15. Caixa Imobiliário

- **Domínio:** `www.caixaimobiliario.pt`
- **Recolha automatica permitida:** `nao verificada`
- **Citação:** — (nenhuma cláusula obtida; não inventar)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** **não existe** — `https://www.caixaimobiliario.pt/robots.txt` devolve o `index.html` da SPA (Angular), não um ficheiro robots.
- **Veredicto WP5:** `depende do dono`
- **Notas / URLs tentadas:** https://www.caixaimobiliario.pt/condicoes-de-utilizacao (rota existente na SPA; conteúdo carregado via `api.cgd.pt`, não extraível), https://www.caixaimobiliario.pt/politica-de-privacidade, https://api.cgd.pt/translatable_config_pages/condicoes-de-utilizacao (404), https://api.cgd.pt/config_pages/condicoes-de-utilizacao (404).

### 16. Crédito Agrícola

- **Domínio:** `www.cai.pt` (página de imóveis do código: https://www.cai.pt/imoveis/<distrito>/)
- **Recolha automatica permitida:** `proibida`
- **Citação:** "É proibida a reprodução, distribuição ou modificação de qualquer conteúdo sem autorização prévia por escrito." — https://cai.pt/termos-e-condicoes/ (n.º 4, Propriedade Intelectual; consulta 2026-11-03)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** permite a raiz (bloco Yoast com `Disallow:` vazio); bloqueia `/wp-content/uploads/wc-logs/`, `woocommerce_transient_files/`, `woocommerce_uploads/`, parâmetros `add-to-cart` e `/wp-admin/` (excepto `admin-ajax.php`).
- **Veredicto WP5:** `nao recolher`

### 17. Novo Banco

- **Domínio:** `www.novobanco.pt` (página de imóveis do código: https://www.novobanco.pt/particulares/imoveis/<distrito>/)
- **Recolha automatica permitida:** `nao verificada`
- **Citação:** — (nenhuma cláusula obtida; não inventar)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** permite a raiz; bloqueia `/pdfs/*`, `/campanhas*`, `/remarketing*`, `/app-webviews*`, `/*.html`, `/english`, `/empresas/login*` e `/futuro-em-dia/*`.
- **Veredicto WP5:** `depende do dono`
- **Notas / URLs tentadas:** https://www.novobanco.pt/aviso-legal (Aviso Legal — obtido, sem cláusula de recolha automatizada), https://www.novobanco.pt/politicas-privacidade, https://www.novobanco.pt/politicas-cookies.

### 18. BPI Expresso

- **Domínio:** `www.bpiexpressoimobiliario.pt` — **o domínio não resolve** (NXDOMAIN confirmado por `nslookup` em 2026-11-03; a URL usada em `src/lib/scrapers.ts` está inacessível).
- **Recolha automatica permitida:** `nao verificada`
- **Citação:** — (nenhuma cláusula obtida; não inventar)
- **API ou feed oficial:** `desconhecido`
- **robots.txt:** inexistente (domínio inexistente).
- **Veredicto WP5:** `nao recolher`
- **Notas / URLs tentadas:** https://www.bpiexpressoimobiliario.pt/, https://www.bpiexpressoimobiliario.pt/robots.txt (DNS: Non-existent domain), https://www.bpiexpresso.pt/ (DNS: Non-existent domain). O portal BPI Expresso Imobiliário aparenta estar descontinuado.

---

## Notas finais para o dry-run do WP5

1. **Só há recolha legitimamente disponível sem escrevência ao proprietário em dois portais:** Martelo.pt (API pública `https://martelo.pt/public-api/events`) e Estamo (feed RSS oficial `https://www.estamo.pt/imoveis/feed/`). Em ambos, a recolha deve ser feita pelo canal oficial e não por raspagem de HTML.
2. **Bidizi** tem API oficial (`/api/v1/*`), mas exige plano Silver/Gold e chave pessoal — depende de decisão/acordo comercial.
3. **Imovirtual, e-Leilões, Leilosoc, Santander, Caixa Imobiliário e Novo Banco** ficam `depende do dono`: ou os Termos não mencionam recolha automatizada, ou a página não pôde ser obtida, ou não existe robots.txt.
4. **Idealista, OLX, CustoJusto, Casa Sapo, Imobancos, Millennium BCP, Montepio e Crédito Agrícola** proíbem expressamente a recolha/agregação automatizada (Idealista e OLX também proíbem a violação das restrições dos robots) — `nao recolher` sem autorização escrita.
5. `robots.txt` não é autorização: onde há `Content-Signal: ai-input=no` (Imovirtual) o uso do conteúdo como input de IA está expressamente não concedido.
6. Nenhum portal foi contactado, nenhum pedido autenticado foi feito e nenhuma página de anúncios foi consultada durante esta triagem.
