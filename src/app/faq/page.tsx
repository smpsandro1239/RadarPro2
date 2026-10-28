const faqs = [
  {
    q: "O que é o RadarPro Portugal?",
    a: "Uma plataforma que deteta e analisa oportunidades imobiliárias abaixo do preço de mercado. Centraliza propriedades dispersas ou com pouca visibilidade e filtra-as previamente para saber se têm potencial antes de comprar.",
  },
  {
    q: "O RadarPro é só para investidores?",
    a: "Não. Serve tanto investidores como quem procura casa para viver. O score e a rentabilidade ajudam a tomar decisões informadas.",
  },
  {
    q: "É seguro comprar estas oportunidades?",
    a: "As oportunidades vêm de fontes oficiais (bancos, leilões judiciais, portais). Recomendamos sempre verificação jurídica antes de comprar. O RadarPro não media transações.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem permanência nem contratos. Cancele a qualquer momento.",
  },
  {
    q: "O que é o Score de um anúncio?",
    a: "Um valor de 0 a 100 que combina desconto face ao mercado, rentabilidade estimada e liquidez da zona.",
  },
  {
    q: "Que distritos estão cobertos?",
    a: "Atualmente Lisboa, Porto e Braga, com expansão planeada para todo o país.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-8">Perguntas frequentes</h1>
      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.q} className="border-b pb-6">
            <h2 className="text-lg font-bold mb-2">{faq.q}</h2>
            <p className="text-secondary">{faq.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
