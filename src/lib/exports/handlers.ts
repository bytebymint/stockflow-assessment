import "server-only";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { buildCsv } from "@/lib/exports/csv";
import { getOrderExportRows, getRevenueExportRows } from "@/lib/exports/data";
import { parseExportQuery } from "@/lib/exports/query";
import {
  csvResponse,
  emptyExportResponse,
  exportErrorResponse,
} from "@/lib/exports/response";

async function authorizedExportUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: exportErrorResponse("Sign in to export operational data.", 401),
    } as const;
  }

  if (
    user.role === "CUSTOMER" ||
    (user.role === "SUPPLIER" && user.supplierStatus !== "APPROVED")
  ) {
    return {
      response: exportErrorResponse(
        "Administrator or approved supplier access is required.",
        403,
      ),
    } as const;
  }

  return { user } as const;
}

function exportFilename(report: "orders" | "revenue", user: CurrentUser) {
  const scope = user.role === "ADMIN" ? "platform" : "supplier";
  const date = new Date().toISOString().slice(0, 10);
  return `stockflow-${scope}-${report}-${date}.csv`;
}

export async function handleOrderExport(request: Request) {
  const access = await authorizedExportUser();
  if ("response" in access) return access.response;

  const query = parseExportQuery(new URL(request.url).searchParams);
  if (!query) {
    return exportErrorResponse(
      "Choose a valid date range, order status, and supplier.",
      400,
    );
  }

  try {
    const orders = await getOrderExportRows(access.user, query);

    if (orders.length === 0) {
      return emptyExportResponse(
        "No orders match the selected reporting period and filters.",
      );
    }

    const csv = buildCsv(
      [
        "Order number",
        "Checkout reference",
        "Status",
        "Created at (UTC)",
        "Customer",
        "Customer email",
        "Supplier",
        "Supplier email",
        "Reserved units",
        "Subtotal (GBP)",
      ],
      orders.map((order) => [
        order.orderNumber,
        order.checkoutGroup.reference,
        order.status,
        order.createdAt,
        order.customer.name,
        order.customer.email,
        order.supplier.name,
        order.supplier.email,
        order.items.reduce((total, item) => total + item.quantity, 0),
        order.subtotal.toFixed(2),
      ]),
    );

    return csvResponse(
      csv,
      exportFilename("orders", access.user),
      orders.length,
    );
  } catch (error) {
    console.error("Order export failed", error);
    return exportErrorResponse(
      "The order export could not be prepared. Please retry.",
      500,
    );
  }
}

export async function handleRevenueExport(request: Request) {
  const access = await authorizedExportUser();
  if ("response" in access) return access.response;

  const query = parseExportQuery(new URL(request.url).searchParams);
  if (!query) {
    return exportErrorResponse("Choose a valid date range and supplier.", 400);
  }

  try {
    const orders = await getRevenueExportRows(access.user, query);

    if (orders.length === 0) {
      return emptyExportResponse(
        "No delivered revenue matches the selected reporting period and supplier.",
      );
    }

    const csv = buildCsv(
      [
        "Order number",
        "Delivered at (UTC)",
        "Customer",
        "Customer email",
        "Supplier",
        "Supplier email",
        "Revenue (GBP)",
      ],
      orders.map((order) => [
        order.orderNumber,
        order.deliveredAt,
        order.customer.name,
        order.customer.email,
        order.supplier.name,
        order.supplier.email,
        order.subtotal.toFixed(2),
      ]),
    );

    return csvResponse(
      csv,
      exportFilename("revenue", access.user),
      orders.length,
    );
  } catch (error) {
    console.error("Revenue export failed", error);
    return exportErrorResponse(
      "The revenue export could not be prepared. Please retry.",
      500,
    );
  }
}
