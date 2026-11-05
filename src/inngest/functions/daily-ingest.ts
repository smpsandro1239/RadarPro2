import { spawn } from "node:child_process";
import { inngest } from "@/lib/inngest";

export const dailyIngest = inngest.createFunction(
  { id: "daily-ingest", name: "Daily Ingest Martelo", triggers: [{ cron: "0 6 * * *" }] },
  async ({ step }: { step: any }) => {
    const result = await step.run("scrape-martelo", async () => {
      const child = spawn("npx", ["tsx", "scripts/scrape-dry-run.ts", "--limit", "100", "--write", "--confirm-remote-write"], {
        cwd: process.cwd(),
        shell: true,
        env: { ...process.env },
      });
      const output = await new Promise<string>((resolve, reject) => {
        let out = "";
        child.stdout?.on("data", (chunk) => (out += chunk));
        child.stderr?.on("data", (chunk) => (out += chunk));
        child.on("error", reject);
        child.on("close", (code) => {
          if (code !== 0) reject(new Error(`scrape-dry-run exited ${code}: ${out}`));
          resolve(out);
        });
      });
      return { ok: true, output };
    });

    console.log(`[inngest] daily-ingest concluído: ${JSON.stringify(result)}`);
    return result;
  },
);
