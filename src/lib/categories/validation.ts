import { z } from "zod";

const descriptionSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? null : value,
  z
    .string()
    .trim()
    .max(240, "Keep the description to 240 characters or fewer.")
    .nullable(),
);

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Keep the name to 80 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(100, "Keep the slug to 100 characters or fewer.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens only.",
    ),
  description: descriptionSchema,
});

export const categoryIdSchema = z.string().uuid();
