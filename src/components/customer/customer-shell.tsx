import type { ReactNode } from "react";
import { ClipboardList, UserRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";

const customerNavigation = [
  { label: "Account", href: "/account", icon: UserRound },
  { label: "Orders", href: "/orders", icon: ClipboardList },
];

type CustomerShellProps = {
  activeHref: "/account" | "/orders";
  children: ReactNode;
  user: CurrentUser;
};

export function CustomerShell({
  activeHref,
  children,
  user,
}: CustomerShellProps) {
  return (
    <AppShell
      navigation={customerNavigation}
      activeHref={activeHref}
      roleLabel="Customer"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
