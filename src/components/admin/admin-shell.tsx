import type { ReactNode } from "react";
import { LayoutDashboard, Tags } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";

const adminNavigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: Tags },
];

type AdminShellProps = {
  activeHref: "/admin" | "/admin/categories";
  children: ReactNode;
  user: CurrentUser;
};

export function AdminShell({ activeHref, children, user }: AdminShellProps) {
  return (
    <AppShell
      navigation={adminNavigation}
      activeHref={activeHref}
      roleLabel="Administrator"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
