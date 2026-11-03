import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSessionMock } = vi.hoisted(() => ({ getSessionMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
  ADMIN_EMAIL: "admin@radarpro.pt",
}));

import { authorizeWrite } from "@/lib/api-auth";

function request(headers: Record<string, string> = {}): Request {
  return new Request("https://radarpro.pt/api/scrape", { headers });
}

describe("authorizeWrite", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    getSessionMock.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sem CRON_SECRET e sem sessao devolve 500 em vez de autorizar", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await authorizeWrite(request());
    expect(response?.status).toBe(500);
    expect(await response?.json()).toMatchObject({ error: expect.stringContaining("CRON_SECRET") });
  });

  it("rejeita token errado com 401", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    const response = await authorizeWrite(request({ authorization: "Bearer segredo-errado" }));
    expect(response?.status).toBe(401);
  });

  it("rejeita ausencia de token com 401", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    const response = await authorizeWrite(request());
    expect(response?.status).toBe(401);
  });

  it("aceita o Bearer correto", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    const response = await authorizeWrite(request({ authorization: "Bearer segredo-correto" }));
    expect(response).toBeNull();
  });

  it("aceita o header x-cron-secret correto", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    const response = await authorizeWrite(request({ "x-cron-secret": "segredo-correto" }));
    expect(response).toBeNull();
  });

  it("nao aceita um prefixo do segredo", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    const response = await authorizeWrite(request({ authorization: "Bearer segredo" }));
    expect(response?.status).toBe(401);
  });

  it("aceita a sessao de admin sem depender do CRON_SECRET", async () => {
    vi.stubEnv("CRON_SECRET", "");
    getSessionMock.mockResolvedValue({ email: "admin@radarpro.pt" });
    const response = await authorizeWrite(request());
    expect(response).toBeNull();
  });

  it("nao aceita uma sessao de outro utilizador", async () => {
    vi.stubEnv("CRON_SECRET", "segredo-correto");
    getSessionMock.mockResolvedValue({ email: "outro@radarpro.pt" });
    const response = await authorizeWrite(request({ authorization: "Bearer segredo-errado" }));
    expect(response?.status).toBe(401);
  });
});
