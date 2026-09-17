import { describe, expect, it } from "vitest";

import { SupplierStatus, UserRole } from "@/generated/prisma/client";
import { isApprovedSupplier } from "@/lib/auth/policy";
import { registrationSchema, signInSchema } from "@/lib/auth/validation";

describe("authentication validation", () => {
  it("normalizes valid registration data", () => {
    const result = registrationSchema.parse({
      name: "  Ada Supplier  ",
      email: "  ADA@EXAMPLE.COM ",
      password: "Strong-password-123",
      confirmPassword: "Strong-password-123",
      role: "SUPPLIER",
    });

    expect(result.name).toBe("Ada Supplier");
    expect(result.email).toBe("ada@example.com");
    expect(result.role).toBe("SUPPLIER");
  });

  it("rejects administrator self-registration and weak passwords", () => {
    const result = registrationSchema.safeParse({
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      confirmPassword: "password",
      role: "ADMIN",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registrationSchema.safeParse({
      name: "Customer User",
      email: "customer@example.com",
      password: "Strong-password-123",
      confirmPassword: "Different-password-456",
      role: "CUSTOMER",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      "Passwords do not match.",
    );
  });

  it("normalizes sign-in email addresses", () => {
    const result = signInSchema.parse({
      email: "  USER@EXAMPLE.COM ",
      password: "anything",
    });

    expect(result.email).toBe("user@example.com");
  });
});

describe("supplier approval policy", () => {
  it("allows only approved supplier identities", () => {
    expect(
      isApprovedSupplier({
        role: UserRole.SUPPLIER,
        supplierStatus: SupplierStatus.APPROVED,
      }),
    ).toBe(true);

    for (const supplierStatus of [
      SupplierStatus.PENDING,
      SupplierStatus.REJECTED,
    ]) {
      expect(
        isApprovedSupplier({ role: UserRole.SUPPLIER, supplierStatus }),
      ).toBe(false);
    }

    expect(
      isApprovedSupplier({
        role: UserRole.CUSTOMER,
        supplierStatus: null,
      }),
    ).toBe(false);
  });
});
