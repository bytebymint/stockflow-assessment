import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { demoAccounts } from "./constants";
import {
  expectNoAccessibilityViolations,
  registerAccount,
  signIn,
} from "./helpers";

async function createOrderFromSingleSearchResult(page: Page, query: string) {
  await page.goto(`/products?q=${encodeURIComponent(query)}`);
  await expect(
    page.getByRole("main").getByText("1 product found"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Review products by supplier" }),
  ).toBeVisible();

  const checkoutButton = page.getByRole("button", { name: "Create orders" });
  await expect(checkoutButton).toBeEnabled();
  await checkoutButton.click();
  await expect(
    page.getByRole("heading", {
      name: "Your orders are ready for review.",
    }),
  ).toBeVisible();

  const orderNumber = (
    await page.getByText(/^SFO-/).first().textContent()
  )?.trim();
  expect(orderNumber).toMatch(/^SFO-/);
  return orderNumber as string;
}

async function openOrder(page: Page, listPath: string, orderNumber?: string) {
  await page.goto(listPath);
  const orderCard = orderNumber
    ? page
        .locator("article")
        .filter({
          has: page.getByRole("heading", { name: orderNumber, exact: true }),
        })
        .first()
    : page.locator("article").first();
  await expect(orderCard).toBeVisible();
  await orderCard.getByRole("link", { name: "View order" }).click();
}

async function closeContext(context: BrowserContext) {
  await context.close();
}

test.describe("public storefront", () => {
  test("a visitor can search, filter, and inspect a product", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(
      page.getByRole("heading", {
        name: "Find the right stock, without the guesswork.",
      }),
    ).toBeVisible();

    await page.getByLabel("Search the catalog").fill("drill");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/q=drill/);

    await page.getByLabel("Category").selectOption({ label: "Tools" });
    await page.getByLabel("Availability").selectOption("in-stock");
    await page.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/category=tools/);
    await expect(page).toHaveURL(/availability=in-stock/);
    await expect(
      page.getByRole("main").getByText("1 product found"),
    ).toBeVisible();
    await page.getByRole("link", { name: "View 18V Cordless Drill" }).click();
    await expect(
      page.getByRole("heading", { name: "18V Cordless Drill" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Sign in to order" }),
    ).toBeVisible();
  });
});

test.describe("customer journey", () => {
  test("a customer can register, check out, review, and cancel an order", async ({
    page,
  }) => {
    const uniqueId = `${Date.now()}-${test.info().parallelIndex}`;
    await registerAccount({
      page,
      role: "Customer",
      name: "E2E Customer",
      email: `customer-${uniqueId}@stockflow.test`,
    });
    await expect(page).toHaveURL(/\/account$/);

    await createOrderFromSingleSearchResult(page, "18V Cordless Drill");
    await page.getByRole("link", { name: "View your orders" }).click();
    await expect(
      page.getByRole("heading", { name: "Track every supplier order" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "View order" }).click();

    await page.getByRole("button", { name: "Cancel order" }).click();
    await page
      .getByRole("button", { name: "Cancel and restore stock" })
      .click();
    await expect(
      page.getByText("No further actions are available for a cancelled order."),
    ).toBeVisible();
  });
});

test.describe("supplier and admin workflow", () => {
  test("an admin approves a supplier who creates and fulfils a product order", async ({
    browser,
  }) => {
    const uniqueId = `${Date.now()}-${test.info().parallelIndex}`;
    const supplierEmail = `supplier-${uniqueId}@stockflow.test`;
    const supplierName = `E2E Supply ${uniqueId}`;
    const productName = `E2E Packing Tape ${uniqueId}`;

    const supplierContext = await browser.newContext();
    const supplierPage = await supplierContext.newPage();
    await registerAccount({
      page: supplierPage,
      role: "Supplier",
      name: supplierName,
      email: supplierEmail,
    });
    await expect(supplierPage).toHaveURL(/\/supplier\/status$/);
    await expect(
      supplierPage.getByRole("heading", { name: "Review in progress" }),
    ).toBeVisible();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await signIn(adminPage, demoAccounts.admin, /\/admin$/);
    await adminPage.goto(
      `/admin/suppliers?status=PENDING&q=${encodeURIComponent(supplierEmail)}`,
    );
    await expect(
      adminPage.getByRole("table").getByText(supplierEmail, { exact: true }),
    ).toBeVisible();
    await adminPage
      .getByRole("button", { name: "Approve", exact: true })
      .click();
    await adminPage.getByRole("button", { name: "Confirm approve" }).click();
    await expect(
      adminPage.getByRole("heading", {
        name: "No suppliers match this search",
      }),
    ).toBeVisible();

    await supplierPage.goto("/supplier/products/new");
    await expect(
      supplierPage.getByRole("heading", { name: "Create product" }),
    ).toBeVisible();
    await supplierPage
      .getByLabel("Product name")
      .filter({ visible: true })
      .fill(productName);
    await supplierPage
      .getByLabel("Category")
      .filter({ visible: true })
      .selectOption({ label: "Tools" });
    await supplierPage
      .getByLabel("Description", { exact: true })
      .filter({ visible: true })
      .fill("Durable packing tape created by the browser test journey.");
    await supplierPage
      .getByLabel("Price (GBP)")
      .filter({ visible: true })
      .fill("19.95");
    await supplierPage
      .getByLabel("Stock quantity")
      .filter({ visible: true })
      .fill("5");
    await supplierPage
      .getByLabel("Low-stock threshold")
      .filter({ visible: true })
      .fill("1");
    await supplierPage
      .getByRole("button", { name: "Create product" })
      .filter({ visible: true })
      .click();
    await expect(supplierPage).toHaveURL(
      /\/supplier\/products\?notice=created/,
    );
    await expect(
      supplierPage.getByRole("table").getByText(productName, { exact: true }),
    ).toBeVisible();

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await signIn(customerPage, demoAccounts.customer, /\/account$/);
    const orderNumber = await createOrderFromSingleSearchResult(
      customerPage,
      productName,
    );

    await openOrder(supplierPage, "/supplier/orders", orderNumber);
    await supplierPage.getByRole("button", { name: "Confirm order" }).click();
    await expect(
      supplierPage.getByRole("button", { name: "Mark as shipped" }),
    ).toBeVisible();
    await supplierPage.getByRole("button", { name: "Mark as shipped" }).click();
    await expect(
      supplierPage.getByRole("button", { name: "Mark as delivered" }),
    ).toBeVisible();
    await supplierPage
      .getByRole("button", { name: "Mark as delivered" })
      .click();
    await expect(
      supplierPage.getByText(
        "No further actions are available for a delivered order.",
      ),
    ).toBeVisible();

    await Promise.all([
      closeContext(customerContext),
      closeContext(adminContext),
      closeContext(supplierContext),
    ]);
  });

  test("an admin can review dashboard aggregates and export orders", async ({
    page,
  }) => {
    await signIn(page, demoAccounts.admin, /\/admin$/);
    await expect(
      page.getByRole("heading", {
        name: "Operational overview for Avery Morgan",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Orders per day", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByText("Delivered revenue by supplier", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("img")).toHaveCount(2);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export orders" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^stockflow-platform-orders-.*\.csv$/,
    );
    await expect(page.getByRole("status")).toContainText(
      "Order export downloaded",
    );
  });
});

test.describe("core accessibility", () => {
  test("public and authenticated core pages have no detectable WCAG A/AA violations", async ({
    page,
  }) => {
    for (const path of ["/", "/products", "/sign-in"]) {
      await page.goto(path);
      await expectNoAccessibilityViolations(page);
    }

    await signIn(page, demoAccounts.admin, /\/admin$/);
    await expectNoAccessibilityViolations(page);
  });
});
