import { cartReconciliationRequestSchema } from "@/lib/cart";
import type { CartIssueCode, CartReconciliationResponse } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/database";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { message: "Sign in with a customer account to review this cart." },
      { status: 401 },
    );
  }

  if (user.role !== "CUSTOMER") {
    return Response.json(
      { message: "A customer account is required to review a cart." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "The cart request is not valid JSON." },
      { status: 400 },
    );
  }

  const parsedRequest = cartReconciliationRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return Response.json(
      { message: "The cart contains invalid products or quantities." },
      { status: 400 },
    );
  }

  const requestedItems = parsedRequest.data.items;
  const products = await getDatabase().product.findMany({
    where: { id: { in: requestedItems.map((item) => item.productId) } },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      imageUrl: true,
      imageAlt: true,
      archivedAt: true,
      supplier: {
        select: {
          id: true,
          name: true,
          role: true,
          supplierStatus: true,
        },
      },
    },
  });
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  const response: CartReconciliationResponse = {
    items: requestedItems.map((requestedItem) => {
      const product = productsById.get(requestedItem.productId);

      if (!product) {
        return {
          productId: requestedItem.productId,
          product: null,
          orderable: false,
          issues: [
            {
              code: "PRODUCT_MISSING" as CartIssueCode,
              message: "This product no longer exists and must be removed.",
            },
          ],
        };
      }

      const issues: CartReconciliationResponse["items"][number]["issues"] = [];
      const currentPrice = product.price.toFixed(2);

      if (product.archivedAt) {
        issues.push({
          code: "PRODUCT_ARCHIVED",
          message: "This listing has been archived by its supplier.",
        });
      }

      if (
        product.supplier.role !== "SUPPLIER" ||
        product.supplier.supplierStatus !== "APPROVED"
      ) {
        issues.push({
          code: "SUPPLIER_UNAVAILABLE",
          message: "This supplier is not currently approved to accept orders.",
        });
      }

      if (product.stock === 0) {
        issues.push({
          code: "OUT_OF_STOCK",
          message: "This product is currently out of stock.",
        });
      } else if (requestedItem.quantity > product.stock) {
        issues.push({
          code: "INSUFFICIENT_STOCK",
          message: `Only ${product.stock} ${product.stock === 1 ? "unit is" : "units are"} currently available.`,
        });
      }

      if (currentPrice !== requestedItem.unitPrice) {
        issues.push({
          code: "PRICE_CHANGED",
          message: "The unit price changed since this product was added.",
        });
      }

      return {
        productId: requestedItem.productId,
        product: {
          id: product.id,
          name: product.name,
          unitPrice: currentPrice,
          stock: product.stock,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          supplierId: product.supplier.id,
          supplierName: product.supplier.name,
        },
        orderable: !issues.some((issue) => issue.code !== "PRICE_CHANGED"),
        issues,
      };
    }),
  };

  return Response.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
