// tests/login.spec.js
import { test, expect } from "@playwright/test";

test("トップページに Hello Vite + React が表示される", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.getByText("Hello Vite + React")).toBeVisible();
});
