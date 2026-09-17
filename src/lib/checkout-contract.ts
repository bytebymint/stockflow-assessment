import { z } from "zod";

import { CART_MAX_ITEMS, CART_MAX_QUANTITY } from "@/lib/cart";

const checkoutMoneySchema = z.string().regex(/^\d{1,10}\.\d{2}$/);

export const checkoutRequestSchema = z
  .object({
    checkoutToken: z.string().uuid(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1).max(CART_MAX_QUANTITY),
          unitPrice: checkoutMoneySchema,
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

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export type CheckoutIssueCode =
  | "PRODUCT_MISSING"
  | "PRODUCT_ARCHIVED"
  | "SUPPLIER_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "INSUFFICIENT_STOCK"
  | "PRICE_CHANGED";

export type CheckoutIssue = {
  productId: string;
  code: CheckoutIssueCode;
  message: string;
};

export type CheckoutReceipt = {
  id: string;
  reference: string;
  createdAt: string;
  itemCount: number;
  orderCount: number;
  total: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    supplierName: string;
    subtotal: string;
    itemCount: number;
  }>;
};

export type CheckoutSuccessResponse = {
  checkout: CheckoutReceipt;
};

export type CheckoutErrorResponse = {
  message: string;
  issues?: CheckoutIssue[];
};
