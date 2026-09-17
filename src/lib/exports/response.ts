import "server-only";

const noStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export function csvResponse(csv: string, filename: string, rowCount: number) {
  return new Response(`\uFEFF${csv}`, {
    headers: {
      ...noStoreHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-StockFlow-Export-Rows": String(rowCount),
    },
  });
}

export function emptyExportResponse(message: string) {
  return new Response(null, {
    status: 204,
    headers: {
      ...noStoreHeaders,
      "X-StockFlow-Export-Rows": "0",
      "X-StockFlow-Export-Message": message,
    },
  });
}

export function exportErrorResponse(message: string, status: number) {
  return Response.json({ message }, { status, headers: noStoreHeaders });
}
