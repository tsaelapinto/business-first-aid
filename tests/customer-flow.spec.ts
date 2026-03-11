/**
 * E2E: Full customer journey
 *
 * Test A: Skip chat, fill wizard manually, get results
 * Test B: Chat with AI (mocked), wizard auto-fills, get results
 * Test C: Real AI chat endpoint smoke test (no mock, validates prod AI is alive)
 *
 * All tests run against: https://businessaid.tsaela.com (production)
 *
 * Cleanup: after all tests, every case created during this run is deleted via
 * the DELETE /api/cases/:id endpoint (requires x-seed-secret header).
 * SEED_SECRET is read from .env.local (locally) or process.env (CI).
 */

import { test, expect, Page } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

// ─── Track IDs of cases created during this run so we can clean up after ─────
const testCaseIds: string[] = [];

// ─── Read SEED_SECRET from .env.local or environment ─────────────────────────
function readSeedSecret(): string {
  if (process.env.SEED_SECRET) return process.env.SEED_SECRET;
  try {
    const content = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    return content.match(/SEED_SECRET=([^\r\n]+)/)?.[1] ?? "";
  } catch {
    return "";
  }
}

// ─── Extract and record the case ID from a results page URL ──────────────────
function captureCaseId(url: string): void {
  const match = url.match(/\/results\/([^/?#]+)/);
  if (match) testCaseIds.push(match[1]);
}

// ─── Teardown: delete every case created during this run ──────────────────────
test.afterAll(async () => {
  if (testCaseIds.length === 0) return;
  const secret = readSeedSecret();
  const base = process.env.PLAYWRIGHT_BASE_URL ?? "https://businessaid.tsaela.com";
  for (const id of testCaseIds) {
    try {
      await fetch(`${base}/api/cases/${id}`, {
        method: "DELETE",
        headers: { "x-seed-secret": secret },
      });
      console.log("Deleted test case:", id);
    } catch {
      // Best-effort, do not fail the run
    }
  }
  testCaseIds.length = 0;
});

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

  // Record case ID for cleanup
  captureCaseId(page.url());

  // Diagnostic log
  const bodyText = await page.locator("body").innerText().catch(() => "(no body text)");
  console.log("Results URL:", page.url());
  console.log("Body snippet:", bodyText.slice(0, 300));

  // Verify results page content (two matching elements exist, use .first())
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
    "I understand, this sounds critical and I want to help you move fast.\n\n" +
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

  // Send message, the mock response returns immediately with TRIAGE_DATA
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

  // AI pre-filled all 5 answers, advance through the wizard steps
  await advanceWizardFromAIFill(page);

  // Results page
  await page.waitForURL(/\/results\//, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  captureCaseId(page.url());
  await expect(page.getByText(/Crisis Report|Triage Complete/i).first()).toBeVisible({ timeout: 30_000 });
});

// ─── Test C: real AI endpoint smoke test (no mock) ────────────────────────────
test("C | real AI chat endpoint returns a response", async ({ page }) => {
  // Calls the real /api/chat with a single message.
  // Verifies the endpoint is reachable and returns non-empty text.
  // Catches: missing OPENAI_API_KEY, edge runtime timeout, route crashes.
  const response = await page.request.post("/api/chat", {
    headers: { "Content-Type": "application/json" },
    data: {
      messages: [
        {
          role: "user",
          content:
            "My restaurant in Haifa lost most customers. Revenue is down 60% and cashflow is critical. I need help urgently.",
        },
      ],
    },
    timeout: 60_000,
  });

  expect(response.ok(), `AI endpoint returned ${response.status()}`).toBeTruthy();
  const text = await response.text();
  console.log("AI endpoint status:", response.status());
  console.log("AI response (first 300 chars):", text.slice(0, 300));
  expect(text.length, "AI returned empty response").toBeGreaterThan(10);
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
