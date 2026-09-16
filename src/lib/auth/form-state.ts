import type { RegistrationRole } from "@/lib/auth/validation";

export type AuthField =
  "name" | "email" | "password" | "confirmPassword" | "role";

export type AuthFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string[]>>;
  values?: {
    name?: string;
    email?: string;
    role?: RegistrationRole;
  };
};

export const initialAuthFormState: AuthFormState = {
  status: "idle",
};
