import { ExternalLink } from "lucide-react";

interface SourceContactProps {
  propertyTitle: string;
  sourceName: string;
  isAuction: boolean;
  url: string | null;
}

const AUCTION_SOURCE_MARKERS = ["martelo"];
const BANK_SOURCE_MARKERS = [
  "millennium bcp",
  "santander",
  "novo banco",
  "caixa imobiliario",
  "montepiop",
  "bpi",
  "credito agricola",
];

export default function SourceContact({ propertyTitle, sourceName, isAuction, url }: SourceContactProps) {
  const name = sourceName.toLowerCase();
  const isAuctionListing = isAuction || AUCTION_SOURCE_MARKERS.some((marker) => name.includes(marker));
  const isBankListing = BANK_SOURCE_MARKERS.some((marker) => name.includes(marker));

  let heading = "Contactar Anúncio";
  let body = `Contacte o anunciante para mais informações sobre: ${propertyTitle}`;
  let cta = "Contactar anunciante";
  let href = url;

  if (isAuctionListing) {
    heading = "Leilão";
    body = "Leilão a decorrer. Ver detalhes e participar no anúncio original do imóvel.";
    cta = "Ver leilão no anúncio original";
    href = url;
  } else if (isBankListing) {
    heading = "Imóvel de Banco";
    body = "Imóvel vendido pelas instituições financeiras. Contacte a entidade diretamente.";
    cta = "Contactar banco";
    href = url;
  }

  return (
    <div className="border rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-2">{heading}</h3>
      <p className="text-secondary text-sm mb-4">{body}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition"
        >
          {cta} <ExternalLink size={14} />
        </a>
      ) : (
        <p className="text-secondary text-sm">Contacto indisponível.</p>
      )}
    </div>
  );
}
