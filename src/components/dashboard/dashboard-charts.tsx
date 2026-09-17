"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCartPrice } from "@/lib/cart";

type OrdersByDayPoint = {
  date: string;
  label: string;
  orders: number;
};

type SupplierRevenuePoint = {
  supplier: string;
  revenue: number;
  orderCount: number;
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-card)",
};

export function OrdersPerDayChart({
  data,
  summary,
}: {
  data: OrdersByDayPoint[];
  summary: string;
}) {
  const totalOrders = data.reduce((total, day) => total + day.orders, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders per day</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent>
        {totalOrders === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumnIncreasing}
            title="No order activity"
            description="Choose a longer reporting period or wait for customers to complete checkout."
          />
        ) : (
          <div className="h-72 w-full min-w-0" role="img" aria-label={summary}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={data}
                accessibilityLayer
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: data.length <= 30 ? 3 : 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <details className="border-border mt-5 border-t pt-4">
          <summary className="focus-visible:ring-ring/30 flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold outline-none focus-visible:ring-3">
            View daily order data
          </summary>
          <Table className="mt-2">
            <TableCaption>
              Exact order counts for every day in the selected period.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{day.label}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {day.orders}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      </CardContent>
    </Card>
  );
}

export function RevenueBySupplierChart({
  data,
  summary,
}: {
  data: SupplierRevenuePoint[];
  summary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivered revenue by supplier</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumnIncreasing}
            title="No delivered revenue"
            description="Revenue appears after an order reaches delivered status within the selected period."
          />
        ) : (
          <div className="h-72 w-full min-w-0" role="img" aria-label={summary}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={data}
                layout="vertical"
                accessibilityLayer
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `£${Number(value)}`}
                />
                <YAxis
                  type="category"
                  dataKey="supplier"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={112}
                  tickFormatter={(value) =>
                    String(value).length > 16
                      ? `${String(value).slice(0, 15)}…`
                      : String(value)
                  }
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="revenue"
                  name="Revenue (£)"
                  fill="var(--chart-2)"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={36}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="border-border mt-5 border-t pt-4">
          <Table>
            <TableCaption>
              Delivered revenue totals and order counts by supplier.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground py-8 text-center"
                  >
                    No delivered revenue in this period.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((supplier) => (
                  <TableRow key={supplier.supplier}>
                    <TableCell className="max-w-52 whitespace-normal">
                      {supplier.supplier}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {supplier.orderCount}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold tabular-nums">
                      {formatCartPrice(supplier.revenue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
