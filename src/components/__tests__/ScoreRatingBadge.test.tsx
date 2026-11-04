// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreRatingBadge from "@/components/ScoreRatingBadge";

describe("ScoreRatingBadge", () => {
  it("renderiza com score >= 13 com ShieldCheck e score", () => {
    render(<ScoreRatingBadge score={14} />);
    expect(screen.getByText("14/15")).toBeInTheDocument();
  });

  it("renderiza com score null com '—'", () => {
    render(<ScoreRatingBadge score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renderiza com score >= 9 com ShieldAlert e score", () => {
    render(<ScoreRatingBadge score={10} />);
    expect(screen.getByText("10/15")).toBeInTheDocument();
  });

  it("renderiza com score < 6 com ShieldAlert e score", () => {
    render(<ScoreRatingBadge score={5} />);
    expect(screen.getByText("5/15")).toBeInTheDocument();
  });
});