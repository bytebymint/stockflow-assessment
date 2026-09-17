import { randomUUID } from "node:crypto";

import { SupplierStatus, UserRole } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/database";

export async function createCustomer(label = "customer") {
  return getDatabase().user.create({
    data: {
      name: `Test ${label}`,
      email: `${label}-${randomUUID()}@stockflow.test`,
      passwordHash: "integration-test-only",
      role: UserRole.CUSTOMER,
    },
  });
}

export async function createSupplier(label = "supplier") {
  return getDatabase().user.create({
    data: {
      name: `Test ${label}`,
      email: `${label}-${randomUUID()}@stockflow.test`,
      passwordHash: "integration-test-only",
      role: UserRole.SUPPLIER,
      supplierStatus: SupplierStatus.APPROVED,
    },
  });
}

export async function createCategory() {
  const suffix = randomUUID();

  return getDatabase().category.create({
    data: {
      name: `Test category ${suffix}`,
      slug: `test-category-${suffix}`,
    },
  });
}

export async function createProduct({
  categoryId,
  label,
  price = "10.00",
  stock,
  supplierId,
}: {
  categoryId: string;
  label: string;
  price?: string;
  stock: number;
  supplierId: string;
}) {
  return getDatabase().product.create({
    data: {
      categoryId,
      description: `${label} integration-test product`,
      lowStockThreshold: 1,
      name: label,
      price,
      slug: `${label.toLowerCase().replaceAll(" ", "-")}-${randomUUID()}`,
      stock,
      supplierId,
    },
  });
}
