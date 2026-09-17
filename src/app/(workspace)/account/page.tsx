import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { CustomerShell } from "@/components/customer/customer-shell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Customer account" };

export default async function AccountPage() {
  const user = await requireRole("CUSTOMER");

  return (
    <CustomerShell activeHref="/account" user={user}>
      <WorkspaceEntry
        user={user}
        eyebrow="Customer access"
        title={`Welcome, ${user.name}`}
        description="Your customer session is active. Public browsing stays open, while ordering and account activity remain protected."
        icon={UserRound}
        nextStep="Use Orders to follow fulfilment progress and cancel eligible pending orders."
      />
    </CustomerShell>
  );
}
