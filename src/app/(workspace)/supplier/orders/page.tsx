import type { Metadata } from "next";

import { OrdersList } from "@/components/orders/orders-list";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/data";

export const metadata: Metadata = {
  title: "Supplier orders",
  description: "Manage order fulfilment for your StockFlow products.",
};

export default async function SupplierOrdersPage() {
  const user = await requireApprovedSupplier();
  const orders = await getOrdersForUser(user);

  return (
    <SupplierShell activeHref="/supplier/orders" user={user}>
      <OrdersList
        orders={orders}
        role="SUPPLIER"
        detailBasePath="/supplier/orders"
      />
    </SupplierShell>
  );
}
