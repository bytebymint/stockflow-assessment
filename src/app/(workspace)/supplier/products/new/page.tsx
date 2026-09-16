import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

import { ProductForm } from "@/components/supplier/product-form";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";

export const metadata: Metadata = { title: "Create product" };

export default async function NewProductPage() {
  const [user, categories] = await Promise.all([
    requireApprovedSupplier(),
    getDatabase().category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <SupplierShell activeHref="/supplier/products" user={user}>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="New catalog listing"
          title="Create product"
          description="Add the customer-facing details, price, and opening stock level for this listing."
        />
        {categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="A category is required"
            description="An administrator must create a catalog category before suppliers can add products."
            action={
              <Link
                href="/supplier/products"
                className={buttonVariants({ variant: "outline" })}
              >
                Return to products
              </Link>
            }
          />
        ) : (
          <ProductForm categories={categories} />
        )}
      </div>
    </SupplierShell>
  );
}
