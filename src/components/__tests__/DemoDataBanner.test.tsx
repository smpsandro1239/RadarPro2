// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DemoDataBanner from "@/components/DemoDataBanner";

describe("DemoDataBanner", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("mostra o banner quando SHOW_SEED_DATA nao esta desativado", () => {
    vi.stubEnv("SHOW_SEED_DATA", "");
    render(<DemoDataBanner />);
    expect(
      screen.getByText("Os imóveis apresentados são dados de demonstração. Ainda não há dados reais na sua zona."),
    ).toBeInTheDocument();
  });

  it("nao mostra o banner quando SHOW_SEED_DATA esta desativado", () => {
    vi.stubEnv("SHOW_SEED_DATA", "false");
    const { container } = render(<DemoDataBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
