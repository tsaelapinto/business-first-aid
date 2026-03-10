/**
 * E2E: Full customer journey
 *
 * Test A: Skip chat → fill wizard manually → get results
 * Test B: Chat with AI → wizard auto-fills → get results
 *
 * Both tests run against: https://businessaid.tsaela.com (production)
 */

import { test, expect, Page } from "@playwright/test";

// ─── helper: complete the 5-question wizard + identity step ──────────────────
async function completeWizard(page: Page) {
  // Step 1 – main problem (single select)
  await page.getByText("Cashflow is critical").click();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 2 – severity (single select)
  await page.getByText("Severe –").click();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 3 – changes (multi-select, pick one at minimum)
  await page.getByText("Revenue dropped sharply").click();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 4 – help needed (single select)
  await page.getByText("Finance / cashflow help").click();
  await page.getByRole("button", { name: "Next →" }).click();

  // Step 5 – urgency (single select)
  await page.getByText("Today").click();
  // last question step shows "Continue →"
  await page.getByRole("button", { name: "Continue →" }).click();

  // Identity step – all optional, fill business name so we can verify in backoffice
  await page.getByPlaceholder("e.g. Cohen's Bakery").fill("Playwright Test Bakery");
  await page.getByPlaceholder("Full name").fill("Playwright Tester");
  await page.getByPlaceholder("you@example.com").fill("playwright@test.example");
  await page.getByPlaceholder("e.g. Tourism, Tech, Retail").fill("Technology");
  await page.getByPlaceholder("e.g. Tel Aviv, Haifa").fill("Tel Aviv");

  // Submit
  await page.getByRole("button", { name: /Get My Results/i }).click();
}

// ─── Test A: skip chat, fill wizard, get results ─────────────────────────────
test("A | skip chat, complete form, view results", async ({ page }) => {
  await page.goto("/triage");
  await page.waitForLoadState("networkidle");

  // Chat phase: skip link is visible
  await expect(
    page.getByText("Skip chat, fill the form myself", { exact: false })
  ).toBeVisible({ timeout: 15_000 });

  await page.getByText("Skip chat, fill the form myself", { exact: false }).click();

  // Welcome screen
  await expect(page.getByTestId("wizard-title")).toBeVisible();
  await page.getByTestId("start-triage-btn").click();

  // Step indicator visible
  await expect(page.getByText(/Step \d+ of \d+/)).toBeVisible();

  // Complete all steps
  await completeWizard(page);

  // Results page
  await page.waitForURL(/\/results\//, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  
  // Capture diagnostics if assertion fails
  const currentUrl = page.url();
  const bodyText = await page.locator("body").innerText().catch(() => "(no body text)");
  console.log("Results URL:", currentUrl);
  console.log("Body snippet:", bodyText.slice(0, 500));
  
  await expect(page.getByText(/Crisis Report|Triage Complete/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Severity/i)).toBeVisible();
  await expect(page.getByText(/Immediate Actions/i)).toBeVisible();
});

// ─── Test B: chat with AI → auto-fills wizard → get results ──────────────────
test("B | chat with AI, wizard auto-fills, view results", async ({ page }) => {
  await page.goto("/triage");
  await page.waitForLoadState("networkidle");

  // Chat UI must be visible
  await expect(
    page.getByPlaceholder("Type here or click the mic to speak")
  ).toBeVisible({ timeout: 15_000 });

  // Send a message with enough context for the AI to extract in one turn
  await page
    .getByPlaceholder("Type here or click the mic to speak")
    .fill(
      "My bakery in Tel Aviv has lost 70% of customers since the war started. " +
      "Revenue dropped sharply and cashflow is critical, we may not survive next month. " +
      "I need financial help today, this is urgent."
    );
  await page.getByRole("button", { name: "Send" }).click();

  // Wait for the AI to reply and trigger the extraction (wizard appears)
  // The wizard renders when phase switches from "chat" to "triage"
  // We look for the progress bar ("Step X of Y") which only shows when step >= 1
  await expect(page.getByText(/Step \d+ of \d+/)).toBeVisible({
    timeout: 90_000, // AI can be slow
  });

  // Wizard starts at step 1 with pre-filled answers from AI
  // Some answers may already be selected — advance through remaining steps
  await advanceWizardFromAIFill(page);

  // Results page
  await page.waitForURL(/\/results\//, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/Crisis Report|Triage Complete/i)).toBeVisible({ timeout: 30_000 });
});

// ─── helper: advance wizard when it starts mid-flow from AI pre-fill ─────────
async function advanceWizardFromAIFill(page: Page) {
  // Steps 1-5: for each step, if no answer is selected yet pick the first option,
  // then click the advance button
  for (let i = 0; i < 5; i++) {
    // If no option is selected, pick the first visible option button
    const nextBtn = page.getByRole("button", { name: /Next →|Continue →/ });
    const isNextEnabled = await nextBtn.isEnabled().catch(() => false);
    if (!isNextEnabled) {
      // Pick the first option in the current step
      const firstOption = page.locator(".card button").first();
      await firstOption.click();
    }
    await nextBtn.click();
    // Brief wait for step transition
    await page.waitForTimeout(200);
  }

  // Identity step
  await page.getByPlaceholder("e.g. Cohen's Bakery").fill("AI Test Bakery");
  await page.getByRole("button", { name: /Get My Results/i }).click();
}
