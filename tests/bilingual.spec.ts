import { test, expect } from "@playwright/test";

// Helpers
async function switchToHebrew(page: import("@playwright/test").Page) {
  await page.click('[data-testid="lang-switcher"]');
  // Wait for Hebrew text to appear (RTL switch)
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl", {
    timeout: 5000,
  });
}

async function switchToEnglish(page: import("@playwright/test").Page) {
  await page.click('[data-testid="lang-switcher"]');
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr", {
    timeout: 5000,
  });
}

// ─── Homepage ────────────────────────────────────────────────────────────────

test.describe("Homepage: bilingual", () => {
  test("shows English content by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="start-triage-link"]')).toContainText(
      "Start Free Triage"
    );
    await expect(page.locator('[data-testid="how-it-works-heading"]')).toContainText(
      "How it works"
    );
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("switches to Hebrew and shows RTL content", async ({ page }) => {
    await page.goto("/");
    await switchToHebrew(page);

    await expect(page.locator('[data-testid="start-triage-link"]')).toContainText(
      "התחל אבחון חינם"
    );
    await expect(page.locator('[data-testid="how-it-works-heading"]')).toContainText(
      "איך זה עובד"
    );
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "he");
  });

  test("language switcher button shows target language label", async ({
    page,
  }) => {
    await page.goto("/");
    // When in English, button shows "עב" to switch to Hebrew
    await expect(page.locator('[data-testid="lang-switcher"]')).toContainText(
      "עב"
    );
    await switchToHebrew(page);
    // When in Hebrew, button shows "EN" to switch to English
    await expect(page.locator('[data-testid="lang-switcher"]')).toContainText(
      "EN"
    );
  });

  test("language persists on navigation (localStorage)", async ({ page }) => {
    await page.goto("/");
    await switchToHebrew(page);

    // Navigate to triage and back
    await page.goto("/triage");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.goto("/");
    await expect(page.locator('[data-testid="start-triage-link"]')).toContainText(
      "התחל אבחון חינם"
    );
  });
});

// ─── Navbar ──────────────────────────────────────────────────────────────────

test.describe("Navbar: bilingual", () => {
  test("shows English nav links by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toContainText("Get Help");
    await expect(page.locator("nav")).toContainText("Business First Aid");
  });

  test("shows Hebrew nav links after language switch", async ({ page }) => {
    await page.goto("/");
    await switchToHebrew(page);
    await expect(page.locator("nav")).toContainText("קבל עזרה");
    await expect(page.locator("nav")).toContainText("עזרה ראשונה לעסקים");
  });
});

// ─── Triage Wizard ───────────────────────────────────────────────────────────

test.describe("Triage Wizard: bilingual", () => {
  test("welcome screen shows English by default", async ({ page }) => {
    await page.goto("/triage");
    await expect(page.locator('[data-testid="wizard-title"]')).toContainText(
      "Business First Aid"
    );
    await expect(page.locator('[data-testid="start-triage-btn"]')).toContainText(
      "Start Triage"
    );
  });

  test("welcome screen shows Hebrew after language switch", async ({ page }) => {
    await page.goto("/triage");
    await switchToHebrew(page);
    await expect(page.locator('[data-testid="wizard-title"]')).toContainText(
      "עזרה ראשונה לעסקים"
    );
    await expect(page.locator('[data-testid="start-triage-btn"]')).toContainText(
      "התחל אבחון"
    );
  });

  test("Q1 shows Hebrew question text after language switch", async ({
    page,
  }) => {
    await page.goto("/triage");
    await switchToHebrew(page);
    await page.click('[data-testid="start-triage-btn"]');

    // First question should be in Hebrew
    await expect(page.locator("h2")).toContainText(
      "מה הבעיה העיקרית שפוגעת בעסק שלך"
    );
  });

  test("Q1 shows English question text in default language", async ({
    page,
  }) => {
    await page.goto("/triage");
    await page.click('[data-testid="start-triage-btn"]');
    await expect(page.locator("h2")).toContainText(
      "What is the main problem hurting your business"
    );
  });

  test("switches language mid-wizard and updates question text", async ({
    page,
  }) => {
    await page.goto("/triage");
    // Start in English
    await page.click('[data-testid="start-triage-btn"]');
    await expect(page.locator("h2")).toContainText("What is the main problem");

    // Switch to Hebrew mid-wizard
    await switchToHebrew(page);
    await expect(page.locator("h2")).toContainText("מה הבעיה העיקרית");
  });
});

// ─── RTL layout ──────────────────────────────────────────────────────────────

test.describe("RTL layout", () => {
  test("html dir=rtl when Hebrew is active", async ({ page }) => {
    await page.goto("/");
    await switchToHebrew(page);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("html dir=ltr when English is active", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("switching back to English restores LTR", async ({ page }) => {
    await page.goto("/");
    await switchToHebrew(page);
    await switchToEnglish(page);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator('[data-testid="start-triage-link"]')).toContainText(
      "Start Free Triage"
    );
  });
});
