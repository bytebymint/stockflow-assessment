import { z } from "zod";

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(/^\d+$/, `${label} must be a whole number.`)
    .refine((value) => Number(value) <= 1_000_000, {
      message: `${label} must be 1,000,000 or less.`,
    })
    .transform(Number);

export const productSchema = z.object({
  name: requiredText("Product name", 160),
  slug: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(180, "Keep the slug to 180 characters or fewer.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens only.",
    ),
  description: requiredText("Description", 2_000),
  categoryId: z.string().uuid("Choose a category."),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .regex(
      /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
      "Enter a valid price with up to 2 decimal places.",
    )
    .refine((value) => Number(value) > 0, {
      message: "Price must be greater than zero.",
    }),
  stock: wholeNumber("Stock quantity"),
  lowStockThreshold: wholeNumber("Low-stock threshold"),
});

export const productIdSchema = z.string().uuid();
