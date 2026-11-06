// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import AuctionCountdown from "@/components/AuctionCountdown";

vi.mock("lucide-react", () => ({
  Clock: () => <span data-testid="clock-icon" />,
  Gavel: () => <span data-testid="gavel-icon" />,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AuctionCountdown", () => {
  it("renderiza countdown em dias para leilao futuro (endDate em ms)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T12:00:00Z"));
    render(<AuctionCountdown endDate={Date.now() + 2 * 24 * 60 * 60 * 1000} />);
    expect(screen.getByText(/Termina em:/)).toHaveTextContent("2 dias");
  });

  it("renderiza 'Terminado' para leilao com endDate no passado (ms)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T12:00:00Z"));
    render(<AuctionCountdown endDate={Date.now() - 24 * 60 * 60 * 1000} />);
    expect(screen.getByText(/Termina em:/)).toHaveTextContent("Terminado");
  });

  it("renderiza countdown compacto com minutos para leilao futuro (ms)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T12:00:00Z"));
    render(<AuctionCountdown endDate={Date.now() + 5 * 60 * 1000} compact />);
    expect(screen.getByText("5m")).toBeInTheDocument();
  });
});
