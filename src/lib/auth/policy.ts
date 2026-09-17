import type { SupplierStatus, UserRole } from "@/generated/prisma/client";

type SupplierIdentity = {
  role: UserRole;
  supplierStatus: SupplierStatus | null;
};

export function isApprovedSupplier(identity: SupplierIdentity) {
  return identity.role === "SUPPLIER" && identity.supplierStatus === "APPROVED";
}
