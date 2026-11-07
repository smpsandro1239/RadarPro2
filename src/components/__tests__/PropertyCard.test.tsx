// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PropertyCard from "@/components/PropertyCard";

afterEach(() => {
  cleanup();
});

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/PropertyImage", () => ({
  default: () => <div data-testid="property-image" />,
}));

const baseProps = {
  id: "test-1",
  title: "Casa de Lisboa",
  district: "Lisboa",
  municipality: "Lisboa",
  sourceName: "Casa Sapo",
  source: "casasapo",
  price: 100000,
  marketValue: 120000,
  discountPct: 16.7,
  score: 85,
  type: "Apartamento",
  images: null,
  isAuction: false,
  auctionEndDate: null,
  checkStatus: "ok",
  currentBid: null,
  maxBid: null,
  sqm: 80,
};

describe("PropertyCard", () => {
  it("renderiza o score do imovel como X/100", () => {
    render(<PropertyCard {...baseProps} score={14} />);
    const matches = screen.getAllByText("14/100");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("renderiza 'Sem avaliacao' quando score e null", () => {
    render(<PropertyCard {...baseProps} score={null} />);
    const matches = screen.getAllByText("Sem avaliação");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("renderiza badge de leilao com countdown em dias para leilao futuro (ms)", () => {
    render(
      <PropertyCard
        {...baseProps}
        isAuction
        currentBid={50000}
        maxBid={60000}
        auctionEndDate={Date.now() + 2 * 24 * 60 * 60 * 1000}
      />,
    );
    expect(screen.getByText(/Leilão • fecha em 2 dias/)).toBeInTheDocument();
  });

  it("nao renderiza badge de leilao sem data de fim", () => {
    render(<PropertyCard {...baseProps} isAuction auctionEndDate={null} />);
    expect(screen.queryByText(/Leilão • fecha em/)).not.toBeInTheDocument();
  });
});