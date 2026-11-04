import { spawn } from "node:child_process";
process.env.TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL ?? "file:./local.db";
process.env.TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN ?? "";
const child = spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));