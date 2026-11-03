import type { Metadata } from "next";
import PageShell from "@/components/ds/PageShell";

export const metadata: Metadata = {
  title: "Política de Privacidade | RadarPro Portugal",
  description: "Política de privacidade e proteção de dados do RadarPro Portugal.",
};

const LINK_CLASS =
  "text-rp-cobalt underline decoration-[1px] underline-offset-4 transition-colors duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] hover:text-rp-ink hover:decoration-2";

export default function PrivacidadePage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Política de Privacidade"
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="max-w-[70ch] text-[16px] leading-[1.55] text-rp-ink-2">
        <section className="border-t border-rp-line py-7 first:border-t-0 first:pt-0">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">1. Responsável pelo tratamento</h2>
          <div className="mt-3 space-y-3">
            <p>
              O RadarPro Portugal é responsável pelo tratamento dos dados pessoais recolhidos através deste website.
              Para questões sobre privacidade, contacte-nos em{" "}
              <a href="mailto:hola@radarpro.pt" className={LINK_CLASS}>
                hola@radarpro.pt
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">2. Dados recolhidos</h2>
          <div className="mt-3 space-y-3">
            <p>Recolhemos os seguintes dados:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-rp-cobalt">
              <li>Email e password (encriptada) para criação de conta</li>
              <li>Dados de subscrição (plano, estado, Stripe customer ID)</li>
              <li>Pesquisas guardadas e alertas configurados</li>
              <li>Dados de utilização (páginas visitadas, cliques) via analytics</li>
            </ul>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">3. Finalidade do tratamento</h2>
          <div className="mt-3 space-y-3">
            <p>Os dados são utilizados para:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-rp-cobalt">
              <li>Fornecer e melhorar o serviço de deteção de oportunidades imobiliárias</li>
              <li>Gerir contas e subscrições</li>
              <li>Enviar alertas de novas oportunidades (apenas com consentimento)</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">4. Base legal</h2>
          <div className="mt-3 space-y-3">
            <p>
              O tratamento é baseado no consentimento do utilizador (art. 6.º, n.º 1, al. a) do RGPD) e na execução de
              contrato (art. 6.º, n.º 1, al. b) do RGPD).
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">5. Direitos do titular</h2>
          <div className="mt-3 space-y-3">
            <p>Nos termos do RGPD, tem direito a:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-rp-cobalt">
              <li>Acesso aos seus dados</li>
              <li>Retificação de dados incorretos</li>
              <li>Eliminação dos seus dados ("direito ao esquecimento")</li>
              <li>Portabilidade dos dados</li>
              <li>Oposição ao tratamento</li>
              <li>Limitação do tratamento</li>
            </ul>
            <p>
              Para exercer estes direitos, contacte-nos em{" "}
              <a href="mailto:hola@radarpro.pt" className={LINK_CLASS}>
                hola@radarpro.pt
              </a>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">6. Cookies</h2>
          <div className="mt-3 space-y-3">
            <p>
              Utilizamos cookies essenciais para o funcionamento do site (sessão de autenticação) e cookies de analytics
              para compreender como o site é utilizado. Pode gerir as suas preferências de cookies no banner de
              consentimento.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">7. Retenção de dados</h2>
          <div className="mt-3 space-y-3">
            <p>
              Os dados são mantidos enquanto a conta estiver ativa. Após eliminação da conta, os dados são removidos no
              prazo de 30 dias, exceto quando a retenção for exigida por lei.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">8. Segurança</h2>
          <div className="mt-3 space-y-3">
            <p>
              Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não
              autorizado, alteração, divulgação ou destruição.
            </p>
          </div>
        </section>

        <p className="border-t border-rp-line pt-5 text-[13px] text-rp-muted">
          Última atualização: Outubro 2026
        </p>
      </div>
    </PageShell>
  );
}
