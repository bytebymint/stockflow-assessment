import type { ReactNode } from "react";
import { ClipboardList, LayoutDashboard, PackageSearch } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import type { CurrentUser } from "@/lib/auth/session";

const supplierNavigation = [
  { label: "Overview", href: "/supplier", icon: LayoutDashboard },
  { label: "Products", href: "/supplier/products", icon: PackageSearch },
  { label: "Orders", href: "/supplier/orders", icon: ClipboardList },
];

type SupplierShellProps = {
  activeHref: "/supplier" | "/supplier/products" | "/supplier/orders";
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
