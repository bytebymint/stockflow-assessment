import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DashboardErrorState } from "@/components/dashboard/dashboard-feedback";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { requireRole } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/lib/dashboard/data";
import { parseDashboardRange } from "@/lib/dashboard/range";

export const metadata: Metadata = { title: "Admin dashboard" };

type AdminPageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

async function AdminDashboardContent({
  adminName,
  range,
}: {
  adminName: string;
  range: ReturnType<typeof parseDashboardRange>;
}) {
  let data;

  try {
    data = await getAdminDashboardData(range);
  } catch {
    return <DashboardErrorState workspace="Administrator" />;
  }

  return <AdminDashboard adminName={adminName} data={data} />;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await requireRole("ADMIN");
  const range = parseDashboardRange((await searchParams).range);

  return (
    <AdminShell activeHref="/admin" user={user}>
      <Suspense key={range} fallback={<DashboardSkeleton chartCount={2} />}>
        <AdminDashboardContent adminName={user.name} range={range} />
      </Suspense>
    </AdminShell>
  );
}
