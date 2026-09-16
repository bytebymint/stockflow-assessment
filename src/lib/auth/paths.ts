import type { SupplierStatus, UserRole } from "@/generated/prisma/client";

type RoleIdentity = {
  role: UserRole;
  supplierStatus: SupplierStatus | null;
};

export function getWorkspacePath(identity: RoleIdentity) {
  if (identity.role === "ADMIN") {
    return "/admin";
  }

  if (identity.role === "SUPPLIER") {
    return identity.supplierStatus === "APPROVED"
      ? "/supplier"
      : "/supplier/status";
  }

  return "/account";
}

export function getSafeReturnTo(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return null;
  }

  if (value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  try {
    const baseUrl = new URL("https://stockflow.local");
    const destination = new URL(value, baseUrl);

    if (destination.origin !== baseUrl.origin) {
      return null;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}
