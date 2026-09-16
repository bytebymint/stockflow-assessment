import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin workspace" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const navigation = [{ label: "Overview", href: "/admin", icon: ShieldCheck }];

  return (
    <AppShell
      navigation={navigation}
      activeHref="/admin"
      roleLabel="Administrator"
      userName={user.name}
      userEmail={user.email}
    >
      <WorkspaceEntry
        user={user}
        eyebrow="Administrator access"
        title={`Welcome, ${user.name}`}
        description="Your administrator session is active and isolated from customer and supplier workspaces."
        icon={ShieldCheck}
        nextStep="Category controls and supplier reviews will be added in their dedicated steps."
      />
    </AppShell>
  );
}
