import { expect, test } from "@playwright/test";

test.describe("Receipt Dashboard", () => {
  test("loads the homepage and renders the app header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Receiptly")).toBeVisible();
    await expect(page.getByText("Scan a receipt, get the data - no typing.")).toBeVisible();
  });

  test("shows Scan and Browse action buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /scan/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /browse/i })).toBeVisible();
  });

  test("displays empty state when no receipts exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No receipts yet")).toBeVisible();
  });

  test("has correct page metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Receiptly/);
  });

  test("renders the receipts count and total section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Captured receipts")).toBeVisible();
    await expect(page.getByText("total across all scans")).toBeVisible();
  });

  test("renders the History section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /history/i })).toBeVisible();
  });
});

test.describe("API /api/receipts", () => {
  test("GET returns a JSON array", async ({ request }) => {
    const response = await request.get("/api/receipts");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("POST rejects an empty body with 400", async ({ request }) => {
    const response = await request.post("/api/receipts", {
      data: { base64: "" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBeTruthy();
  });

  test("DELETE rejects a missing id with 400", async ({ request }) => {
    const response = await request.delete("/api/receipts");
    expect(response.status()).toBe(400);
  });
});
