import type { ReactNode } from "react";
import { LayoutDashboard, PackageSearch } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";

const supplierNavigation = [
  { label: "Overview", href: "/supplier", icon: LayoutDashboard },
  { label: "Products", href: "/supplier/products", icon: PackageSearch },
];

type SupplierShellProps = {
  activeHref: "/supplier" | "/supplier/products";
  children: ReactNode;
  user: CurrentUser;
};

export function SupplierShell({
  activeHref,
  children,
  user,
}: SupplierShellProps) {
  return (
    <AppShell
      navigation={supplierNavigation}
      activeHref={activeHref}
      roleLabel="Supplier"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
