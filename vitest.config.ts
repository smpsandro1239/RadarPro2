import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          pool: "vmThreads",
          poolOptions: { vmThreads: { singleThread: false } },
        },
      },
      {
        resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
          pool: "vmThreads",
          poolOptions: { vmThreads: { singleThread: false } },
        },
      },
    ],
  },
});