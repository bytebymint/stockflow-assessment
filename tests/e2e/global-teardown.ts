import { clearE2eDatabase, getE2eDatabase } from "./database";

export default async function globalTeardown() {
  const database = getE2eDatabase();

  try {
    await clearE2eDatabase(database);
  } finally {
    await database.$disconnect();
  }
}
