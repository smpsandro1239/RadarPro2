import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PropertyCard from "@/components/PropertyCard";

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
  it("renderiza o SourceReliabilityBadge com score >= 13", () => {
    render(<PropertyCard {...baseProps} score={14} />);
    expect(screen.getByText("14/15")).toBeInTheDocument();
  });

  it("renderiza o SourceReliabilityBadge com score null", () => {
    render(<PropertyCard {...baseProps} score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
