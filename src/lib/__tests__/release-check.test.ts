import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  decodeJwtHeader,
  fingerprint,
  isInsideUrl,
  isLeakedFingerprint,
  isRemoteDatabaseUrl,
  parseArgs,
  parseEnvContent,
  runChecks,
  scanContentForSecrets,
} from "../../../scripts/check-token-rotated";

const repoRoot = path.resolve(__dirname, "../../..");
const scriptPath = path.join(repoRoot, "scripts/check-token-rotated.ts");

const JWT = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "eyJzdWIiOiIxMjM0NTY3ODkwIn0", "dGVzdC1zaWduYXR1cmU"].join(".");

function runCli(args: string[], env: Record<string, string | undefined> = {}): { status: number; output: string } {
  const childEnv = { ...process.env, ...env } as Record<string, string | undefined>;
  if (!("TURSO_AUTH_TOKEN" in env)) delete childEnv.TURSO_AUTH_TOKEN;
  if (!("RADARPRO_EXTRA_LEAKED_FINGERPRINTS" in env)) delete childEnv.RADARPRO_EXTRA_LEAKED_FINGERPRINTS;
  try {
    const output = execFileSync(process.execPath, [scriptPath, ...args], {
      cwd: repoRoot,
      encoding: "utf8",
      env: childEnv as NodeJS.ProcessEnv,
    });
    return { status: 0, output };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { status: failure.status ?? 1, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}` };
  }
}

const tempDirs: string[] = [];

function tempEnvFile(content: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "radarpro-release-"));
  tempDirs.push(dir);
  const file = path.join(dir, "env-teste");
  writeFileSync(file, content);
  return file;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("release check", () => {
  it("fingerprint e estavel e tem 12 caracteres hex", () => {
    expect(fingerprint("token-teste")).toBe(fingerprint("token-teste"));
    expect(fingerprint("token-teste")).toMatch(/^[0-9a-f]{12}$/);
    expect(fingerprint("token-teste")).not.toBe(fingerprint("outro-token"));
  });

  it("parseEnvContent ignora comentarios, aceita aspas e o prefixo export", () => {
    const values = parseEnvContent(
      ["# comentario", "A=1", 'B="dois"', "C='tres'", "D=", "export TURSO_AUTH_TOKEN=abc", "invalido"].join("\n"),
    );
    expect(values.get("A")).toBe("1");
    expect(values.get("B")).toBe("dois");
    expect(values.get("C")).toBe("tres");
    expect(values.get("D")).toBe("");
    expect(values.get("TURSO_AUTH_TOKEN")).toBe("abc");
    expect(values.has("invalido")).toBe(false);
  });

  it("detecta fingerprints de tokens vazados", () => {
    expect(isLeakedFingerprint("1bb0c1abb032")).toBe(true);
    expect(isLeakedFingerprint("000000000000")).toBe(false);
  });

  it("classifica base remota vs local", () => {
    expect(isRemoteDatabaseUrl("libsql://db.turso.io")).toBe(true);
    expect(isRemoteDatabaseUrl("https://db.example.com")).toBe(true);
    expect(isRemoteDatabaseUrl("http://db.example.com")).toBe(true);
    expect(isRemoteDatabaseUrl("wss://db.example.com")).toBe(true);
    expect(isRemoteDatabaseUrl("file:local.db")).toBe(false);
  });

  it("parseArgs aceita env-file explicito e flags de salto", () => {
    const options = parseArgs(["--env-file", "tmp.env", "--skip-history", "--skip-repo-scan"], true);
    expect(options.envFiles).toContain("tmp.env");
    expect(options.envFiles).toContain(".env");
    expect(options.skipHistory).toBe(true);
    expect(options.skipRepoScan).toBe(true);
  });

  it("um JWT isolado e um bloqueio; dentro de uma URL e so aviso", () => {
    expect(scanContentForSecrets(`const token = "${JWT}";`, "f.ts")[0].level).toBe("FALHA");
    expect(scanContentForSecrets(`const url = "https://cdn.exemplo.pt/${JWT}";`, "f.ts")[0].level).toBe("AVISO");
    expect(
      scanContentForSecrets(`const url = "https://api.exemplo.pt/x?token=${JWT}";`, "f.ts")[0].level,
    ).toBe("FALHA");
  });

  it("isInsideUrl distingue URL de texto normal", () => {
    expect(isInsideUrl("ver https://exemplo.pt/x", 18)).toBe(true);
    expect(isInsideUrl("apenas texto", 5)).toBe(false);
  });

  it("decodeJwtHeader rejeita strings que nao sao JWT", () => {
    expect(decodeJwtHeader(JWT)).not.toBeNull();
    expect(decodeJwtHeader("eyJhbG9naGEodGhpc2lzZGF0YWJhc2U2NGJhc2U")).toBeNull();
  });

  it("runChecks marca FALHA quando o token em uso e um token vazado", () => {
    const envFile = tempEnvFile(`TURSO_AUTH_TOKEN=token-de-teste-vazado\nCRON_SECRET=abc\nTURSO_DATABASE_URL=file:local.db\n`);
    const results = runChecks(
      repoRoot,
      { envFiles: [envFile], onlyEnvFiles: [], skipHistory: true, skipRepoScan: true, skippedAllowed: true },
      [fingerprint("token-de-teste-vazado")],
    );
    const leaked = results.find((result) => result.message.includes("token vazado"));
    expect(leaked?.level).toBe("FALHA");
    expect(leaked?.message).toContain(fingerprint("token-de-teste-vazado"));
  });

  it("runChecks falha fechado quando o git nao responde", () => {
    const envFile = tempEnvFile("TURSO_AUTH_TOKEN=token-novo\n");
    const results = runChecks(
      path.join(tmpdir(), "radarpro-sem-repo-" + Date.now()),
      { envFiles: [envFile], onlyEnvFiles: [], skipHistory: false, skipRepoScan: false, skippedAllowed: true },
    );
    expect(results.some((result) => result.level === "FALHA" && result.message.includes("git indisponivel"))).toBe(true);
  });

  it("as flags de salto sao recusadas fora de ambiente de teste", () => {
    const envFile = tempEnvFile("TURSO_AUTH_TOKEN=token-novo\n");
    const results = runChecks(repoRoot, {
      envFiles: [envFile],
      onlyEnvFiles: [],
      skipHistory: true,
      skipRepoScan: true,
      skippedAllowed: false,
    });
    expect(results.filter((result) => result.level === "FALHA").length).toBeGreaterThanOrEqual(2);
  });

  it("CLI sai com codigo 1 quando deteta o token vazado", () => {
    const envFile = tempEnvFile("TURSO_AUTH_TOKEN=token-de-teste-vazado\n");
    const result = runCli(
      ["--only-env-file", envFile, "--skip-history", "--skip-repo-scan"],
      { NODE_ENV: "test", RADARPRO_EXTRA_LEAKED_FINGERPRINTS: fingerprint("token-de-teste-vazado") },
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain("FALHA");
    expect(result.output).toContain("RESULTADO: FALHA");
  });

  it("CLI sai com codigo 0 quando o token nao esta na lista de vazados", () => {
    const envFile = tempEnvFile(
      "TURSO_AUTH_TOKEN=token-novo-sem-vazamento\nCRON_SECRET=abc\nTURSO_DATABASE_URL=file:local.db\n",
    );
    const result = runCli(["--only-env-file", envFile, "--skip-history", "--skip-repo-scan"], { NODE_ENV: "test" });
    expect(result.status).toBe(0);
    expect(result.output).toContain("RESULTADO: OK");
  });

  it("CLI nao aceita --only-env-file fora de ambiente de teste", () => {
    const envFile = tempEnvFile("TURSO_AUTH_TOKEN=token-novo-sem-vazamento\n");
    const result = runCli(["--only-env-file", envFile], { NODE_ENV: "production" });
    expect(result.status).toBe(1);
    expect(result.output).toContain("so e permitido em ambiente de teste");
  });
});
