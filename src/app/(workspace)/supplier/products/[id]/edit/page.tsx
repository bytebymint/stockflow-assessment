import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductForm,
  type ProductFormInitialValues,
} from "@/components/supplier/product-form";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";
import { productIdSchema } from "@/lib/products/validation";

export const metadata: Metadata = { title: "Edit product" };

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const [user, routeParams] = await Promise.all([
    requireApprovedSupplier(),
    params,
  ]);
  const parsedId = productIdSchema.safeParse(routeParams.id);

  if (!parsedId.success) notFound();

  const [product, categories] = await Promise.all([
    getDatabase().product.findFirst({
      where: {
        id: parsedId.data,
        supplierId: user.id,
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        categoryId: true,
        price: true,
        stock: true,
        lowStockThreshold: true,
        imageUrl: true,
        imagePublicId: true,
        imageAlt: true,
      },
    }),
    getDatabase().category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  const initialValues: ProductFormInitialValues = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId ?? "",
    price: product.price.toFixed(2),
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold),
    imageUrl: product.imageUrl ?? "",
    imagePublicId: product.imagePublicId ?? "",
    imageAlt: product.imageAlt ?? "",
  };

  return (
    <SupplierShell activeHref="/supplier/products" user={user}>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Inventory record"
          title={`Edit ${product.name}`}
          description="Changes to the listing, price, and stock are reflected in the public catalog after saving."
        />
        <ProductForm
          categories={categories}
          initialValues={initialValues}
          productId={product.id}
        />
      </div>
    </SupplierShell>
  );
}
