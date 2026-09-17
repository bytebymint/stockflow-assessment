import { z } from "zod";

import { ORDER_STATUSES } from "@/lib/orders/workflow";
import type { DashboardRange } from "@/lib/dashboard/range";

const exportQuerySchema = z.object({
  range: z.enum(["7", "30", "90"]).default("30"),
  status: z.enum(ORDER_STATUSES).optional(),
  supplier: z.string().uuid().optional(),
});

export type ExportQuery = {
  range: DashboardRange;
  status?: (typeof ORDER_STATUSES)[number];
  supplierId?: string;
};

export function parseExportQuery(searchParams: URLSearchParams) {
  const parsed = exportQuerySchema.safeParse({
    range: searchParams.get("range") ?? undefined,
    status: searchParams.get("status") || undefined,
    supplier: searchParams.get("supplier") || undefined,
  });

  if (!parsed.success) return null;

  return {
    range: Number(parsed.data.range) as DashboardRange,
    status: parsed.data.status,
    supplierId: parsed.data.supplier,
  } satisfies ExportQuery;
}
