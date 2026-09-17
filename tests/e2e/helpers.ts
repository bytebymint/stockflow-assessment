import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

import { E2E_PASSWORD } from "./constants";

export async function signIn(page: Page, email: string, expectedPath: RegExp) {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(expectedPath);
}

export async function registerAccount({
  email,
  name,
  page,
  role,
}: {
  email: string;
  name: string;
  page: Page;
  role: "Customer" | "Supplier";
}) {
  await page.goto(`/register?role=${role.toLowerCase()}`);
  await expect(
    page.getByRole("radio", { name: new RegExp(role) }),
  ).toBeChecked();
  await page
    .getByLabel(role === "Supplier" ? "Business or contact name" : "Full name")
    .fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByLabel("Confirm password").fill(E2E_PASSWORD);
  await page
    .getByRole("button", {
      name: `Create ${role.toLowerCase()} account`,
    })
    .click();
}

export async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.flatMap((node) => node.target),
  }));

  expect(violations).toEqual([]);
}
