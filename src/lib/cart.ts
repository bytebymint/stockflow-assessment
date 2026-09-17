import { z } from "zod";

export const CART_STORAGE_VERSION = 1;
export const CART_MAX_ITEMS = 50;
export const CART_MAX_QUANTITY = 999;

const moneySchema = z.string().regex(/^\d{1,10}\.\d{2}$/);

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(CART_MAX_QUANTITY),
  snapshot: z.object({
    name: z.string().trim().min(1).max(160),
    unitPrice: moneySchema,
    imageUrl: z.string().url().max(2048).nullable(),
    imageAlt: z.string().trim().max(180).nullable(),
    supplierId: z.string().uuid(),
    supplierName: z.string().trim().min(1).max(120),
  }),
});

export const storedCartSchema = z.object({
  version: z.literal(CART_STORAGE_VERSION),
  items: z.array(cartItemSchema).max(CART_MAX_ITEMS),
});

export const cartReconciliationRequestSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1).max(CART_MAX_QUANTITY),
          unitPrice: moneySchema,
        }),
      )
      .min(1)
      .max(CART_MAX_ITEMS),
  })
  .superRefine(({ items }, context) => {
    const productIds = new Set<string>();

    items.forEach((item, index) => {
      if (productIds.has(item.productId)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Each product may appear only once.",
        });
      }

      productIds.add(item.productId);
    });
  });

export type CartItem = z.infer<typeof cartItemSchema>;
export type CartItemSnapshot = CartItem["snapshot"];

export type CartIssueCode =
  | "PRODUCT_MISSING"
  | "PRODUCT_ARCHIVED"
  | "SUPPLIER_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "INSUFFICIENT_STOCK"
  | "PRICE_CHANGED";

export type ReconciledCartProduct = {
  id: string;
  name: string;
  unitPrice: string;
  stock: number;
  imageUrl: string | null;
  imageAlt: string | null;
  supplierId: string;
  supplierName: string;
};

export type ReconciledCartItem = {
  productId: string;
  product: ReconciledCartProduct | null;
  orderable: boolean;
  issues: Array<{
    code: CartIssueCode;
    message: string;
  }>;
};

export type CartReconciliationResponse = {
  items: ReconciledCartItem[];
};

export function cartStorageKey(ownerId: string) {
  return `stockflow.cart.v${CART_STORAGE_VERSION}.${ownerId}`;
}

export function formatCartPrice(price: string | number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(price));
}
