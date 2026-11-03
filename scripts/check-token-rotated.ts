/**
 * Gate de release: confirma que o token Turso em uso ja foi rodado e que
 * nao ha segredos versionados no repositorio.
 *
 * Saida: exit 0 = sem bloqueios; exit 1 = bloqueio (token vazado conhecido,
 * segredo encontrado em ficheiros versionados ou verificacao impossivel).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isRemoteDatabaseUrl } from "../src/lib/database-url.ts";

export { isRemoteDatabaseUrl };

/** Fingerprints sha256[:12] de tokens Turso que ja vazaram. */
export const KNOWN_LEAKED_FINGERPRINTS: readonly string[] = ["1bb0c1abb032"];

/** Todos os ficheiros de ambiente que o Next.js carrega. */
export const DEFAULT_ENV_FILES: readonly string[] = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.test",
  ".env.production.local",
  ".env.development.local",
  ".env.test.local",
];

const SECRET_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: "jwt", pattern: /eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}/g },
  { name: "stripe_secret", pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{10,}/ },
  { name: "stripe_webhook", pattern: /\bwhsec_[A-Za-z0-9]{16,}/ },
  { name: "aws_access_key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
];

/** Parametros de URL que indicam um segredo usado como credencial. */
const SENSITIVE_QUERY_PARAMS = /[?&][a-z_]*(?:token|secret|key|password|session)[a-z_]*=/i;

const MAX_SCANNED_FILE_BYTES = 2_000_000;

export type CheckLevel = "OK" | "AVISO" | "FALHA";

export type CheckResult = {
  level: CheckLevel;
  message: string;
  file?: string;
};

export function fingerprint(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 12);
}

export function parseEnvContent(content: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const withoutExport = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const separator = withoutExport.indexOf("=");
    if (separator <= 0) continue;
    const key = withoutExport.slice(0, separator).trim();
    let value = withoutExport.slice(separator + 1).trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    values.set(key, value);
  }
  return values;
}

export function leakedFingerprints(extra?: string): string[] {
  const fromEnv = (extra ?? process.env.RADARPRO_EXTRA_LEAKED_FINGERPRINTS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return [...KNOWN_LEAKED_FINGERPRINTS, ...fromEnv];
}

export function isLeakedFingerprint(fp: string, leaked: readonly string[] = leakedFingerprints()): boolean {
  return leaked.includes(fp);
}

/** Header de um JWT: false positives de URLs (CDN) nao passam neste teste. */
export function decodeJwtHeader(candidate: string): Record<string, unknown> | null {
  const parts = candidate.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[0], "base64url").toString("utf8");
    const header = JSON.parse(json) as Record<string, unknown>;
    return typeof header === "object" && header !== null && "alg" in header ? header : null;
  } catch {
    return null;
  }
}

export function isInsideUrl(content: string, index: number): boolean {
  return urlContext(content, index) !== null;
}

/** Texto da URL que contem a posicao indicada (ou null se nao for URL). */
export function urlContext(content: string, index: number): string | null {
  const before = content.slice(0, index);
  const scheme = before.lastIndexOf("://");
  if (scheme === -1) return null;
  const whitespace = Math.max(before.lastIndexOf(" "), before.lastIndexOf("\n"), before.lastIndexOf("\t"), before.lastIndexOf('"'));
  if (scheme <= whitespace) return null;
  const rest = content.slice(index);
  const end = rest.search(/[\s"']/);
  return content.slice(scheme + 3, end === -1 ? content.length : index + end);
}

export function scanContentForSecrets(content: string, file: string): CheckResult[] {
  const results: CheckResult[] = [];
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (name === "jwt") {
      for (const match of content.matchAll(pattern)) {
        if (!decodeJwtHeader(match[0])) continue;
        const start = match.index ?? 0;
        const url = urlContext(content, start);
        if (url && !SENSITIVE_QUERY_PARAMS.test(url)) {
          results.push({
            level: "AVISO",
            file,
            message: "JWT dentro de URL em ficheiro versionado (ex.: link assinado): revisa manualmente",
          });
          continue;
        }
        results.push({
          level: "FALHA",
          file,
          message: 'padrao de segredo "jwt" em ficheiro versionado',
        });
      }
      continue;
    }
    if (pattern.test(content)) {
      results.push({ level: "FALHA", file, message: `padrao de segredo "${name}" em ficheiro versionado` });
    }
  }
  return results;
}

function gitCommand(repoRoot: string, args: string[]): { ok: boolean; output: string } {
  try {
    const output = execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return { ok: true, output };
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 1) return { ok: true, output: "" };
    return { ok: false, output: "" };
  }
}

export function findSecretInTrackedFiles(repoRoot: string): CheckResult[] {
  const listed = gitCommand(repoRoot, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (!listed.ok) {
    return [{ level: "FALHA", message: "git indisponivel: nao foi possivel listar os ficheiros versionados" }];
  }
  const results: CheckResult[] = [];
  for (const relative of listed.output.split("\0")) {
    if (!relative) continue;
    const absolute = path.join(repoRoot, relative);
    if (!existsSync(absolute)) continue;
    let content: string;
    try {
      const buffer = readFileSync(absolute);
      if (buffer.length > MAX_SCANNED_FILE_BYTES) continue;
      content = buffer.toString("utf8");
    } catch {
      continue;
    }
    results.push(...scanContentForSecrets(content, relative));
  }
  return results;
}

export function findTokenInHistory(repoRoot: string, token: string): { commits: string[]; gitFailed: boolean } {
  if (!token) return { commits: [], gitFailed: false };
  const revs = gitCommand(repoRoot, ["rev-list", "--all"]);
  if (!revs.ok) return { commits: [], gitFailed: true };
  const revisions = revs.output.split(/\s+/).filter(Boolean);
  const patternDir = mkdtempSync(path.join(tmpdir(), "radarpro-token-"));
  const patternFile = path.join(patternDir, "pattern.txt");
  writeFileSync(patternFile, token, { encoding: "utf8", mode: 0o600, flag: "wx" });
  try {
    const commits = new Set<string>();
    const batchSize = 200;
    for (let index = 0; index < revisions.length; index += batchSize) {
      const batch = revisions.slice(index, index + batchSize);
      const found = gitCommand(repoRoot, ["grep", "--text", "-F", "-l", "-f", patternFile, ...batch]);
      if (!found.ok) return { commits: [], gitFailed: true };
      for (const line of found.output.split(/\r?\n/)) {
        const revision = line.split(":")[0];
        if (revision) commits.add(revision);
      }
    }
    return { commits: [...commits], gitFailed: false };
  } finally {
    rmSync(patternDir, { recursive: true, force: true });
  }
}

export type CliOptions = {
  envFiles: string[];
  onlyEnvFiles: string[];
  skipHistory: boolean;
  skipRepoScan: boolean;
  skippedAllowed: boolean;
};

export function parseArgs(argv: string[], skippedAllowed = process.env.NODE_ENV === "test"): CliOptions {
  const options: CliOptions = {
    envFiles: [...DEFAULT_ENV_FILES],
    onlyEnvFiles: [],
    skipHistory: false,
    skipRepoScan: false,
    skippedAllowed,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--env-file" && argv[index + 1]) {
      options.envFiles = [...new Set([...options.envFiles, argv[index + 1]])];
      index += 1;
    } else if (arg === "--only-env-file" && argv[index + 1]) {
      options.onlyEnvFiles = [...new Set([...options.onlyEnvFiles, argv[index + 1]])];
      index += 1;
    } else if (arg === "--skip-history") {
      options.skipHistory = true;
    } else if (arg === "--skip-repo-scan") {
      options.skipRepoScan = true;
    }
  }
  return options;
}

function readEnvFile(file: string): Map<string, string> | null {
  if (!existsSync(file)) return null;
  return parseEnvContent(readFileSync(file, "utf8"));
}

export function runChecks(repoRoot: string, options: CliOptions, leaked: readonly string[] = leakedFingerprints()): CheckResult[] {
  const results: CheckResult[] = [];
  const tokens = new Set<string>();

  if (options.skipHistory && !options.skippedAllowed) {
    results.push({ level: "FALHA", message: "--skip-history so e permitido em ambiente de teste (NODE_ENV=test)" });
  }
  if (options.skipRepoScan && !options.skippedAllowed) {
    results.push({ level: "FALHA", message: "--skip-repo-scan so e permitido em ambiente de teste (NODE_ENV=test)" });
  }
  if (options.onlyEnvFiles.length > 0 && !options.skippedAllowed) {
    results.push({ level: "FALHA", message: "--only-env-file so e permitido em ambiente de teste (NODE_ENV=test)" });
  }

  const envFiles = options.onlyEnvFiles.length > 0 && options.skippedAllowed ? options.onlyEnvFiles : options.envFiles;
  for (const envFile of envFiles) {
    const absolute = path.isAbsolute(envFile) ? envFile : path.join(repoRoot, envFile);
    const values = readEnvFile(absolute);
    if (!values) continue;
    const relative = path.relative(repoRoot, absolute) || envFile;

    const token = values.get("TURSO_AUTH_TOKEN");
    if (token) {
      tokens.add(token);
      const fp = fingerprint(token);
      if (isLeakedFingerprint(fp, leaked)) {
        results.push({
          level: "FALHA",
          file: relative,
          message: `TURSO_AUTH_TOKEN fingerprint=${fp} corresponde a um token vazado conhecido: rodalo antes de publicar`,
        });
      } else {
        results.push({ level: "OK", file: relative, message: `TURSO_AUTH_TOKEN fingerprint=${fp} sem correspondencia com tokens vazados` });
      }
    }

    const cronSecret = values.get("CRON_SECRET");
    results.push({
      level: cronSecret ? "OK" : "AVISO",
      file: relative,
      message: cronSecret ? "CRON_SECRET definido" : "CRON_SECRET ausente: escrever na BD fica dependente da sessao de admin",
    });

    const dbUrl = values.get("TURSO_DATABASE_URL");
    if (dbUrl) {
      const remote = isRemoteDatabaseUrl(dbUrl);
      results.push({
        level: remote ? "AVISO" : "OK",
        file: relative,
        message: remote
          ? "TURSO_DATABASE_URL aponta para a BD remota: scripts de escrita so podem correr com --write contra ficheiro local"
          : "TURSO_DATABASE_URL aponta para uma base local",
      });
    }
  }

  const processToken = process.env.TURSO_AUTH_TOKEN;
  if (processToken) {
    tokens.add(processToken);
    const fp = fingerprint(processToken);
    if (isLeakedFingerprint(fp, leaked)) {
      results.push({ level: "FALHA", message: `TURSO_AUTH_TOKEN do processo fingerprint=${fp} corresponde a um token vazado conhecido` });
    }
  }

  if (tokens.size === 0) {
    results.push({
      level: "AVISO",
      message: "nenhum TURSO_AUTH_TOKEN encontrado: o gate nao validou nenhum token (confirma que o ficheiro de ambiente existe)",
    });
  }

  if (!options.skipRepoScan || !options.skippedAllowed) {
    const repoResults = findSecretInTrackedFiles(repoRoot);
    results.push(...repoResults);
    if (!repoResults.some((result) => result.level === "FALHA")) {
      results.push({ level: "OK", message: "nenhum padrao de segredo bloqueante encontrado em ficheiros versionados" });
    }
  }

  if (!options.skipHistory || !options.skippedAllowed) {
    for (const token of tokens) {
      const { commits, gitFailed } = findTokenInHistory(repoRoot, token);
      if (gitFailed) {
        results.push({ level: "FALHA", message: "git indisponivel: nao foi possivel verificar o historico" });
      } else if (commits.length > 0) {
        results.push({
          level: "FALHA",
          message: `token em uso presente no historico git (${commits.length} commit(s)): reescreve o historico ou roda o token`,
        });
      } else {
        results.push({ level: "OK", message: "token em uso ausente do historico git" });
      }
    }
  }

  return results;
}

export function formatResults(results: CheckResult[], testMode = false): string {
  const lines = results.map((result) => {
    const where = result.file ? `${result.file}: ` : "";
    return `[${result.level}] ${where}${result.message}`;
  });
  const failures = results.filter((result) => result.level === "FALHA").length;
  if (failures > 0) {
    lines.push(`RESULTADO: FALHA (${failures} bloqueio(s))`);
  } else if (testMode) {
    lines.push("RESULTADO: OK (MODO TESTE - invalido para release)");
  } else {
    lines.push("RESULTADO: OK (sem bloqueios)");
  }
  return lines.join("\n");
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const options = parseArgs(argv);
  const results = runChecks(repoRoot, options);
  console.log(formatResults(results, options.skippedAllowed));
  return results.some((result) => result.level === "FALHA") ? 1 : 0;
}

function samePath(left: string, right: string): boolean {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return false;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const isDirectInvocation = invokedPath
  ? samePath(invokedPath, fileURLToPath(import.meta.url)) || invokedPath.endsWith("check-token-rotated.ts")
  : false;
if (isDirectInvocation) {
  process.exitCode = main();
}
