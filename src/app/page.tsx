import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Button from "@/components/ds/Button";
import DsPropertyCard from "@/components/ds/PropertyCard";
import Legend from "@/components/ds/Legend";
import SectionHeader from "@/components/ds/SectionHeader";
import SiteFooter from "@/components/ds/SiteFooter";
import CityMaquette from "@/components/maquette/CityMaquette";
import { getLatestProperties } from "@/lib/queries";
import styles from "./page.module.css";

const TITLE = "RadarPro — Veja o que o mercado ainda não viu";
const DESCRIPTION =
  "Comparamos o preço pedido com o valor estimado, mostramos a margem de erro e assinalamos o que merece ser verificado antes de avançar.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "pt_PT",
    type: "website",
    url: "https://radarpro-portugal.vercel.app",
  },
};

type BadgeKind =
  | "opportunity"
  | "to-verify"
  | "no-valuation"
  | "confidence-high"
  | "confidence-medium"
  | "confidence-low";

const DISTRICTS = [
  "Aveiro",
  "Beja",
  "Braga",
  "Bragança",
  "Castelo Branco",
  "Coimbra",
  "Évora",
  "Faro",
  "Guarda",
  "Leiria",
  "Lisboa",
  "Portalegre",
  "Porto",
  "Santarém",
  "Setúbal",
  "Viana do Castelo",
  "Vila Real",
  "Viseu",
  "Açores",
  "Madeira",
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

type ListingRow = {
  id: string;
  title: string;
  district: string;
  municipality: string;
  sourceName: string;
  price: number;
  marketValue: number | null;
  score: number | null;
  images: string | null;
  checkStatus: string | null;
  valuationConfidence: string | null;
};

function firstImage(images: string | null): string | null {
  if (!images) return null;
  try {
    const parsed: unknown = JSON.parse(images);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {
    return null;
  }
  return null;
}

function badgesFor(property: ListingRow): { kind: BadgeKind; label?: string }[] {
  const badges: { kind: BadgeKind; label?: string }[] = [];
  if (property.marketValue === null) badges.push({ kind: "no-valuation" });
  if (property.checkStatus !== "ok") badges.push({ kind: "to-verify" });
  if (property.valuationConfidence === "high") badges.push({ kind: "confidence-high" });
  else if (property.valuationConfidence === "medium") badges.push({ kind: "confidence-medium" });
  else if (property.valuationConfidence === "low" || property.valuationConfidence === "very_low") {
    badges.push({ kind: "confidence-low" });
  }
  return badges;
}

const FAQ = [
  {
    question: "O valor estimado é uma avaliação oficial?",
    answer:
      "Não. É uma estimativa automática, calculada a partir de dados de mercado e das características do imóvel. Por isso mostramos sempre a margem de erro e a confiança do cálculo.",
  },
  {
    question: "De onde vêm os dados?",
    answer:
      "De fontes declaradas em cada registo: anúncios de portais e casas de leilão e tabelas de mercado com fonte, unidade e data de referência. Cada imóvel mostra a fonte de onde veio.",
  },
  {
    question: "Os dados são reais?",
    answer:
      "A base pode conter dados de demonstração. Quando existem, há um aviso no topo da página; por omissão, os dados de demonstração ficam fora das listagens públicas.",
  },
  {
    question: "O que significa «a verificar»?",
    answer:
      "Que o imóvel ainda não foi confirmado na fonte original. Confirme o anúncio antes de avançar — o RadarPro mostra o que sabe e o que falta confirmar.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim. Os planos são mensais e podem ser cancelados a qualquer momento, sem permanência.",
  },
];

async function LatestListings() {
  const properties = (await getLatestProperties()) as ListingRow[];
  const visible = properties.slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <div className={styles.listing}>
      {visible.map((property) => (
        <DsPropertyCard
          key={property.id}
          title={property.title}
          location={`${property.municipality}, ${property.district}`}
          askingPrice={property.price}
          estimatedValue={property.marketValue}
          badges={badgesFor(property)}
          href={`/imovel/${property.id}`}
          source={property.sourceName}
          imageUrl={firstImage(property.images)}
          imageAlt={property.title}
          status={property.checkStatus === "ok" ? "estimated" : "to-verify"}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <p className={`${styles.eyebrow} rp-eyebrow`}>Mercado imobiliário português</p>
            <h1 className={`${styles.title} rp-display`}>
              Veja o que o mercado <em className={styles.keyword}>ainda não viu.</em>
            </h1>
            <p className={styles.lead}>{DESCRIPTION}</p>
            <div className={styles.actions}>
              <Button href="/oportunidades" variant="primary" size="lg">
                Explorar a cidade
              </Button>
              <Button href="/como-funciona" variant="link">
                Como calculamos o valor →
              </Button>
            </div>
          </div>

          <div className={styles.maquette}>
            <CityMaquette />
            <Legend
              items={[
                { label: "Altura sólida = preço pedido", tone: "solid" },
                { label: "Volume cobalto = diferença até ao valor estimado", tone: "ghost" },
                { label: "Janelas acesas = oportunidade", tone: "opportunity" },
                { label: "Tracejado = a verificar", tone: "anomaly" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSurface}`} id="como-se-le">
        <div className={styles.shell}>
          <SectionHeader
            eyebrow="Como se lê a cidade"
            title="Três sinais que explicam cada imóvel"
            description="A maquete traduz o preço pedido e o valor estimado para a mesma linguagem: altura, volume e luz."
          />
          <ol className={styles.steps}>
            <li className={styles.step}>
              <p className={`${styles.stepIndex} rp-eyebrow`}>Passo 1</p>
              <p className={styles.stepTitle}>Altura sólida = preço pedido</p>
              <p className={styles.stepText}>
                Quanto mais alto o edifício, mais alto o preço pedido. A escala é a mesma para todos os imóveis da
                maquete.
              </p>
            </li>
            <li className={styles.step}>
              <p className={`${styles.stepIndex} rp-eyebrow`}>Passo 2</p>
              <p className={styles.stepTitle}>Volume cobalto = diferença até ao estimado</p>
              <p className={styles.stepText}>
                A parte translúcida mostra o valor estimado em relação ao preço pedido: o volume que falta para chegar
                lá.
              </p>
            </li>
            <li className={styles.step}>
              <p className={`${styles.stepIndex} rp-eyebrow`}>Passo 3</p>
              <p className={styles.stepTitle}>Janelas acesas ou tracejado = sinal</p>
              <p className={styles.stepText}>
                Janelas acesas assinalam uma oportunidade; o tracejado assinala um imóvel que merece ser verificado
                antes de avançar.
              </p>
            </li>
          </ol>
          <Link className={styles.link} href="/como-funciona">
            Ver como calculamos o valor →
          </Link>
        </div>
      </section>

      <section className={styles.section} id="limites">
        <div className={styles.shell}>
          <SectionHeader
            eyebrow="Limites"
            title="O que o RadarPro não faz"
            description="Preferimos dizer onde está o limite do que prometer mais do que o que sabemos."
          />
          <ul className={styles.limits}>
            <li className={styles.limit}>
              <p className={styles.limitTitle}>Não faz avaliações oficiais</p>
              <p className={styles.limitText}>
                É uma estimativa automática. Pode errar — por isso mostramos a margem de erro e a confiança do cálculo.
              </p>
            </li>
            <li className={styles.limit}>
              <p className={styles.limitTitle}>Não esconde a margem de erro</p>
              <p className={styles.limitText}>
                Cada valor estimado aparece com a respetiva nota, e os imóveis sem dados suficientes ficam marcados como
                «sem avaliação».
              </p>
            </li>
            <li className={styles.limit}>
              <p className={styles.limitTitle}>Não mistura demonstração com anúncios reais</p>
              <p className={styles.limitText}>
                Quando a base tem dados de demonstração, a página avisa no topo. Por omissão, esses dados ficam fora das
                listagens públicas.
              </p>
            </li>
            <li className={styles.limit}>
              <p className={styles.limitTitle}>Não substitui a verificação</p>
              <p className={styles.limitText}>
                Cada imóvel mostra a sua fonte e fica assinalado como «a verificar» até ser confirmado na origem.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSurface}`} id="ultimas-entradas">
        <div className={styles.shell}>
          <SectionHeader
            eyebrow="Entradas recentes"
            title="Os últimos imóveis registados"
            description="Preço pedido, valor estimado e o que falta confirmar, imóvel a imóvel."
          />
          <Suspense fallback={<p style={{ color: "var(--rp-muted)" }}>A carregar imóveis…</p>}>
            <LatestListings />
          </Suspense>
          <p style={{ marginTop: 28 }}>
            <Link className={styles.link} href="/oportunidades">
              Ver todas as oportunidades →
            </Link>
          </p>
          <nav aria-label="Explorar por distrito">
            <ul className={styles.districts}>
              {DISTRICTS.map((district) => (
                <li key={district}>
                  <Link className={styles.districtLink} href={`/oportunidades/${slugify(district)}`}>
                    {district}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className={styles.section} id="precos">
        <div className={styles.shell}>
          <SectionHeader
            eyebrow="Preços"
            title="Planos simples, sem surpresas"
            description="Os mesmos planos que estão na página de preços."
          />
          <div className={styles.plans}>
            <article className={styles.plan}>
              <h3 className={styles.planName}>Gratuito</h3>
              <p className={`${styles.planPrice} rp-num`}>
                0€
                <span className={styles.planPeriod}>/mês</span>
              </p>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}>5 oportunidades por semana</li>
                <li className={styles.planFeature}>Acesso às oportunidades de Lisboa</li>
                <li className={styles.planFeature}>Score básico</li>
              </ul>
              <Button href="/auth" variant="secondary">
                Começar grátis
              </Button>
            </article>
            <article className={`${styles.plan} ${styles.planRecommended}`}>
              <p className="rp-eyebrow" style={{ color: "var(--rp-cobalt)", margin: "0 0 6px" }}>
                Recomendado
              </p>
              <h3 className={styles.planName}>Pro</h3>
              <p className={`${styles.planPrice} rp-num`}>
                29€
                <span className={styles.planPeriod}>/mês</span>
              </p>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}>Oportunidades ilimitadas</li>
                <li className={styles.planFeature}>Todos os distritos de Portugal</li>
                <li className={styles.planFeature}>Score completo + rentabilidade</li>
                <li className={styles.planFeature}>Alertas por email</li>
                <li className={styles.planFeature}>Acesso a leilões e imóveis de banco</li>
                <li className={styles.planFeature}>Suporte prioritário</li>
              </ul>
              <Button href="/precos" variant="primary">
                Assinar Pro
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionSurface}`} id="faq">
        <div className={styles.shell}>
          <SectionHeader eyebrow="Perguntas frequentes" title="As dúvidas que mais nos chegam" />
          <div className={styles.faq}>
            {FAQ.map((item) => (
              <details className={styles.faqItem} key={item.question}>
                <summary className={styles.faqQuestion}>{item.question}</summary>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </details>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>
            <Link className={styles.link} href="/faq">
              Ver todas as perguntas →
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
