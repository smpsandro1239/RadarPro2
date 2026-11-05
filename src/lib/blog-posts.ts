export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-comprar-imovel-leilao",
    title: "Como comprar um imóvel em leilão em Portugal",
    excerpt: "Guia completo para licitar em leilões judiciais e hasta pública. Riscos, cuidados e vantagens.",
    date: "2026-10-01",
    body: [
      "Em Portugal, a compra de imóveis por leilão reúne três mercados distintos: execuções judiciais, hasta pública e vendas de instituições financeiras. Cada um tem as suas particularidades e os seus calendários.",
      "Num leilão judicial, o imóvel passa por um processo de adjudicação. O tribunal nomeia a leiloeira e o adjudicatário assume encargos, impostos e eventuais dívidas. A carta de ordem é geralmente exigida para licitar.",
      "A avaliação inicial parte do valor de mercado. O RadarPro calcula um lance máximo recomendado com margem de segurança, comissão da leiloeira, IMT, imposto do selo e custos adicionais. Este valor é o ponto de partida para a sua estratégia.",
      "A regra do valor patrimonial tributário, o VPT, é central. Os impostos incidem sobre o maior entre o lance e o VPT. Ignorar esta diferença pode tornar um lance atrativamente baixo em insuficiente.",
      "Antes de licitar, é fundamental auditar a carga do imóvel: dívida de condomínio, renovação estimada, embargos e hipotecas em curso. Cargas superiores a 20% do valor podem esvaziar o lance recomendado.",
      "Recomenda-se começar com lances baixos, observar o comportamento dos outros licitadores e manter reserva para custos imprevistos. O processo completo exige acompanhamento jurídico.",
    ],
  },
  {
    slug: "imoveis-de-banco-portugal",
    title: "Imóveis de banco em Portugal: onde encontrar e como comprar",
    excerpt: "Caixa, BCP, Novo Banco e Santander Totta vendem imóveis retomados com descontos até 40%.",
    date: "2026-10-15",
    body: [
      "Instituições financeiras portuguesas, incluindo a Caixa Geral de Depósitos, o Banco Português de Fomento, o Novo Banco e o Banco Santander Totta, gerem inventários de imóveis retomados por crédito. Estas plataformas vendem em regime de vendas diretas.",
      "Os descontos face ao valor de mercado reflectem a logística de venda, a necessidade de gestão de ativos e, por vezes, o próprio perfil do proprietário. Descontos superiores a 30% são incomuns mas verificados em portfólio.",
      "A análise exige atenção ao estado físico e financeiro. O RadarPro acompanha a origem do anúncio e a fiabilidade da avaliação. Imóveis com garantia reforçada do banco podem apresentar condições diferentes.",
      "Para o investidor, a compra de imóvel de banco combina a liquidez de um vendedor institucional com a possibilidade de negociação. A ausência de concorrência directa pode resultar em preços atrativos.",
      "O ponto de partida é sempre a avaliação automática do RadarPro. A partir daí, o detalhe do imóvel permite inspecionar a estrutura de custos antes de apresentar proposta.",
    ],
  },
  {
    slug: "analise-cargas-imovel",
    title: "Análise de cargas: o que verificar antes de licitar",
    excerpt: "Embargos, hipotecas, condomínio e renovação: como montar a carga total de um imóvel em leilão.",
    date: "2026-10-20",
    body: [
      "Antes de qualquer licitação, é preciso saber qual é a carga real do imóvel. A carga total reúne a dívida de condomínio, a estimativa de renovação, os embargos judiciais e as hipotecas em curso.",
      "A metodologia do RadarPro soma os custos conhecidos e compara a carga ao valor de referência do imóvel. Quando a carga ultrapassa 20% do valor, o alerta é ativado.",
      "Embargos e penhoras indicam processos judiciais em curso que podem restringir a disponibilidade do imóvel. Hipotecas em curso podem reverter a prioridade do crédito se a avaliação estiver comprometida.",
      "A renovação estimada não é necessariamente uma dívida, mas reduz o poder de negociação. Ignorar custos indiretos é a causa mais frequente de lance máximo insuficiente.",
      "Com a carga total em mãos, o lance máximo recomendado passa a refletir custos reais. A análise de cargas é o que diferencia uma prospeção informada de uma aposta.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | null {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post ?? null;
}
