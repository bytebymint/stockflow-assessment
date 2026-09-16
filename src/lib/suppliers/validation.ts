import { z } from "zod";

export const supplierDecisionSchema = z.object({
  supplierId: z.string().uuid(),
  targetStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  note: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0 ? null : value,
    z
      .string()
      .trim()
      .max(300, "Keep the decision note to 300 characters or fewer.")
      .nullable(),
  ),
});
