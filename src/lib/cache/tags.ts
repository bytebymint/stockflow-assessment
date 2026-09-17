import "server-only";

import { revalidateTag } from "next/cache";

export const PUBLIC_CATALOG_CACHE_TAG = "stockflow:catalog";
export const ADMIN_DASHBOARD_CACHE_TAG = "stockflow:dashboard:admin";

export function supplierDashboardCacheTag(supplierId: string) {
  return `stockflow:dashboard:supplier:${supplierId}`;
}

export function invalidatePublicCatalogCache() {
  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, { expire: 0 });
}

export function invalidateAdminDashboardCache() {
  revalidateTag(ADMIN_DASHBOARD_CACHE_TAG, { expire: 0 });
}

export function invalidateSupplierDashboardCache(supplierId: string) {
  revalidateTag(supplierDashboardCacheTag(supplierId), { expire: 0 });
}

export function invalidateInventoryCaches(supplierId: string) {
  invalidatePublicCatalogCache();
  invalidateAdminDashboardCache();
  invalidateSupplierDashboardCache(supplierId);
}
