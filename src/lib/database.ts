import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForDatabase = globalThis as unknown as {
  stockflowDatabase?: PrismaClient;
};

let productionDatabase: PrismaClient | undefined;

export function getDatabase() {
  const cachedDatabase =
    process.env.NODE_ENV === "production"
      ? productionDatabase
      : globalForDatabase.stockflowDatabase;

  if (cachedDatabase) {
    return cachedDatabase;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV === "production") {
    productionDatabase = database;
  } else {
    globalForDatabase.stockflowDatabase = database;
  }

  return database;
}
