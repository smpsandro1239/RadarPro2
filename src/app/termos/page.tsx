import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Utilização | RadarPro Portugal",
  description: "Termos e condições de utilização do RadarPro Portugal.",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-3xl font-bold mb-6">Termos de Utilização</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-secondary">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">1. Aceitação dos termos</h2>
          <p>
            Ao aceder e utilizar o RadarPro Portugal, aceita estes termos de utilização.
            Se não concordar, não deve utilizar o serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">2. Descrição do serviço</h2>
          <p>
            O RadarPro Portugal é uma plataforma de informação que agrega e analisa anúncios
            imobiliários de diversas fontes públicas (portais, bancos, leilões). O serviço
            fornece scores, comparações de preço e rentabilidade para auxiliar na tomada de decisão.
          </p>
          <p>
            <strong>O RadarPro não é uma agência imobiliária.</strong> Não media transações,
            não cobra comissões sobre compras e não garante a disponibilidade ou exatidão
            dos anúncios apresentados.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">3. Contas de utilizador</h2>
          <p>
            Para aceder a funcionalidades avançadas, é necessário criar uma conta.
            É responsável por manter a confidencialidade da sua password e por todas as
            atividades realizadas na sua conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">4. Subscrições e pagamentos</h2>
          <p>
            Os planos pagos são cobrados mensalmente via Stripe. Pode cancelar a qualquer momento
            sem penalização. Não são emitidos reembolsos por períodos parciais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">5. Limitação de responsabilidade</h2>
          <p>
            As informações apresentadas são baseadas em dados públicos e podem conter erros ou
            estar desatualizadas. O RadarPro não garante a exatidão, completude ou atualidade
            dos dados. Recomendamos sempre verificação independente antes de qualquer decisão
            de investimento ou compra.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">6. Propriedade intelectual</h2>
          <p>
            O conteúdo do RadarPro Portugal (design, código, textos originais) é propriedade
            do RadarPro. Os anúncios imobiliários, imagens e descrições pertencem aos respetivos
            portais e agências de origem.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">7. Alterações aos termos</h2>
          <p>
            Reservamo-nos o direito de alterar estes termos a qualquer momento.
            As alterações serão publicadas nesta página.
          </p>
        </section>

        <p className="text-xs mt-8">Última atualização: Outubro 2026</p>
      </div>
    </main>
  );
}
