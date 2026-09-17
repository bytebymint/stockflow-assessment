import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin workspace" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");

  return (
    <AdminShell activeHref="/admin" user={user}>
      <WorkspaceEntry
        user={user}
        eyebrow="Administrator access"
        title={`Welcome, ${user.name}`}
        description="Your administrator session is active and isolated from customer and supplier workspaces."
        icon={ShieldCheck}
        nextStep="Category controls, supplier approvals, and platform-wide order management are available from the navigation."
      />
    </AdminShell>
  );
}
