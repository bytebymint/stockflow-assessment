import { config as loadDotenv } from "dotenv";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

function databaseTarget(connectionString: string) {
  const url = new URL(connectionString);

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("TEST_DATABASE_URL must use PostgreSQL.");
  }

  return `${url.hostname.toLowerCase()}:${url.port || "5432"}${url.pathname}`;
}

const localEnvironment: Record<string, string> = {};
loadDotenv({
  path: ".env.local",
  processEnv: localEnvironment,
  quiet: true,
});

const fileEnvironment = loadEnv("test", process.cwd(), "");
const applicationUrls = [
  process.env.DATABASE_URL ??
    localEnvironment.DATABASE_URL ??
    fileEnvironment.DATABASE_URL,
  process.env.DIRECT_URL ??
    localEnvironment.DIRECT_URL ??
    fileEnvironment.DIRECT_URL,
].filter((url): url is string => Boolean(url));
const testUrl =
  process.env.TEST_DATABASE_URL ?? fileEnvironment.TEST_DATABASE_URL;

if (!testUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required for integration tests. Point it to a dedicated disposable PostgreSQL database.",
  );
}

if (
  applicationUrls.some(
    (applicationUrl) =>
      databaseTarget(applicationUrl) === databaseTarget(testUrl),
  )
) {
  throw new Error(
    "TEST_DATABASE_URL must not target the application database. Use a dedicated test database.",
  );
}

process.env.DATABASE_URL = testUrl;
process.env.TEST_DATABASE_URL = testUrl;

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": new URL("./tests/server-only.ts", import.meta.url)
        .pathname,
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    globalSetup: ["./tests/integration/global-setup.ts"],
    include: ["tests/integration/**/*.test.ts"],
    maxWorkers: 1,
    setupFiles: ["./tests/integration/setup.ts"],
    testTimeout: 20_000,
  },
});
