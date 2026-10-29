import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AgenciasPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-4">Portal para Agências Imobiliárias</h1>
      <p className="text-xl text-secondary mb-8">
        Publique os seus imóveis no RadarPro Portugal e alcance mais compradores.
      </p>

      {/* Pricing for agencies */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Básico</h2>
          <div className="text-3xl font-extrabold mb-4">49€<span className="text-sm text-secondary">/mês</span></div>
          <ul className="space-y-2 text-sm mb-6">
            <li>✓ Até 10 anúncios ativos</li>
            <li>✓ Destaque na listagem</li>
            <li>✓ Relatório mensal</li>
            <li>✓ Suporte por email</li>
          </ul>
          <button className="w-full bg-slate-100 text-foreground py-3 rounded-lg font-bold hover:bg-slate-200 transition">
            Começar
          </button>
        </div>

        <div className="border-2 border-primary rounded-2xl p-6 scale-105">
          <div className="text-xs font-bold text-primary mb-2">RECOMENDADO</div>
          <h2 className="text-xl font-bold mb-2">Profissional</h2>
          <div className="text-3xl font-extrabold mb-4">99€<span className="text-sm text-secondary">/mês</span></div>
          <ul className="space-y-2 text-sm mb-6">
            <li>✓ Até 50 anúncios ativos</li>
            <li>✓ Destaque prioritário</li>
            <li>✓ Relatório semanal</li>
            <li>✓ Alertas de leads</li>
            <li>✓ Suporte prioritário</li>
            <li>✓ API de integração</li>
          </ul>
          <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
            Começar
          </button>
        </div>

        <div className="border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Enterprise</h2>
          <div className="text-3xl font-extrabold mb-4">Sob consulta</div>
          <ul className="space-y-2 text-sm mb-6">
            <li>✓ Anúncios ilimitados</li>
            <li>✓ Feed automático (XML/API)</li>
            <li>✓ Relatórios personalizados</li>
            <li>✓ Gestor de conta dedicado</li>
            <li>✓ SLA garantido</li>
          </ul>
          <button className="w-full bg-slate-100 text-foreground py-3 rounded-lg font-bold hover:bg-slate-200 transition">
            Contactar
          </button>
        </div>
      </div>

      {/* Benefits */}
      <h2 className="text-2xl font-bold mb-4">Porquê publicar no RadarPro?</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="flex gap-4">
          <div className="text-3xl">🎯</div>
          <div>
            <h3 className="font-bold mb-1">Público qualificado</h3>
            <p className="text-secondary text-sm">Utilizadores que procuram ativamente oportunidades imobiliárias com desconto.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-3xl">📊</div>
          <div>
            <h3 className="font-bold mb-1">Score de oportunidade</h3>
            <p className="text-secondary text-sm">Cada anúncio recebe um score automático que ajuda os compradores a decidir.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-3xl">🔔</div>
          <div>
            <h3 className="font-bold mb-1">Alertas automáticos</h3>
            <p className="text-secondary text-sm">Os seus anúncios são enviados por email aos utilizadores com pesquisas correspondentes.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-3xl">📈</div>
          <div>
            <h3 className="font-bold mb-1">Relatórios detalhados</h3>
            <p className="text-secondary text-sm">Visualizações, cliques e leads por anúncio.</p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-slate-50 border rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">Contacte-nos</h2>
        <p className="text-secondary mb-6">Preencha o formulário e entraremos em contacto.</p>
        <form className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da agência</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mensagem</label>
            <textarea rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition">
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
