// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SourceContact from "@/components/SourceContact";

afterEach(() => {
  cleanup();
});

describe("SourceContact", () => {
  it("renderiza CTA de leilao com link para o anuncio original", () => {
    render(
      <SourceContact
        propertyTitle="Século Incrível, Lda. - Verba 1"
        sourceName="Martelo"
        isAuction
        url="https://martelo.pt/leilao/verba-1"
      />,
    );
    expect(screen.getByText("Leilão")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://martelo.pt/leilao/verba-1");
    expect(link).toHaveTextContent("Ver leilão no anúncio original");
  });

  it("renderiza CTA de contacto para anunciante em portal", () => {
    render(
      <SourceContact propertyTitle="Apartamento T2" sourceName="Casa Sapo" isAuction={false} url="https://casasapo.pt/imovel/1" />,
    );
    expect(screen.getByText("Contactar Anúncio")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://casasapo.pt/imovel/1");
    expect(link).toHaveTextContent("Contactar anunciante");
  });

  it("renderiza contacto indisponível quando não existe url", () => {
    render(<SourceContact propertyTitle="Terreno" sourceName="OLX" isAuction={false} url={null} />);
    expect(screen.getByText("Contacto indisponível.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
