import { handleRevenueExport } from "@/lib/exports/handlers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRevenueExport(request);
}
