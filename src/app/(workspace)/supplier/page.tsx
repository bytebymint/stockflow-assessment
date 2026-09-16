import type { Metadata } from "next";
import { Store } from "lucide-react";

import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { AppShell } from "@/components/layout/app-shell";
import { requireApprovedSupplier } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Supplier workspace" };

export default async function SupplierPage() {
  const user = await requireApprovedSupplier();
  const navigation = [{ label: "Overview", href: "/supplier", icon: Store }];

  return (
    <AppShell
      navigation={navigation}
      activeHref="/supplier"
      roleLabel="Supplier"
      userName={user.name}
      userEmail={user.email}
    >
      <WorkspaceEntry
        user={user}
        eyebrow="Approved supplier access"
        title={`Welcome, ${user.name}`}
        description="Your approved supplier session is active. Pending and rejected supplier accounts cannot enter this workspace."
        icon={Store}
        nextStep="Product, stock, and fulfilment tools will be added in their dedicated steps."
      />
    </AppShell>
  );
}
