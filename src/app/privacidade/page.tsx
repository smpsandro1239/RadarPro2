import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | RadarPro Portugal",
  description: "Política de privacidade e proteção de dados do RadarPro Portugal.",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-secondary">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">1. Responsável pelo tratamento</h2>
          <p>
            O RadarPro Portugal é responsável pelo tratamento dos dados pessoais recolhidos através deste website.
            Para questões sobre privacidade, contacte-nos em <a href="mailto:hola@radarpro.pt" className="text-primary">hola@radarpro.pt</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">2. Dados recolhidos</h2>
          <p>Recolhemos os seguintes dados:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email e password (encriptada) para criação de conta</li>
            <li>Dados de subscrição (plano, estado, Stripe customer ID)</li>
            <li>Pesquisas guardadas e alertas configurados</li>
            <li>Dados de utilização (páginas visitadas, cliques) via analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">3. Finalidade do tratamento</h2>
          <p>Os dados são utilizados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fornecer e melhorar o serviço de deteção de oportunidades imobiliárias</li>
            <li>Gerir contas e subscrições</li>
            <li>Enviar alertas de novas oportunidades (apenas com consentimento)</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">4. Base legal</h2>
          <p>
            O tratamento é baseado no consentimento do utilizador (art. 6.º, n.º 1, al. a) do RGPD)
            e na execução de contrato (art. 6.º, n.º 1, al. b) do RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">5. Direitos do titular</h2>
          <p>Nos termos do RGPD, tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acesso aos seus dados</li>
            <li>Retificação de dados incorretos</li>
            <li>Eliminação dos seus dados (&quot;direito ao esquecimento&quot;)</li>
            <li>Portabilidade dos dados</li>
            <li>Oposição ao tratamento</li>
            <li>Limitação do tratamento</li>
          </ul>
          <p>Para exercer estes direitos, contacte-nos em <a href="mailto:hola@radarpro.pt" className="text-primary">hola@radarpro.pt</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">6. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento do site (sessão de autenticação)
            e cookies de analytics para compreender como o site é utilizado.
            Pode gerir as suas preferências de cookies no banner de consentimento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">7. Retenção de dados</h2>
          <p>
            Os dados são mantidos enquanto a conta estiver ativa. Após eliminação da conta,
            os dados são removidos no prazo de 30 dias, exceto quando a retenção for exigida por lei.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">8. Segurança</h2>
          <p>
            Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados
            contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <p className="text-xs mt-8">Última atualização: Outubro 2026</p>
      </div>
    </main>
  );
}
