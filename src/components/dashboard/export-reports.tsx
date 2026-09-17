"use client";

import { useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  Download,
  FileSpreadsheet,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  dashboardRangeLabel,
  type DashboardRange,
} from "@/lib/dashboard/range";
import { ORDER_STATUSES, orderStatusDetails } from "@/lib/orders/workflow";
import { cn } from "@/lib/utils";

type ExportKind = "orders" | "revenue";
type ExportFeedback = {
  tone: "success" | "empty" | "error";
  message: string;
} | null;

const selectClassName =
  "border-input bg-card focus-visible:border-ring focus-visible:ring-ring/25 h-11 w-full rounded-lg border px-3 text-base shadow-xs outline-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-3 md:text-sm";

function responseFilename(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

export function ExportReports({
  activeRange,
  role,
  suppliers = [],
}: {
  activeRange: DashboardRange;
  role: "ADMIN" | "SUPPLIER";
  suppliers?: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [pendingExport, setPendingExport] = useState<ExportKind | null>(null);
  const [feedback, setFeedback] = useState<ExportFeedback>(null);

  async function downloadExport(kind: ExportKind) {
    setPendingExport(kind);
    setFeedback(null);

    const params = new URLSearchParams({ range: String(activeRange) });
    if (supplierId) params.set("supplier", supplierId);
    if (kind === "orders" && status) params.set("status", status);

    try {
      const response = await fetch(`/api/exports/${kind}?${params}`, {
        credentials: "same-origin",
      });

      if (response.status === 204) {
        setFeedback({
          tone: "empty",
          message:
            response.headers.get("X-StockFlow-Export-Message") ??
            "No records match the selected filters.",
        });
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          body?.message ?? "The export could not be prepared. Please retry.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = responseFilename(
        response,
        `stockflow-${kind}-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      const rowCount = response.headers.get("X-StockFlow-Export-Rows");
      setFeedback({
        tone: "success",
        message: `${kind === "orders" ? "Order" : "Revenue"} export downloaded${rowCount ? ` with ${rowCount} ${rowCount === "1" ? "record" : "records"}` : ""}.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "The export could not be prepared. Please retry.",
      });
    } finally {
      setPendingExport(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <FileSpreadsheet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Export operational data</CardTitle>
            <CardDescription className="mt-1">
              Download CSV files for{" "}
              {dashboardRangeLabel(activeRange).toLowerCase()}. Order exports
              also apply the selected status.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className={cn("grid gap-4", role === "ADMIN" && "md:grid-cols-2")}>
          <div>
            <Label htmlFor={`${role.toLowerCase()}-export-status`}>
              Order status
            </Label>
            <select
              id={`${role.toLowerCase()}-export-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={cn(selectClassName, "mt-2")}
              disabled={pendingExport !== null}
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatusDetails[orderStatus].label}
                </option>
              ))}
            </select>
          </div>

          {role === "ADMIN" ? (
            <div>
              <Label htmlFor="admin-export-supplier">Supplier</Label>
              <select
                id="admin-export-supplier"
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                className={cn(selectClassName, "mt-2")}
                disabled={pendingExport !== null}
              >
                <option value="">All suppliers</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => downloadExport("orders")}
            disabled={pendingExport !== null}
            className="sm:min-w-40"
          >
            {pendingExport === "orders" ? (
              <LoaderCircle
                className="motion-safe:animate-spin"
                data-icon="inline-start"
                aria-hidden="true"
              />
            ) : (
              <Download data-icon="inline-start" aria-hidden="true" />
            )}
            {pendingExport === "orders" ? "Preparing…" : "Export orders"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadExport("revenue")}
            disabled={pendingExport !== null}
            className="sm:min-w-40"
          >
            {pendingExport === "revenue" ? (
              <LoaderCircle
                className="motion-safe:animate-spin"
                data-icon="inline-start"
                aria-hidden="true"
              />
            ) : (
              <Download data-icon="inline-start" aria-hidden="true" />
            )}
            {pendingExport === "revenue" ? "Preparing…" : "Export revenue"}
          </Button>
        </div>

        {feedback ? (
          <p
            role={feedback.tone === "error" ? "alert" : "status"}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              feedback.tone === "success" &&
                "border-success-foreground/20 bg-success-subtle text-success-foreground",
              feedback.tone === "empty" &&
                "border-warning-foreground/20 bg-warning-subtle text-warning-foreground",
              feedback.tone === "error" &&
                "border-destructive/20 bg-destructive/10 text-destructive",
            )}
          >
            {feedback.tone === "success" ? (
              <CircleCheck
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
            )}
            {feedback.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
