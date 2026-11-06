import { spawn } from "node:child_process";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { inngest } from "@/lib/inngest";

export const checkPriceChanges = inngest.createFunction(
  { id: "check-price-changes", name: "Check Price Changes", triggers: [{ cron: "0 9-22 * * *" }] },
  async ({ step }: { step: any }) => {
    const now = Date.now();
    const auctions = await step.run("list-auctions", async () => {
      const rows = await db
        .select({ id: properties.id, url: properties.url })
        .from(properties)
        .where(
          and(
            eq(properties.isAuction, true),
            eq(properties.isActive, true),
            gt(properties.auctionEndDate, new Date(now)),
            lt(properties.auctionEndDate, new Date(now + 24 * 3600 * 1000)),
          ),
        );
      return rows;
    });

    if (auctions.length === 0) {
      return { checked: 0 };
    }

    const result = await step.run("check", async () => {
      const child = spawn("npx", ["tsx", "scripts/check-price-changes-standalone.ts", "--limit", "50", "--write", "--confirm-remote-write"], {
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
          if (code !== 0) reject(new Error(`check-price-changes exited ${code}: ${out}`));
          resolve(out);
        });
      });
      return { ok: true, output };
    });

    return { checked: auctions.length, result };
  },
);
