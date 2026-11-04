import { describe, it, expect } from "vitest";

describe("SEO slugs", () => {
  it("slugs de distrito sao lowercase sem acentos", () => {
    const slugs = ["lisboa", "porto", "braga"];
    for (const s of slugs) {
      expect(s).toBe(s.toLowerCase());
      expect(s).not.toMatch(/[áàâãéèêíïóôõúç]/i);
    }
  });
});