import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(320, "Email addresses must be 320 characters or fewer.")
  .email("Enter a valid email address.")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(72, "Use 72 characters or fewer.")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "Use a password no longer than 72 bytes.",
  )
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(120, "Names must be 120 characters or fewer."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    role: z.enum(["CUSTOMER", "SUPPLIER"], {
      error: "Choose customer or supplier.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegistrationRole = z.infer<typeof registrationSchema>["role"];
