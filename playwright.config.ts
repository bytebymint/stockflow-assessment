import { config as loadDotenv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

function loadEnvironmentFile(path: string) {
  const environment: Record<string, string> = {};
  loadDotenv({ path, processEnv: environment, quiet: true });
  return environment;
}

function databaseTarget(connectionString: string) {
  const url = new URL(connectionString);

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("TEST_DATABASE_URL must use PostgreSQL.");
  }

  return `${url.hostname.toLowerCase()}:${url.port || "5432"}${url.pathname}`;
}

const localEnvironment = loadEnvironmentFile(".env.local");
const testEnvironment = {
  ...loadEnvironmentFile(".env.test"),
  ...loadEnvironmentFile(".env.test.local"),
};
const testUrl =
  process.env.TEST_DATABASE_URL ?? testEnvironment.TEST_DATABASE_URL;
const applicationUrls = [
  process.env.DATABASE_URL ?? localEnvironment.DATABASE_URL,
  process.env.DIRECT_URL ?? localEnvironment.DIRECT_URL,
].filter((url): url is string => Boolean(url));

if (!testUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required for browser tests. Point it to a dedicated disposable PostgreSQL database.",
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

const serverEnvironment = {
  ...process.env,
  DATABASE_URL: testUrl,
  TEST_DATABASE_URL: testUrl,
  AUTH_SECRET:
    process.env.AUTH_SECRET ??
    localEnvironment.AUTH_SECRET ??
    "stockflow-e2e-auth-secret-replace-outside-tests",
  AUTH_TRUST_HOST: "true",
  AUTH_URL: "http://127.0.0.1:3100",
  NEXTAUTH_URL: "http://127.0.0.1:3100",
  DEMO_ADMIN_PASSWORD: "StockFlow-E2E-123!",
  DEMO_CUSTOMER_PASSWORD: "StockFlow-E2E-123!",
  DEMO_SUPPLIER_PASSWORD: "StockFlow-E2E-123!",
  DEMO_PENDING_SUPPLIER_PASSWORD: "StockFlow-E2E-123!",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: true,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 2 : 0,
  timeout: 45_000,
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    env: serverEnvironment,
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:3100/api/health/database",
  },
});
