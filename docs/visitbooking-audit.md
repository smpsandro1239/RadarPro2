# Auditoria — VisitBooking / "Agendar Visita"

Data: 2026-11-07
Contexto: tarefa de remoção do formulário de agendamento de visitas.

## Achado

O componente `VisitBooking` ("Agendar Visita") estava ativo em
`src/app/imovel/[id]/page.tsx` e era renderizado para todos os imóveis, incluindo
leilões.

## Problemas

1. Um leilão não se visita — é arrematoção (Martelo.pt, e-leilões, etc.). O formulário
   fazia sentido em 0 dos imóveis ativos.
2. O formulário recolhia nome/email/telefone/data/hora sem backend associado; o
   submit era fictício (timeout + estado local) e a "visita agendada" não era
   enviada a nenhum lado.
3. Criava expectativa errada no utilizador e incentivava dados sem destino.

## Resolução

- `src/components/SourceContact.tsx` substituiu o `VisitBooking` no detalhe do
  imóvel (CTA por tipo de fonte: leilão → link para o anúncio original; portal →
  contactar anunciante; banco → contactar entidade).
- `src/components/VisitBooking.tsx` mantido com marcador `@unused` — reativar
  apenas quando o RadarPro tiver imóveis próprios com visitas a gerir.

## Estado final

- VisitBooking: desativado (sem uso em runtime).
- SourceContact: ativo, sem formulário.
