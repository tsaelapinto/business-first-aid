import { test, expect } from "@playwright/test";

// All businesses that the seed creates
const SEED_BUSINESSES = [
  "Cafe Rimon, Tel Aviv",
  "Rotem Ceramics Studio",
  "Haifa Flowers & Events",
  "Nir Tech Solutions",
  "Dead Sea Organics",
  "Galil Guesthouse",
];

test.describe("Backoffice: seed data", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/backoffice");
    await page.waitForLoadState("networkidle");
  });

  test("backoffice loads and shows a cases table", async ({ page }) => {
    // Table must be present
    await expect(page.locator("table")).toBeVisible();
  });

  test(`shows at least ${SEED_BUSINESSES.length} cases`, async ({ page }) => {
    // Count data rows (tbody tr), excluding header
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCountGreaterThan(SEED_BUSINESSES.length - 1);
  });

  for (const name of SEED_BUSINESSES) {
    test(`shows seed business: "${name}"`, async ({ page }) => {
      await expect(page.getByText(name, { exact: false })).toBeVisible({
        timeout: 10_000,
      });
    });
  }

  test("no case has blank business name", async ({ page }) => {
    // Every row should have a non-empty first cell
    const nameCells = page.locator("tbody tr td:first-child");
    const count = await nameCells.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const text = (await nameCells.nth(i).innerText()).trim();
      expect(text).not.toBe("");
      expect(text).not.toBe("-");
    }
  });
});
