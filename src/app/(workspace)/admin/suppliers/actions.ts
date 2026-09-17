"use server";

import { revalidatePath } from "next/cache";

import { NotificationType, UserRole } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/session";
import {
  invalidateAdminDashboardCache,
  invalidatePublicCatalogCache,
  invalidateSupplierDashboardCache,
} from "@/lib/cache/tags";
import { getDatabase } from "@/lib/database";
import type { SupplierDecisionState } from "@/lib/suppliers/form-state";
import { supplierDecisionSchema } from "@/lib/suppliers/validation";

const notificationContent = {
  APPROVED: {
    title: "Supplier account approved",
    message:
      "Your supplier account is approved. You can now access supplier tools and list products.",
    href: "/supplier",
  },
  PENDING: {
    title: "Supplier account returned to review",
    message:
      "Your supplier account has been returned to review. Product listing is unavailable until approval.",
    href: "/supplier/status",
  },
  REJECTED: {
    title: "Supplier application not approved",
    message:
      "Your supplier application was not approved. Product listing remains unavailable.",
    href: "/supplier/status",
  },
} as const;

function refreshSupplierViews(supplierId: string) {
  invalidatePublicCatalogCache();
  invalidateAdminDashboardCache();
  invalidateSupplierDashboardCache(supplierId);
  revalidatePath("/admin");
  revalidatePath("/admin/suppliers");
  revalidatePath("/supplier");
  revalidatePath("/supplier/status");
  revalidatePath("/notifications");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateSupplierStatus(
  _previousState: SupplierDecisionState,
  formData: FormData,
): Promise<SupplierDecisionState> {
  await requireRole("ADMIN");

  const parsedDecision = supplierDecisionSchema.safeParse({
    supplierId: formData.get("supplierId"),
    targetStatus: formData.get("targetStatus"),
    note: formData.get("note"),
  });

  if (!parsedDecision.success) {
    const noteError = parsedDecision.error.flatten().fieldErrors.note?.[0];
    return {
      status: "error",
      message:
        noteError ??
        "This supplier decision is invalid. Refresh and try again.",
    };
  }

  const { supplierId, targetStatus, note } = parsedDecision.data;
  const content = notificationContent[targetStatus];
  const database = getDatabase();

  try {
    const result = await database.$transaction(async (transaction) => {
      const supplier = await transaction.user.findUnique({
        where: { id: supplierId },
        select: {
          name: true,
          role: true,
          supplierStatus: true,
        },
      });

      if (
        !supplier ||
        supplier.role !== UserRole.SUPPLIER ||
        !supplier.supplierStatus
      ) {
        return { outcome: "missing" as const };
      }

      if (supplier.supplierStatus === targetStatus) {
        return { outcome: "unchanged" as const, name: supplier.name };
      }

      const update = await transaction.user.updateMany({
        where: {
          id: supplierId,
          role: UserRole.SUPPLIER,
          supplierStatus: supplier.supplierStatus,
        },
        data: { supplierStatus: targetStatus },
      });

      if (update.count !== 1) {
        return { outcome: "conflict" as const };
      }

      await transaction.notification.create({
        data: {
          userId: supplierId,
          type: NotificationType.SUPPLIER_STATUS_CHANGED,
          title: content.title,
          message: note
            ? `${content.message} Administrator note: ${note}`
            : content.message,
          href: content.href,
        },
      });

      return { outcome: "updated" as const, name: supplier.name };
    });

    if (result.outcome === "missing") {
      return {
        status: "error",
        message: "This supplier account no longer exists. Refresh the page.",
      };
    }

    if (result.outcome === "unchanged") {
      return {
        status: "error",
        message: `${result.name} is already ${targetStatus.toLowerCase()}.`,
      };
    }

    if (result.outcome === "conflict") {
      return {
        status: "error",
        message:
          "Another administrator changed this supplier. Refresh before making another decision.",
      };
    }

    refreshSupplierViews(supplierId);

    return {
      status: "success",
      message: `${result.name} is now ${targetStatus.toLowerCase()}.`,
    };
  } catch {
    return {
      status: "error",
      message: "The supplier status could not be updated. Please try again.",
    };
  }
}
