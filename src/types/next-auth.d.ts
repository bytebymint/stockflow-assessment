import type { DefaultSession } from "next-auth";

import type { SupplierStatus, UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      supplierStatus: SupplierStatus | null;
    };
  }

  interface User {
    role: UserRole;
    supplierStatus: SupplierStatus | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    supplierStatus: SupplierStatus | null;
  }
}
