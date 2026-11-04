import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SourceReliabilityBadge from "@/components/SourceReliabilityBadge";

describe("SourceReliabilityBadge", () => {
  it("renderiza com score >= 13 com ShieldCheck e score", () => {
    render(<SourceReliabilityBadge sourceName="Casa Sapo" score={14} />);
    expect(screen.getByText("14/15")).toBeInTheDocument();
  });

  it("renderiza com score null com '—'", () => {
    render(<SourceReliabilityBadge sourceName="Casa Sapo" score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renderiza com score >= 9 com ShieldAlert e score", () => {
    render(<SourceReliabilityBadge sourceName="Imovirtual" score={10} />);
    expect(screen.getByText("10/15")).toBeInTheDocument();
  });

  it("renderiza com score < 6 com ShieldAlert e score", () => {
    render(<SourceReliabilityBadge sourceName="Test" score={5} />);
    expect(screen.getByText("5/15")).toBeInTheDocument();
  });
});