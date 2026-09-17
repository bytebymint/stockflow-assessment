"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  CART_MAX_ITEMS,
  CART_MAX_QUANTITY,
  CART_STORAGE_VERSION,
  cartStorageKey,
  storedCartSchema,
  type CartItem,
  type CartItemSnapshot,
  type CartReconciliationResponse,
  type ReconciledCartItem,
} from "@/lib/cart";

export type CartDisplayItem = CartItem & {
  live: ReconciledCartItem | null;
};

type ReconciliationStatus = "idle" | "checking" | "ready" | "error";

type CartContextValue = {
  items: CartDisplayItem[];
  itemCount: number;
  hydrated: boolean;
  reconciliationStatus: ReconciliationStatus;
  reconciliationError: string | null;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (productId: string, snapshot: CartItemSnapshot) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  acceptCurrentPrice: (productId: string) => void;
  refreshCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function deduplicateItems(items: CartItem[]) {
  const uniqueItems = new Map<string, CartItem>();

  items.forEach((item) => uniqueItems.set(item.productId, item));
  return Array.from(uniqueItems.values()).slice(0, CART_MAX_ITEMS);
}

export function CartProvider({
  ownerId,
  children,
}: {
  ownerId: string | null;
  children: ReactNode;
}) {
  const [storedItems, setStoredItems] = useState<CartItem[]>([]);
  const [liveItems, setLiveItems] = useState<ReconciledCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [reconciliationStatus, setReconciliationStatus] =
    useState<ReconciliationStatus>("idle");
  const [reconciliationError, setReconciliationError] = useState<string | null>(
    null,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const storageKey = ownerId ? cartStorageKey(ownerId) : null;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHydrated(false);
      setLiveItems([]);
      setReconciliationError(null);
      setReconciliationStatus("idle");

      if (!storageKey) {
        setStoredItems([]);
        setReconciliationStatus("ready");
        setHydrated(true);
        return;
      }

      try {
        const rawCart = window.localStorage.getItem(storageKey);

        if (!rawCart) {
          setStoredItems([]);
          setReconciliationStatus("ready");
        } else {
          const parsedCart = storedCartSchema.safeParse(JSON.parse(rawCart));
          const parsedItems = parsedCart.success
            ? deduplicateItems(parsedCart.data.items)
            : [];
          setStoredItems(parsedItems);
          setReconciliationStatus(
            parsedItems.length > 0 ? "checking" : "ready",
          );

          if (!parsedCart.success) {
            window.localStorage.removeItem(storageKey);
            toast.warning("An invalid saved cart was cleared safely.");
          }
        }
      } catch {
        setStoredItems([]);
        setReconciliationStatus("ready");
        toast.error("Your saved cart could not be loaded on this browser.");
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || !storageKey) return;

    try {
      if (storedItems.length === 0) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            version: CART_STORAGE_VERSION,
            items: storedItems,
          }),
        );
      }
    } catch {
      toast.error("Cart changes could not be saved on this browser.");
    }
  }, [hydrated, storageKey, storedItems]);

  useEffect(() => {
    if (!storageKey) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;

      if (!event.newValue) {
        setStoredItems([]);
        setReconciliationStatus("ready");
        return;
      }

      try {
        const parsedCart = storedCartSchema.safeParse(
          JSON.parse(event.newValue),
        );
        if (parsedCart.success) {
          const parsedItems = deduplicateItems(parsedCart.data.items);
          setStoredItems(parsedItems);
          setReconciliationStatus(
            parsedItems.length > 0 ? "checking" : "ready",
          );
        }
      } catch {
        // Ignore malformed cart updates from another tab.
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || !ownerId) return;

    if (storedItems.length === 0) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setReconciliationStatus("checking");
      setReconciliationError(null);

      try {
        const response = await fetch("/api/cart/reconcile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: storedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.snapshot.unitPrice,
            })),
          }),
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as
          CartReconciliationResponse | { message?: string };

        if (!response.ok || !("items" in result)) {
          throw new Error(
            "message" in result && result.message
              ? result.message
              : "The cart could not be refreshed.",
          );
        }

        setLiveItems(result.items);
        setReconciliationStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;

        setReconciliationStatus("error");
        setReconciliationError(
          error instanceof Error
            ? error.message
            : "The cart could not be refreshed.",
        );
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [hydrated, ownerId, refreshVersion, storedItems]);

  const addItem = useCallback(
    (productId: string, snapshot: CartItemSnapshot) => {
      if (!ownerId) return;

      setStoredItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.productId === productId,
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, CART_MAX_QUANTITY),
                  snapshot,
                }
              : item,
          );
        }

        if (currentItems.length >= CART_MAX_ITEMS) {
          toast.error(`A cart can contain up to ${CART_MAX_ITEMS} products.`);
          return currentItems;
        }

        return [...currentItems, { productId, quantity: 1, snapshot }];
      });
      setReconciliationStatus("checking");
      setCartOpen(true);
    },
    [ownerId],
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const safeQuantity = Math.max(
      1,
      Math.min(Math.trunc(quantity) || 1, CART_MAX_QUANTITY),
    );
    setStoredItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
    setReconciliationStatus("checking");
  }, []);

  const removeItem = useCallback((productId: string) => {
    setStoredItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
    toast.success("Product removed from cart.");
  }, []);

  const clearCart = useCallback(() => {
    setStoredItems([]);
    toast.success("Cart cleared.");
  }, []);

  const acceptCurrentPrice = useCallback(
    (productId: string) => {
      const liveItem = liveItems.find((item) => item.productId === productId);
      const product = liveItem?.product;

      if (!product) return;

      setStoredItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                snapshot: {
                  name: product.name,
                  unitPrice: product.unitPrice,
                  imageUrl: product.imageUrl,
                  imageAlt: product.imageAlt,
                  supplierId: product.supplierId,
                  supplierName: product.supplierName,
                },
              }
            : item,
        ),
      );
      setReconciliationStatus("checking");
      toast.success("Current price accepted.");
    },
    [liveItems],
  );

  const refreshCart = useCallback(
    () => setRefreshVersion((version) => version + 1),
    [],
  );

  const liveItemsById = useMemo(
    () => new Map(liveItems.map((item) => [item.productId, item])),
    [liveItems],
  );
  const items = useMemo(
    () =>
      storedItems.map((item) => ({
        ...item,
        live: liveItemsById.get(item.productId) ?? null,
      })),
    [liveItemsById, storedItems],
  );
  const itemCount = useMemo(
    () => storedItems.reduce((total, item) => total + item.quantity, 0),
    [storedItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      hydrated,
      reconciliationStatus:
        hydrated && storedItems.length === 0 ? "ready" : reconciliationStatus,
      reconciliationError:
        storedItems.length === 0 ? null : reconciliationError,
      cartOpen,
      setCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      acceptCurrentPrice,
      refreshCart,
    }),
    [
      acceptCurrentPrice,
      addItem,
      cartOpen,
      clearCart,
      hydrated,
      itemCount,
      items,
      reconciliationError,
      reconciliationStatus,
      refreshCart,
      removeItem,
      storedItems.length,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}

export function getCartDisplayProduct(item: CartDisplayItem) {
  return {
    name: item.live?.product?.name ?? item.snapshot.name,
    unitPrice: item.live?.product?.unitPrice ?? item.snapshot.unitPrice,
    imageUrl: item.live?.product?.imageUrl ?? item.snapshot.imageUrl,
    imageAlt: item.live?.product?.imageAlt ?? item.snapshot.imageAlt,
    supplierId: item.live?.product?.supplierId ?? item.snapshot.supplierId,
    supplierName:
      item.live?.product?.supplierName ?? item.snapshot.supplierName,
    stock: item.live?.product?.stock,
  };
}

export function getCartAvailableSubtotal(items: CartDisplayItem[]) {
  return items.reduce((total, item) => {
    if (item.live && !item.live.orderable) return total;

    const product = getCartDisplayProduct(item);
    return total + Number(product.unitPrice) * item.quantity;
  }, 0);
}
