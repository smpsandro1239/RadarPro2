import type { Metadata } from "next";
import PageShell from "@/components/ds/PageShell";

export const metadata: Metadata = {
  title: "Termos de Utilização | RadarPro Portugal",
  description: "Termos e condições de utilização do RadarPro Portugal.",
};

export default function TermosPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Termos de Utilização"
      backHref="/"
      backLabel="Voltar ao início"
    >
      <div className="max-w-[70ch] text-[16px] leading-[1.55] text-rp-ink-2">
        <section className="border-t border-rp-line py-7 first:border-t-0 first:pt-0">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">1. Aceitação dos termos</h2>
          <div className="mt-3 space-y-3">
            <p>
              Ao aceder e utilizar o RadarPro Portugal, aceita estes termos de utilização. Se não concordar, não deve
              utilizar o serviço.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">2. Descrição do serviço</h2>
          <div className="mt-3 space-y-3">
            <p>
              O RadarPro Portugal é uma plataforma de informação que agrega e analisa anúncios imobiliários de diversas
              fontes públicas (portais, bancos, leilões). O serviço fornece scores, comparações de preço e rentabilidade
              para auxiliar na tomada de decisão.
            </p>
            <p>
              <strong className="font-semibold text-rp-ink">O RadarPro não é uma agência imobiliária.</strong> Não media
              transações, não cobra comissões sobre compras e não garante a disponibilidade ou exatidão dos anúncios
              apresentados.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">3. Contas de utilizador</h2>
          <div className="mt-3 space-y-3">
            <p>
              Para aceder a funcionalidades avançadas, é necessário criar uma conta. É responsável por manter a
              confidencialidade da sua password e por todas as atividades realizadas na sua conta.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">4. Subscrições e pagamentos</h2>
          <div className="mt-3 space-y-3">
            <p>
              Os planos pagos são cobrados mensalmente via Stripe. Pode cancelar a qualquer momento sem penalização. Não
              são emitidos reembolsos por períodos parciais.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">5. Limitação de responsabilidade</h2>
          <div className="mt-3 space-y-3">
            <p>
              As informações apresentadas são baseadas em dados públicos e podem conter erros ou estar desatualizadas. O
              RadarPro não garante a exatidão, completude ou atualidade dos dados. Recomendamos sempre verificação
              independente antes de qualquer decisão de investimento ou compra.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">6. Propriedade intelectual</h2>
          <div className="mt-3 space-y-3">
            <p>
              O conteúdo do RadarPro Portugal (design, código, textos originais) é propriedade do RadarPro. Os anúncios
              imobiliários, imagens e descrições pertencem aos respetivos portais e agências de origem.
            </p>
          </div>
        </section>

        <section className="border-t border-rp-line py-7">
          <h2 className="rp-display text-[21px] leading-tight text-rp-ink">7. Alterações aos termos</h2>
          <div className="mt-3 space-y-3">
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações serão publicadas nesta
              página.
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
