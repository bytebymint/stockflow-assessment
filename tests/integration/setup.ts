import { afterAll, beforeEach } from "vitest";

import { getDatabase } from "@/lib/database";

async function clearTestRecords() {
  const database = getDatabase();

  await database.notification.deleteMany();
  await database.orderItem.deleteMany();
  await database.order.deleteMany();
  await database.checkoutGroup.deleteMany();
  await database.product.deleteMany();
  await database.category.deleteMany();
  await database.user.deleteMany();
}

beforeEach(clearTestRecords);

afterAll(async () => {
  await clearTestRecords();
  await getDatabase().$disconnect();
});
