import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { compare, hash } from "bcryptjs";

import {
  NotificationType,
  OrderStatus,
  Prisma,
  PrismaClient,
  SupplierStatus,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed StockFlow.");
}

const database = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const ids = {
  users: {
    admin: "10000000-0000-4000-8000-000000000001",
    customer: "10000000-0000-4000-8000-000000000002",
    northstarSupplier: "10000000-0000-4000-8000-000000000003",
    pendingSupplier: "10000000-0000-4000-8000-000000000004",
    harborSupplier: "10000000-0000-4000-8000-000000000005",
  },
  categories: {
    tools: "20000000-0000-4000-8000-000000000001",
    office: "20000000-0000-4000-8000-000000000002",
    safety: "20000000-0000-4000-8000-000000000003",
    electronics: "20000000-0000-4000-8000-000000000004",
  },
  products: {
    drill: "30000000-0000-4000-8000-000000000001",
    gloves: "30000000-0000-4000-8000-000000000002",
    laserMeasure: "30000000-0000-4000-8000-000000000003",
    socketSet: "30000000-0000-4000-8000-000000000004",
    chair: "30000000-0000-4000-8000-000000000005",
    labels: "30000000-0000-4000-8000-000000000006",
    dock: "30000000-0000-4000-8000-000000000007",
    scanner: "30000000-0000-4000-8000-000000000008",
  },
  checkoutGroups: {
    delivered: "40000000-0000-4000-8000-000000000001",
    inProgress: "40000000-0000-4000-8000-000000000002",
    pending: "40000000-0000-4000-8000-000000000003",
    cancelled: "40000000-0000-4000-8000-000000000004",
  },
  orders: {
    deliveredNorthstar: "50000000-0000-4000-8000-000000000001",
    deliveredHarbor: "50000000-0000-4000-8000-000000000002",
    confirmedNorthstar: "50000000-0000-4000-8000-000000000003",
    shippedHarbor: "50000000-0000-4000-8000-000000000004",
    pendingHarbor: "50000000-0000-4000-8000-000000000005",
    cancelledNorthstar: "50000000-0000-4000-8000-000000000006",
  },
  orderItems: {
    deliveredDrill: "60000000-0000-4000-8000-000000000001",
    deliveredGloves: "60000000-0000-4000-8000-000000000002",
    deliveredSocketSet: "60000000-0000-4000-8000-000000000003",
    deliveredChair: "60000000-0000-4000-8000-000000000004",
    deliveredLabels: "60000000-0000-4000-8000-000000000005",
    confirmedLaserMeasure: "60000000-0000-4000-8000-000000000006",
    shippedDock: "60000000-0000-4000-8000-000000000007",
    pendingScanner: "60000000-0000-4000-8000-000000000008",
    cancelledGloves: "60000000-0000-4000-8000-000000000009",
  },
  notifications: {
    supplierApproved: "70000000-0000-4000-8000-000000000001",
    lowStock: "70000000-0000-4000-8000-000000000002",
    newOrder: "70000000-0000-4000-8000-000000000003",
    orderShipped: "70000000-0000-4000-8000-000000000004",
    orderDelivered: "70000000-0000-4000-8000-000000000005",
  },
} as const;

function at(value: string) {
  return new Date(value);
}

function requireDemoPassword(name: string) {
  const value = process.env[name];

  if (!value || value.length < 12) {
    throw new Error(`${name} must be set to at least 12 characters.`);
  }

  return value;
}

async function reusablePasswordHash(userId: string, password: string) {
  const existingUser = await database.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (
    existingUser?.passwordHash &&
    (await compare(password, existingUser.passwordHash))
  ) {
    return existingUser.passwordHash;
  }

  return hash(password, 12);
}

async function main() {
  const passwords = {
    admin: requireDemoPassword("DEMO_ADMIN_PASSWORD"),
    customer: requireDemoPassword("DEMO_CUSTOMER_PASSWORD"),
    supplier: requireDemoPassword("DEMO_SUPPLIER_PASSWORD"),
    pendingSupplier: requireDemoPassword("DEMO_PENDING_SUPPLIER_PASSWORD"),
  };

  const [adminHash, customerHash, northstarHash, pendingHash, harborHash] =
    await Promise.all([
      reusablePasswordHash(ids.users.admin, passwords.admin),
      reusablePasswordHash(ids.users.customer, passwords.customer),
      reusablePasswordHash(ids.users.northstarSupplier, passwords.supplier),
      reusablePasswordHash(
        ids.users.pendingSupplier,
        passwords.pendingSupplier,
      ),
      reusablePasswordHash(ids.users.harborSupplier, passwords.supplier),
    ]);

  const users = [
    {
      id: ids.users.admin,
      name: "Avery Morgan",
      email: "admin@stockflow.demo",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      supplierStatus: null,
      createdAt: at("2026-08-01T09:00:00.000Z"),
      updatedAt: at("2026-08-01T09:00:00.000Z"),
    },
    {
      id: ids.users.customer,
      name: "Jordan Lee",
      email: "customer@stockflow.demo",
      passwordHash: customerHash,
      role: UserRole.CUSTOMER,
      supplierStatus: null,
      createdAt: at("2026-08-02T10:00:00.000Z"),
      updatedAt: at("2026-08-02T10:00:00.000Z"),
    },
    {
      id: ids.users.northstarSupplier,
      name: "Northstar Tools",
      email: "supplier@stockflow.demo",
      passwordHash: northstarHash,
      role: UserRole.SUPPLIER,
      supplierStatus: SupplierStatus.APPROVED,
      createdAt: at("2026-08-03T11:00:00.000Z"),
      updatedAt: at("2026-08-04T09:30:00.000Z"),
    },
    {
      id: ids.users.pendingSupplier,
      name: "Summit Wholesale",
      email: "pending@stockflow.demo",
      passwordHash: pendingHash,
      role: UserRole.SUPPLIER,
      supplierStatus: SupplierStatus.PENDING,
      createdAt: at("2026-09-12T14:00:00.000Z"),
      updatedAt: at("2026-09-12T14:00:00.000Z"),
    },
    {
      id: ids.users.harborSupplier,
      name: "Harbor Office Co.",
      email: "supplier2@stockflow.demo",
      passwordHash: harborHash,
      role: UserRole.SUPPLIER,
      supplierStatus: SupplierStatus.APPROVED,
      createdAt: at("2026-08-05T08:30:00.000Z"),
      updatedAt: at("2026-08-06T12:00:00.000Z"),
    },
  ] satisfies Prisma.UserUncheckedCreateInput[];

  const categories = [
    {
      id: ids.categories.tools,
      name: "Tools",
      slug: "tools",
      description: "Reliable tools for workshops and field teams.",
      createdAt: at("2026-08-07T08:00:00.000Z"),
      updatedAt: at("2026-08-07T08:00:00.000Z"),
    },
    {
      id: ids.categories.office,
      name: "Office",
      slug: "office",
      description: "Workplace furniture and everyday office supplies.",
      createdAt: at("2026-08-07T08:05:00.000Z"),
      updatedAt: at("2026-08-07T08:05:00.000Z"),
    },
    {
      id: ids.categories.safety,
      name: "Safety",
      slug: "safety",
      description: "Protective equipment for operational teams.",
      createdAt: at("2026-08-07T08:10:00.000Z"),
      updatedAt: at("2026-08-07T08:10:00.000Z"),
    },
    {
      id: ids.categories.electronics,
      name: "Electronics",
      slug: "electronics",
      description: "Devices and accessories for connected workflows.",
      createdAt: at("2026-08-07T08:15:00.000Z"),
      updatedAt: at("2026-08-07T08:15:00.000Z"),
    },
  ] satisfies Prisma.CategoryUncheckedCreateInput[];

  const products = [
    {
      id: ids.products.drill,
      supplierId: ids.users.northstarSupplier,
      categoryId: ids.categories.tools,
      name: "18V Cordless Drill",
      slug: "18v-cordless-drill",
      description:
        "Compact brushless drill with two batteries and a hard-shell case.",
      price: "129.99",
      stock: 18,
      lowStockThreshold: 5,
      archivedAt: null,
      createdAt: at("2026-08-10T09:00:00.000Z"),
      updatedAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.products.gloves,
      supplierId: ids.users.northstarSupplier,
      categoryId: ids.categories.safety,
      name: "Cut-Resistant Work Gloves",
      slug: "cut-resistant-work-gloves",
      description:
        "Level 5 cut protection with a breathable nitrile-coated palm.",
      price: "14.50",
      stock: 4,
      lowStockThreshold: 8,
      archivedAt: null,
      createdAt: at("2026-08-10T09:10:00.000Z"),
      updatedAt: at("2026-09-13T15:30:00.000Z"),
    },
    {
      id: ids.products.laserMeasure,
      supplierId: ids.users.northstarSupplier,
      categoryId: ids.categories.tools,
      name: "Digital Laser Measure",
      slug: "digital-laser-measure",
      description:
        "Pocket-size distance meter with a 50-metre range and area mode.",
      price: "79.00",
      stock: 0,
      lowStockThreshold: 5,
      archivedAt: null,
      createdAt: at("2026-08-11T10:00:00.000Z"),
      updatedAt: at("2026-09-08T10:45:00.000Z"),
    },
    {
      id: ids.products.socketSet,
      supplierId: ids.users.northstarSupplier,
      categoryId: ids.categories.tools,
      name: "42-Piece Socket Set",
      slug: "42-piece-socket-set",
      description:
        "Chrome vanadium metric socket set in a compact organiser case.",
      price: "59.99",
      stock: 6,
      lowStockThreshold: 4,
      archivedAt: at("2026-09-10T16:00:00.000Z"),
      createdAt: at("2026-08-11T10:10:00.000Z"),
      updatedAt: at("2026-09-10T16:00:00.000Z"),
    },
    {
      id: ids.products.chair,
      supplierId: ids.users.harborSupplier,
      categoryId: ids.categories.office,
      name: "Ergonomic Task Chair",
      slug: "ergonomic-task-chair",
      description:
        "Adjustable lumbar support, breathable mesh back and quiet casters.",
      price: "249.00",
      stock: 12,
      lowStockThreshold: 4,
      archivedAt: null,
      createdAt: at("2026-08-12T08:30:00.000Z"),
      updatedAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.products.labels,
      supplierId: ids.users.harborSupplier,
      categoryId: ids.categories.office,
      name: "Thermal Shipping Labels",
      slug: "thermal-shipping-labels",
      description:
        "A roll of 500 high-contrast 4 × 6 inch direct thermal labels.",
      price: "24.99",
      stock: 3,
      lowStockThreshold: 10,
      archivedAt: null,
      createdAt: at("2026-08-12T08:40:00.000Z"),
      updatedAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.products.dock,
      supplierId: ids.users.harborSupplier,
      categoryId: ids.categories.electronics,
      name: "USB-C Operations Dock",
      slug: "usb-c-operations-dock",
      description:
        "Dual-display dock with 100W power delivery and gigabit networking.",
      price: "189.00",
      stock: 7,
      lowStockThreshold: 5,
      archivedAt: null,
      createdAt: at("2026-08-13T13:00:00.000Z"),
      updatedAt: at("2026-09-09T13:00:00.000Z"),
    },
    {
      id: ids.products.scanner,
      supplierId: ids.users.harborSupplier,
      categoryId: ids.categories.electronics,
      name: "Wireless Inventory Scanner",
      slug: "wireless-inventory-scanner",
      description:
        "Rugged handheld barcode scanner with a charging cradle and USB receiver.",
      price: "349.00",
      stock: 2,
      lowStockThreshold: 3,
      archivedAt: null,
      createdAt: at("2026-08-13T13:10:00.000Z"),
      updatedAt: at("2026-09-12T14:35:00.000Z"),
    },
  ] satisfies Prisma.ProductUncheckedCreateInput[];

  const checkoutGroups = [
    {
      id: ids.checkoutGroups.delivered,
      reference: "SF-CHECKOUT-1001",
      customerId: ids.users.customer,
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.checkoutGroups.inProgress,
      reference: "SF-CHECKOUT-1002",
      customerId: ids.users.customer,
      createdAt: at("2026-09-08T10:45:00.000Z"),
    },
    {
      id: ids.checkoutGroups.pending,
      reference: "SF-CHECKOUT-1003",
      customerId: ids.users.customer,
      createdAt: at("2026-09-12T14:35:00.000Z"),
    },
    {
      id: ids.checkoutGroups.cancelled,
      reference: "SF-CHECKOUT-1004",
      customerId: ids.users.customer,
      createdAt: at("2026-09-13T15:20:00.000Z"),
    },
  ] satisfies Prisma.CheckoutGroupUncheckedCreateInput[];

  const orders = [
    {
      id: ids.orders.deliveredNorthstar,
      orderNumber: "SF-1001-A",
      checkoutGroupId: ids.checkoutGroups.delivered,
      customerId: ids.users.customer,
      supplierId: ids.users.northstarSupplier,
      status: OrderStatus.DELIVERED,
      subtotal: "334.47",
      confirmedAt: at("2026-09-02T12:00:00.000Z"),
      shippedAt: at("2026-09-03T09:30:00.000Z"),
      deliveredAt: at("2026-09-05T14:10:00.000Z"),
      cancelledAt: null,
      stockRestoredAt: null,
      createdAt: at("2026-09-02T11:15:00.000Z"),
      updatedAt: at("2026-09-05T14:10:00.000Z"),
    },
    {
      id: ids.orders.deliveredHarbor,
      orderNumber: "SF-1001-B",
      checkoutGroupId: ids.checkoutGroups.delivered,
      customerId: ids.users.customer,
      supplierId: ids.users.harborSupplier,
      status: OrderStatus.DELIVERED,
      subtotal: "298.98",
      confirmedAt: at("2026-09-02T12:20:00.000Z"),
      shippedAt: at("2026-09-03T13:00:00.000Z"),
      deliveredAt: at("2026-09-06T10:30:00.000Z"),
      cancelledAt: null,
      stockRestoredAt: null,
      createdAt: at("2026-09-02T11:15:00.000Z"),
      updatedAt: at("2026-09-06T10:30:00.000Z"),
    },
    {
      id: ids.orders.confirmedNorthstar,
      orderNumber: "SF-1002-A",
      checkoutGroupId: ids.checkoutGroups.inProgress,
      customerId: ids.users.customer,
      supplierId: ids.users.northstarSupplier,
      status: OrderStatus.CONFIRMED,
      subtotal: "79.00",
      confirmedAt: at("2026-09-08T12:00:00.000Z"),
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      stockRestoredAt: null,
      createdAt: at("2026-09-08T10:45:00.000Z"),
      updatedAt: at("2026-09-08T12:00:00.000Z"),
    },
    {
      id: ids.orders.shippedHarbor,
      orderNumber: "SF-1002-B",
      checkoutGroupId: ids.checkoutGroups.inProgress,
      customerId: ids.users.customer,
      supplierId: ids.users.harborSupplier,
      status: OrderStatus.SHIPPED,
      subtotal: "378.00",
      confirmedAt: at("2026-09-08T11:30:00.000Z"),
      shippedAt: at("2026-09-09T13:00:00.000Z"),
      deliveredAt: null,
      cancelledAt: null,
      stockRestoredAt: null,
      createdAt: at("2026-09-08T10:45:00.000Z"),
      updatedAt: at("2026-09-09T13:00:00.000Z"),
    },
    {
      id: ids.orders.pendingHarbor,
      orderNumber: "SF-1003-A",
      checkoutGroupId: ids.checkoutGroups.pending,
      customerId: ids.users.customer,
      supplierId: ids.users.harborSupplier,
      status: OrderStatus.PENDING,
      subtotal: "349.00",
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      stockRestoredAt: null,
      createdAt: at("2026-09-12T14:35:00.000Z"),
      updatedAt: at("2026-09-12T14:35:00.000Z"),
    },
    {
      id: ids.orders.cancelledNorthstar,
      orderNumber: "SF-1004-A",
      checkoutGroupId: ids.checkoutGroups.cancelled,
      customerId: ids.users.customer,
      supplierId: ids.users.northstarSupplier,
      status: OrderStatus.CANCELLED,
      subtotal: "43.50",
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: at("2026-09-13T15:30:00.000Z"),
      stockRestoredAt: at("2026-09-13T15:30:00.000Z"),
      createdAt: at("2026-09-13T15:20:00.000Z"),
      updatedAt: at("2026-09-13T15:30:00.000Z"),
    },
  ] satisfies Prisma.OrderUncheckedCreateInput[];

  const orderItems = [
    {
      id: ids.orderItems.deliveredDrill,
      orderId: ids.orders.deliveredNorthstar,
      productId: ids.products.drill,
      productNameSnapshot: "18V Cordless Drill",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "129.99",
      quantity: 2,
      lineTotal: "259.98",
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.orderItems.deliveredGloves,
      orderId: ids.orders.deliveredNorthstar,
      productId: ids.products.gloves,
      productNameSnapshot: "Cut-Resistant Work Gloves",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "14.50",
      quantity: 1,
      lineTotal: "14.50",
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.orderItems.deliveredSocketSet,
      orderId: ids.orders.deliveredNorthstar,
      productId: ids.products.socketSet,
      productNameSnapshot: "42-Piece Socket Set",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "59.99",
      quantity: 1,
      lineTotal: "59.99",
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.orderItems.deliveredChair,
      orderId: ids.orders.deliveredHarbor,
      productId: ids.products.chair,
      productNameSnapshot: "Ergonomic Task Chair",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "249.00",
      quantity: 1,
      lineTotal: "249.00",
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.orderItems.deliveredLabels,
      orderId: ids.orders.deliveredHarbor,
      productId: ids.products.labels,
      productNameSnapshot: "Thermal Shipping Labels",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "24.99",
      quantity: 2,
      lineTotal: "49.98",
      createdAt: at("2026-09-02T11:15:00.000Z"),
    },
    {
      id: ids.orderItems.confirmedLaserMeasure,
      orderId: ids.orders.confirmedNorthstar,
      productId: ids.products.laserMeasure,
      productNameSnapshot: "Digital Laser Measure",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "79.00",
      quantity: 1,
      lineTotal: "79.00",
      createdAt: at("2026-09-08T10:45:00.000Z"),
    },
    {
      id: ids.orderItems.shippedDock,
      orderId: ids.orders.shippedHarbor,
      productId: ids.products.dock,
      productNameSnapshot: "USB-C Operations Dock",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "189.00",
      quantity: 2,
      lineTotal: "378.00",
      createdAt: at("2026-09-08T10:45:00.000Z"),
    },
    {
      id: ids.orderItems.pendingScanner,
      orderId: ids.orders.pendingHarbor,
      productId: ids.products.scanner,
      productNameSnapshot: "Wireless Inventory Scanner",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "349.00",
      quantity: 1,
      lineTotal: "349.00",
      createdAt: at("2026-09-12T14:35:00.000Z"),
    },
    {
      id: ids.orderItems.cancelledGloves,
      orderId: ids.orders.cancelledNorthstar,
      productId: ids.products.gloves,
      productNameSnapshot: "Cut-Resistant Work Gloves",
      productImageUrlSnapshot: null,
      unitPriceSnapshot: "14.50",
      quantity: 3,
      lineTotal: "43.50",
      createdAt: at("2026-09-13T15:20:00.000Z"),
    },
  ] satisfies Prisma.OrderItemUncheckedCreateInput[];

  const notifications = [
    {
      id: ids.notifications.supplierApproved,
      userId: ids.users.northstarSupplier,
      type: NotificationType.SUPPLIER_STATUS_CHANGED,
      title: "Supplier account approved",
      message: "Your supplier account is approved and ready for listings.",
      href: "/supplier/products",
      readAt: at("2026-08-04T10:00:00.000Z"),
      createdAt: at("2026-08-04T09:30:00.000Z"),
    },
    {
      id: ids.notifications.lowStock,
      userId: ids.users.northstarSupplier,
      type: NotificationType.LOW_STOCK,
      title: "Low stock needs attention",
      message: "Cut-Resistant Work Gloves have fallen below the stock target.",
      href: `/supplier/products/${ids.products.gloves}`,
      readAt: null,
      createdAt: at("2026-09-13T15:31:00.000Z"),
    },
    {
      id: ids.notifications.newOrder,
      userId: ids.users.harborSupplier,
      type: NotificationType.ORDER_CREATED,
      title: "New order SF-1003-A",
      message: "A new order is waiting for confirmation.",
      href: `/supplier/orders/${ids.orders.pendingHarbor}`,
      readAt: null,
      createdAt: at("2026-09-12T14:36:00.000Z"),
    },
    {
      id: ids.notifications.orderShipped,
      userId: ids.users.customer,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Order SF-1002-B shipped",
      message: "Harbor Office Co. has shipped your order.",
      href: `/orders/${ids.orders.shippedHarbor}`,
      readAt: null,
      createdAt: at("2026-09-09T13:01:00.000Z"),
    },
    {
      id: ids.notifications.orderDelivered,
      userId: ids.users.customer,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Order SF-1001-A delivered",
      message: "Your Northstar Tools order was marked as delivered.",
      href: `/orders/${ids.orders.deliveredNorthstar}`,
      readAt: at("2026-09-05T15:00:00.000Z"),
      createdAt: at("2026-09-05T14:11:00.000Z"),
    },
  ] satisfies Prisma.NotificationUncheckedCreateInput[];

  await database.$transaction(
    async (transaction) => {
      for (const { id, ...data } of users) {
        await transaction.user.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of categories) {
        await transaction.category.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of products) {
        await transaction.product.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of checkoutGroups) {
        await transaction.checkoutGroup.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of orders) {
        await transaction.order.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of orderItems) {
        await transaction.orderItem.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }

      for (const { id, ...data } of notifications) {
        await transaction.notification.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        });
      }
    },
    { timeout: 20_000 },
  );

  const [
    userCount,
    categoryCount,
    productCount,
    orderCount,
    notificationCount,
  ] = await Promise.all([
    database.user.count({ where: { id: { in: Object.values(ids.users) } } }),
    database.category.count({
      where: { id: { in: Object.values(ids.categories) } },
    }),
    database.product.count({
      where: { id: { in: Object.values(ids.products) } },
    }),
    database.order.count({ where: { id: { in: Object.values(ids.orders) } } }),
    database.notification.count({
      where: { id: { in: Object.values(ids.notifications) } },
    }),
  ]);

  console.log("StockFlow assessment data is ready.");
  console.table({
    users: userCount,
    categories: categoryCount,
    products: productCount,
    orders: orderCount,
    notifications: notificationCount,
  });
}

try {
  await main();
} catch (error) {
  console.error("Unable to seed StockFlow assessment data.", error);
  process.exitCode = 1;
} finally {
  await database.$disconnect();
}
