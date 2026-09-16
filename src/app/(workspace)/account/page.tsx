import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { WorkspaceEntry } from "@/components/auth/workspace-entry";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Customer account" };

export default async function AccountPage() {
  const user = await requireRole("CUSTOMER");
  const navigation = [{ label: "Account", href: "/account", icon: UserRound }];

  return (
    <AppShell
      navigation={navigation}
      activeHref="/account"
      roleLabel="Customer"
      userName={user.name}
      userEmail={user.email}
    >
      <WorkspaceEntry
        user={user}
        eyebrow="Customer access"
        title={`Welcome, ${user.name}`}
        description="Your customer session is active. Public browsing stays open, while ordering and account activity remain protected."
        icon={UserRound}
        nextStep="The public storefront and ordering journey will arrive in their dedicated steps."
      />
    </AppShell>
  );
}
