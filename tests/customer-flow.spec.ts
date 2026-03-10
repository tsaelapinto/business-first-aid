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
  
  // Results page has both a <p>Triage Complete</p> label and an <h1>... Crisis Report</h1>.
  // Use .first() to avoid strict-mode violation when both match the regex.
  await expect(page.getByText(/Crisis Report|Triage Complete/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Severity/i).first()).toBeVisible();
  await expect(page.getByText(/Immediate Actions/i).first()).toBeVisible();
});

// ─── Test B: chat with AI (mocked) → wizard auto-fills → get results ─────────
test("B | chat with AI, wizard auto-fills, view results", async ({ page }) => {
  // Mock the /api/chat route so the test is deterministic and fast.
  // The client reads a ReadableStream chunk-by-chunk; fulfilling with a plain
  // text body delivers all chunks at once, which the accumulator handles fine.
  const MOCK_TRIAGE_JSON = JSON.stringify({
    main_problem: "cashflow",
    severity: "critical",
    changes: ["revenue_drop", "tourism_disappeared"],
    help_needed: "finance_help",
    urgency: "today",
    stress_level: 5,
    summary:
      "A Tel Aviv bakery lost 70% of customers since the war, facing critical cashflow pressure and may not survive the month without urgent financial help.",
  });
  const MOCK_BODY =
    "I understand — this sounds critical and I want to help you move fast.\n\n" +
    "##TRIAGE_DATA##\n" +
    MOCK_TRIAGE_JSON +
    "\n##END##";

  await page.route("**/api/chat", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: MOCK_BODY,
    });
  });

  await page.goto("/triage");
  await page.waitForLoadState("networkidle");

  // Chat input must be visible
  await expect(
    page.getByPlaceholder("Type here or click the mic to speak")
  ).toBeVisible({ timeout: 15_000 });

  // Send message — the mock response returns immediately with TRIAGE_DATA
  await page
    .getByPlaceholder("Type here or click the mic to speak")
    .fill(
      "My bakery in Tel Aviv has lost 70% of customers since the war started. " +
        "Revenue dropped sharply and cashflow is critical, we may not survive next month. " +
        "I need financial help today, this is urgent."
    );
  await page.getByRole("button", { name: "Send" }).click();

  // Phase switches "chat" → "triage" after 800 ms (see AgentChat setTimeout).
  // Wizard renders at step 1 (pre-filled), so "Step 1 of N" appears.
  await expect(page.getByText(/Step \d+ of \d+/).first()).toBeVisible({
    timeout: 10_000,
  });

  // AI pre-filled all 5 answers — advance through the wizard steps
  await advanceWizardFromAIFill(page);

  // Results page
  await page.waitForURL(/\/results\//, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/Crisis Report|Triage Complete/i).first()).toBeVisible({ timeout: 30_000 });
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
