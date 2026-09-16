import "server-only";

import { cache } from "react";

import { getDatabase } from "@/lib/database";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  imageAlt: string | null;
  supplier: {
    name: string;
  };
  category: {
    name: string;
    slug: string;
  } | null;
};

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  lowStockThreshold: true,
  imageUrl: true,
  imageAlt: true,
  supplier: {
    select: {
      name: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} as const;

const publicProductWhere = {
  archivedAt: null,
  supplier: {
    role: "SUPPLIER" as const,
    supplierStatus: "APPROVED" as const,
  },
};

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: { toFixed(decimalPlaces: number): string };
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  imageAlt: string | null;
  supplier: { name: string };
  category: { name: string; slug: string } | null;
}): PublicProduct {
  return {
    ...product,
    price: product.price.toFixed(2),
  };
}

export async function getPublicProducts() {
  const products = await getDatabase().product.findMany({
    where: publicProductWhere,
    select: publicProductSelect,
    orderBy: [{ stock: "desc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
}

export async function getFeaturedProducts() {
  const products = await getDatabase().product.findMany({
    where: {
      ...publicProductWhere,
      stock: { gt: 0 },
    },
    select: publicProductSelect,
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    take: 4,
  });

  return products.map(serializeProduct);
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getPublicProductById = cache(async (id: string) => {
  if (!uuidPattern.test(id)) {
    return null;
  }

  const product = await getDatabase().product.findFirst({
    where: {
      ...publicProductWhere,
      id,
    },
    select: publicProductSelect,
  });

  return product ? serializeProduct(product) : null;
});

export function formatPrice(price: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(price));
}
