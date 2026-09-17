import { OrdersListSkeleton } from "@/components/orders/order-page-skeleton";

export default function CustomerOrdersLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OrdersListSkeleton />
    </main>
  );
}
