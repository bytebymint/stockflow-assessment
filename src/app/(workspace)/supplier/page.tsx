import type { Metadata } from "next";
import { Store } from "lucide-react";

import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { requireApprovedSupplier } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Supplier workspace" };

export default async function SupplierPage() {
  const user = await requireApprovedSupplier();

  return (
    <SupplierShell activeHref="/supplier" user={user}>
      <WorkspaceEntry
        user={user}
        eyebrow="Approved supplier access"
        title={`Welcome, ${user.name}`}
        description="Your approved supplier session is active. Pending and rejected supplier accounts cannot enter this workspace."
        icon={Store}
        nextStep="Use Products to maintain inventory and Orders to manage fulfilment through delivery."
      />
    </SupplierShell>
  );
}
