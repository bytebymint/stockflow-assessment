import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { SupplierStatus, UserRole } from "@/generated/prisma/client";
import { isApprovedSupplier } from "@/lib/auth/policy";
import { getWorkspacePath } from "@/lib/auth/paths";
import { getDatabase } from "@/lib/database";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  supplierStatus: SupplierStatus | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return getDatabase().user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      supplierStatus: true,
    },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect(getWorkspacePath(user));
  }

  return user;
}

export async function requireApprovedSupplier() {
  const user = await requireRole("SUPPLIER");

  if (!isApprovedSupplier(user)) {
    redirect("/supplier/status");
  }

  return user;
}
