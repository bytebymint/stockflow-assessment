import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardErrorState } from "@/components/dashboard/dashboard-feedback";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SupplierDashboard } from "@/components/dashboard/supplier-dashboard";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { getSupplierDashboardData } from "@/lib/dashboard/data";
import { parseDashboardRange } from "@/lib/dashboard/range";

export const metadata: Metadata = { title: "Supplier dashboard" };

type SupplierPageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

async function SupplierDashboardContent({
  range,
  supplierId,
  supplierName,
}: {
  range: ReturnType<typeof parseDashboardRange>;
  supplierId: string;
  supplierName: string;
}) {
  let data;

  try {
    data = await getSupplierDashboardData(supplierId, range);
  } catch {
    return <DashboardErrorState workspace="Supplier" />;
  }

  return <SupplierDashboard data={data} supplierName={supplierName} />;
}

export default async function SupplierPage({
  searchParams,
}: SupplierPageProps) {
  const user = await requireApprovedSupplier();
  const range = parseDashboardRange((await searchParams).range);

  return (
    <SupplierShell activeHref="/supplier" user={user}>
      <Suspense key={range} fallback={<DashboardSkeleton />}>
        <SupplierDashboardContent
          range={range}
          supplierId={user.id}
          supplierName={user.name}
        />
      </Suspense>
    </SupplierShell>
  );
}
