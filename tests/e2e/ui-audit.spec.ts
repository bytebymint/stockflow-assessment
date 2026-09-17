import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { demoAccounts } from "./constants";
import { expectNoAccessibilityViolations, signIn } from "./helpers";

const viewports = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 900 },
  { name: "desktop", width: 1440, height: 1000 },
] as const;

async function expectPageFitsViewport(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole("main")).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(
    overflow,
    `${path} must not overflow the viewport`,
  ).toBeLessThanOrEqual(1);
}

async function capture(
  page: Page,
  testInfo: TestInfo,
  viewportName: string,
  pageName: string,
) {
  await page.screenshot({
    path: testInfo.outputPath(`${viewportName}-${pageName}.png`),
    fullPage: true,
  });
}

for (const viewport of viewports) {
  test.describe(`${viewport.width}px responsive audit`, () => {
    test.use({ viewport });

    test("public, customer, supplier, and admin screens fit without page overflow", async ({
      browser,
      page,
    }, testInfo) => {
      for (const path of [
        "/",
        "/products?q=drill&category=tools&availability=in-stock",
        "/sign-in",
      ]) {
        await expectPageFitsViewport(page, path);
      }
      await page.goto("/");
      await capture(page, testInfo, viewport.name, "public-home");
      await page.goto("/products?q=drill&category=tools&availability=in-stock");
      await capture(page, testInfo, viewport.name, "catalog");

      const customerContext = await browser.newContext({ viewport });
      const customerPage = await customerContext.newPage();
      await signIn(customerPage, demoAccounts.customer, /\/account$/);
      for (const path of ["/account", "/orders", "/cart", "/notifications"]) {
        await expectPageFitsViewport(customerPage, path);
      }
      await customerPage.goto("/cart");
      await capture(customerPage, testInfo, viewport.name, "customer-cart");

      const supplierContext = await browser.newContext({ viewport });
      const supplierPage = await supplierContext.newPage();
      await signIn(supplierPage, demoAccounts.supplier, /\/supplier$/);
      for (const path of [
        "/supplier",
        "/supplier/products",
        "/supplier/orders",
        "/notifications",
      ]) {
        await expectPageFitsViewport(supplierPage, path);
      }
      await supplierPage.goto("/supplier/products");
      await capture(supplierPage, testInfo, viewport.name, "supplier-products");

      const adminContext = await browser.newContext({ viewport });
      const adminPage = await adminContext.newPage();
      await signIn(adminPage, demoAccounts.admin, /\/admin$/);
      for (const path of [
        "/admin",
        "/admin/categories",
        "/admin/suppliers",
        "/admin/orders",
        "/notifications",
      ]) {
        await expectPageFitsViewport(adminPage, path);
      }
      await adminPage.goto("/admin");
      await capture(adminPage, testInfo, viewport.name, "admin-dashboard");

      await Promise.all([
        adminContext.close(),
        supplierContext.close(),
        customerContext.close(),
      ]);
    });
  });
}

test("mobile keyboard focus, dialog restoration, and accessibility remain intact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeInViewport();

  const navigationTrigger = page.getByRole("button", {
    name: "Open navigation",
  });
  await navigationTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(navigationTrigger).toBeFocused();

  for (const path of [
    "/",
    "/products?q=drill&category=tools&availability=in-stock",
    "/sign-in",
  ]) {
    await page.goto(path);
    await expectNoAccessibilityViolations(page);
  }
});

test("reduced-motion preference suppresses decorative transitions", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/");

  const timing = await page
    .getByRole("link", { name: "Browse products", exact: true })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationDuration: style.animationDuration,
        transitionDuration: style.transitionDuration,
      };
    });

  expect(Number.parseFloat(timing.animationDuration)).toBeLessThanOrEqual(
    0.001,
  );
  expect(Number.parseFloat(timing.transitionDuration)).toBeLessThanOrEqual(
    0.001,
  );
  await context.close();
});

test("catalog touch targets, long text, and enlarged text remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const longQuery = "cordless-industrial-drill-with-an-extra-long-product-name";
  await page.goto(
    `/products?q=${longQuery}&category=tools&availability=in-stock`,
  );

  for (const control of [
    page.getByRole("link", { name: /^Remove filter:/ }).first(),
    page.getByRole("link", { name: "Clear all" }),
  ]) {
    const box = await control.boundingBox();
    expect(box, "active-filter controls must be measurable").not.toBeNull();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expect(
    page.getByText("No products match these filters", { exact: true }),
  ).toBeVisible();

  const layout = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - viewportWidth;
    const offenders = Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}.${element.className}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          text: element.textContent?.trim().slice(0, 60),
        };
      })
      .filter(({ left, right }) => left < -1 || right > viewportWidth + 1)
      .slice(0, 8);

    return { offenders, overflow };
  });
  expect(
    layout.overflow,
    `enlarged catalog text must not overflow: ${JSON.stringify(layout.offenders)}`,
  ).toBeLessThanOrEqual(1);
});
