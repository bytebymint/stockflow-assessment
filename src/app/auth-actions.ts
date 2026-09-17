"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { SupplierStatus, UserRole } from "@/generated/prisma/client";
import type { AuthFormState, AuthField } from "@/lib/auth/form-state";
import { getSafeReturnTo, getWorkspacePath } from "@/lib/auth/paths";
import { registrationSchema, signInSchema } from "@/lib/auth/validation";
import { invalidateAdminDashboardCache } from "@/lib/cache/tags";
import { getDatabase } from "@/lib/database";

function fieldErrors(
  errors: Record<string, string[] | undefined>,
): Partial<Record<AuthField, string[]>> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, messages]) => messages?.length),
  ) as Partial<Record<AuthField, string[]>>;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedCredentials = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrors(parsedCredentials.error.flatten().fieldErrors),
      values: {
        email:
          typeof formData.get("email") === "string"
            ? String(formData.get("email")).trim()
            : "",
      },
    };
  }

  const redirectTo =
    getSafeReturnTo(formData.get("returnTo")) ?? "/auth/continue";

  try {
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message:
          error.type === "CredentialsSignin"
            ? "The email or password is incorrect. Please try again."
            : "We couldn't sign you in right now. Please try again shortly.",
        values: { email: parsedCredentials.data.email },
      };
    }

    throw error;
  }

  return { status: "idle" };
}

export async function register(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const submittedValues = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  };
  const parsedRegistration = registrationSchema.safeParse(submittedValues);
  const safeValues = {
    name:
      typeof submittedValues.name === "string"
        ? submittedValues.name.trim()
        : "",
    email:
      typeof submittedValues.email === "string"
        ? submittedValues.email.trim()
        : "",
    role:
      submittedValues.role === "SUPPLIER"
        ? ("SUPPLIER" as const)
        : ("CUSTOMER" as const),
  };

  if (!parsedRegistration.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrors(parsedRegistration.error.flatten().fieldErrors),
      values: safeValues,
    };
  }

  const { name, email, password, role } = parsedRegistration.data;
  const database = getDatabase();

  try {
    const existingUser = await database.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        status: "error",
        message: "An account already uses this email. Sign in instead.",
        fieldErrors: { email: ["This email is already registered."] },
        values: { name, email, role },
      };
    }

    await database.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        role: role === "SUPPLIER" ? UserRole.SUPPLIER : UserRole.CUSTOMER,
        supplierStatus: role === "SUPPLIER" ? SupplierStatus.PENDING : null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "An account already uses this email. Sign in instead.",
        fieldErrors: { email: ["This email is already registered."] },
        values: { name, email, role },
      };
    }

    return {
      status: "error",
      message: "We couldn't create your account. Please try again shortly.",
      values: { name, email, role },
    };
  }

  if (role === "SUPPLIER") {
    invalidateAdminDashboardCache();
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo: getWorkspacePath({
      role: role === "SUPPLIER" ? UserRole.SUPPLIER : UserRole.CUSTOMER,
      supplierStatus: role === "SUPPLIER" ? SupplierStatus.PENDING : null,
    }),
  });

  return { status: "idle" };
}

export async function endSession() {
  await signOut({ redirectTo: "/" });
}
