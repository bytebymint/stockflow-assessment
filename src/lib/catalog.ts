import "server-only";

import { unstable_cache } from "next/cache";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { PUBLIC_CATALOG_CACHE_TAG } from "@/lib/cache/tags";
import { getDatabase } from "@/lib/database";

export const CATALOG_PAGE_SIZE = 6;
const CATALOG_REVALIDATE_SECONDS = 300;

export const catalogSortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
] as const;

export const catalogAvailabilityOptions = [
  { label: "All availability", value: "all" },
  { label: "In stock", value: "in-stock" },
  { label: "Out of stock", value: "out-of-stock" },
] as const;

export type CatalogSort = (typeof catalogSortOptions)[number]["value"];
export type CatalogAvailability =
  (typeof catalogAvailabilityOptions)[number]["value"];

export type CatalogQuery = {
  q: string;
  category: string;
  supplier: string;
  minPrice: string;
  maxPrice: string;
  availability: CatalogAvailability;
  sort: CatalogSort;
  page: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: unknown) =>
  Array.isArray(value) ? value[0] : value;

const priceFilterSchema = z
  .preprocess(firstValue, z.string().trim())
  .pipe(
    z
      .string()
      .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/)
      .or(z.literal("")),
  )
  .catch("");

const catalogQuerySchema = z.object({
  q: z.preprocess(firstValue, z.string().trim().max(100)).catch("").default(""),
  category: z
    .preprocess(
      firstValue,
      z
        .string()
        .trim()
        .max(100)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .or(z.literal("")),
    )
    .catch("")
    .default(""),
  supplier: z
    .preprocess(firstValue, z.string().uuid().or(z.literal("")))
    .catch("")
    .default(""),
  minPrice: priceFilterSchema.default(""),
  maxPrice: priceFilterSchema.default(""),
  availability: z
    .preprocess(firstValue, z.enum(["all", "in-stock", "out-of-stock"]))
    .catch("all")
    .default("all"),
  sort: z
    .preprocess(
      firstValue,
      z.enum(["featured", "newest", "price-asc", "price-desc", "name-asc"]),
    )
    .catch("featured")
    .default("featured"),
  page: z
    .preprocess((value) => {
      const first = firstValue(value);
      return typeof first === "string" && /^\d+$/.test(first)
        ? Number(first)
        : 1;
    }, z.number().int().positive().max(100_000))
    .catch(1)
    .default(1),
});

export function parseCatalogQuery(searchParams: RawSearchParams): CatalogQuery {
  return catalogQuerySchema.parse(searchParams);
}

export function catalogHref(
  query: CatalogQuery,
  overrides: Partial<
    Record<keyof CatalogQuery, string | number | undefined>
  > = {},
) {
  const nextQuery = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (nextQuery.q) params.set("q", String(nextQuery.q));
  if (nextQuery.category) params.set("category", String(nextQuery.category));
  if (nextQuery.supplier) params.set("supplier", String(nextQuery.supplier));
  if (nextQuery.minPrice) params.set("minPrice", String(nextQuery.minPrice));
  if (nextQuery.maxPrice) params.set("maxPrice", String(nextQuery.maxPrice));
  if (nextQuery.availability && nextQuery.availability !== "all") {
    params.set("availability", String(nextQuery.availability));
  }
  if (nextQuery.sort && nextQuery.sort !== "featured") {
    params.set("sort", String(nextQuery.sort));
  }
  if (Number(nextQuery.page) > 1) {
    params.set("page", String(nextQuery.page));
  }

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

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
    id: string;
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
      id: true,
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
  supplier: { id: string; name: string };
  category: { name: string; slug: string } | null;
}): PublicProduct {
  return {
    ...product,
    price: product.price.toFixed(2),
  };
}

const getCachedPublicProducts = unstable_cache(
  async () => {
    const products = await getDatabase().product.findMany({
      where: publicProductWhere,
      select: publicProductSelect,
      orderBy: [{ stock: "desc" }, { name: "asc" }],
    });

    return products.map(serializeProduct);
  },
  ["stockflow", "catalog", "all-products"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  },
);

export function getPublicProducts() {
  return getCachedPublicProducts();
}

function catalogWhere(query: CatalogQuery): Prisma.ProductWhereInput {
  const filters: Prisma.ProductWhereInput[] = [];

  if (query.q) {
    filters.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
        {
          supplier: { name: { contains: query.q, mode: "insensitive" } },
        },
        {
          category: { name: { contains: query.q, mode: "insensitive" } },
        },
      ],
    });
  }

  if (query.category) {
    filters.push({ category: { slug: query.category } });
  }

  if (query.supplier) {
    filters.push({ supplierId: query.supplier });
  }

  if (query.minPrice || query.maxPrice) {
    filters.push({
      price: {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      },
    });
  }

  if (query.availability === "in-stock") {
    filters.push({ stock: { gt: 0 } });
  } else if (query.availability === "out-of-stock") {
    filters.push({ stock: 0 });
  }

  return {
    ...publicProductWhere,
    ...(filters.length > 0 ? { AND: filters } : {}),
  };
}

function catalogOrderBy(
  sort: CatalogSort,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }, { name: "asc" }];
    case "price-asc":
      return [{ price: "asc" }, { name: "asc" }];
    case "price-desc":
      return [{ price: "desc" }, { name: "asc" }];
    case "name-asc":
      return [{ name: "asc" }];
    default:
      return [{ stock: "desc" }, { createdAt: "desc" }, { name: "asc" }];
  }
}

const getCachedPublicCatalogPage = unstable_cache(
  async (query: CatalogQuery) => {
    const where = catalogWhere(query);
    const total = await getDatabase().product.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(query.page, pageCount);
    const products = await getDatabase().product.findMany({
      where,
      select: publicProductSelect,
      orderBy: catalogOrderBy(query.sort),
      skip: (currentPage - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
    });

    return {
      currentPage,
      pageCount,
      products: products.map(serializeProduct),
      total,
    };
  },
  ["stockflow", "catalog", "page"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  },
);

export function getPublicCatalogPage(query: CatalogQuery) {
  return getCachedPublicCatalogPage(query);
}

const getCachedCatalogFilterOptions = unstable_cache(
  async () => {
    const [categories, suppliers] = await Promise.all([
      getDatabase().category.findMany({
        where: {
          products: {
            some: publicProductWhere,
          },
        },
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      getDatabase().user.findMany({
        where: {
          role: "SUPPLIER",
          supplierStatus: "APPROVED",
          products: { some: { archivedAt: null } },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return { categories, suppliers };
  },
  ["stockflow", "catalog", "filter-options"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  },
);

export function getCatalogFilterOptions() {
  return getCachedCatalogFilterOptions();
}

const getCachedFeaturedProducts = unstable_cache(
  async () => {
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
  },
  ["stockflow", "catalog", "featured"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  },
);

export function getFeaturedProducts() {
  return getCachedFeaturedProducts();
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getCachedPublicProductById = unstable_cache(
  async (id: string) => {
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
  },
  ["stockflow", "catalog", "product"],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  },
);

export function getPublicProductById(id: string) {
  return getCachedPublicProductById(id);
}

export function formatPrice(price: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(price));
}
