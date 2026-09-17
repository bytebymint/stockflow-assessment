import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { categorySchema } from "@/lib/categories/validation";
import { checkoutRequestSchema } from "@/lib/checkout-contract";
import { productSchema } from "@/lib/products/validation";

const validProduct = {
  name: "Safety gloves",
  slug: "safety-gloves",
  description: "Protective gloves for warehouse operations.",
  categoryId: randomUUID(),
  price: "12.50",
  stock: "0",
  lowStockThreshold: "0",
  imageUrl: "",
  imagePublicId: "",
  imageAlt: "",
};

describe("catalog validation", () => {
  it("accepts zero stock while requiring a positive monetary price", () => {
    const result = productSchema.parse(validProduct);

    expect(result.stock).toBe(0);
    expect(result.lowStockThreshold).toBe(0);
    expect(result.price).toBe("12.50");
  });

  it.each([
    ["negative stock", { stock: "-1" }],
    ["fractional stock", { stock: "1.5" }],
    ["zero price", { price: "0.00" }],
    ["invalid slug", { slug: "Safety Gloves" }],
  ])("rejects %s", (_caseName, override) => {
    expect(
      productSchema.safeParse({ ...validProduct, ...override }).success,
    ).toBe(false);
  });

  it("requires a verified image pair and useful alternative text", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/item.jpg",
      imagePublicId: "",
      imageAlt: "x",
    });

    expect(result.success).toBe(false);
  });

  it("rejects category slugs that cannot form a stable URL", () => {
    expect(
      categorySchema.safeParse({
        name: "Warehouse Gear",
        slug: "Warehouse Gear!",
        description: "Operational equipment",
      }).success,
    ).toBe(false);
  });
});

describe("checkout request validation", () => {
  it("rejects duplicate products", () => {
    const productId = randomUUID();
    const result = checkoutRequestSchema.safeParse({
      checkoutToken: randomUUID(),
      items: [
        { productId, quantity: 1, unitPrice: "10.00" },
        { productId, quantity: 2, unitPrice: "10.00" },
      ],
    });

    expect(result.success).toBe(false);
  });

  it.each([0, -1, 1.5, 1_000])("rejects invalid quantity %s", (quantity) => {
    const result = checkoutRequestSchema.safeParse({
      checkoutToken: randomUUID(),
      items: [{ productId: randomUUID(), quantity, unitPrice: "10.00" }],
    });

    expect(result.success).toBe(false);
  });
});
