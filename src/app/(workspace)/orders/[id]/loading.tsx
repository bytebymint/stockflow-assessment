import { OrderDetailSkeleton } from "@/components/orders/order-page-skeleton";

export default function CustomerOrderLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OrderDetailSkeleton />
    </main>
  );
}
