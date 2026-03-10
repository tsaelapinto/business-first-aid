import { test, expect } from "@playwright/test";

test("Hebrew homepage contains NO harmful/unprofessional phrases", async ({ page }) => {
  await page.goto("https://businessaid.tsaela.com");

  // Switch to Hebrew
  const switcher = page.locator('[data-testid="lang-switcher"]');
  if (await switcher.textContent() === "עב") {
    await switcher.click();
  }
  
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  const harmfulPhrases = [
    "העסק שלך סובל",
    "בואו נטפל בזה — מהר",
    "מה בדיוק פוגע בעסק שלך",
    "תמיכה בעסקים ישראליים בשעת משבר"
  ];

  const bodyText = await page.innerText("body");
  
  for (const phrase of harmfulPhrases) {
    if (bodyText.includes(phrase)) {
      throw new Error(`FOUND FORBIDDEN PHRASE: "${phrase}"`);
    }
  }
  
  console.log("✅ All forbidden phrases are gone from Hebrew UI.");
});
