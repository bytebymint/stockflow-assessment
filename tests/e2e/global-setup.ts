import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { clearE2eDatabase, getE2eDatabase } from "./database";

export default async function globalSetup() {
  const testUrl = process.env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error("TEST_DATABASE_URL is required for browser tests.");
  }

  const commandEnvironment = {
    ...process.env,
    DATABASE_URL: testUrl,
    DIRECT_URL: testUrl,
    DEMO_ADMIN_PASSWORD: "StockFlow-E2E-123!",
    DEMO_CUSTOMER_PASSWORD: "StockFlow-E2E-123!",
    DEMO_SUPPLIER_PASSWORD: "StockFlow-E2E-123!",
    DEMO_PENDING_SUPPLIER_PASSWORD: "StockFlow-E2E-123!",
  };

  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      cwd: process.cwd(),
      env: commandEnvironment,
      stdio: "inherit",
    },
  );

  const database = getE2eDatabase();
  try {
    await clearE2eDatabase(database);
  } finally {
    await database.$disconnect();
  }

  execFileSync(
    process.execPath,
    [resolve("node_modules/tsx/dist/cli.mjs"), "prisma/seed.ts"],
    {
      cwd: process.cwd(),
      env: commandEnvironment,
      stdio: "inherit",
    },
  );
}
