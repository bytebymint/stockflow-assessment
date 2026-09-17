import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export default function applyTestMigrations() {
  const testUrl = process.env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error("TEST_DATABASE_URL was not provided to the test process.");
  }

  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: testUrl,
        DIRECT_URL: testUrl,
      },
      stdio: "inherit",
    },
  );
}
