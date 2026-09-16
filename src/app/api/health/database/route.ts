import { getDatabase } from "@/lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  try {
    const database = getDatabase();

    await database.$queryRaw`SELECT 1`;

    return Response.json(
      {
        status: "ok",
        database: "reachable",
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Database health check failed.", error);

    return Response.json(
      {
        status: "error",
        database: "unreachable",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
