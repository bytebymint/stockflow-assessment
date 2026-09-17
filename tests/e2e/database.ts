import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";

export function getE2eDatabase() {
  const connectionString = process.env.TEST_DATABASE_URL;

  if (!connectionString) {
    throw new Error("TEST_DATABASE_URL is required for browser tests.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export async function clearE2eDatabase(database: PrismaClient) {
  await database.notification.deleteMany();
  await database.orderItem.deleteMany();
  await database.order.deleteMany();
  await database.checkoutGroup.deleteMany();
  await database.product.deleteMany();
  await database.category.deleteMany();
  await database.user.deleteMany();
}
