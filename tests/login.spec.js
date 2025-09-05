import { test, expect } from "@playwright/test";

const URL = "http://localhost:5173/";

test("不正なメールアドレスでエラーが出る", async ({ page }) => {
  await page.goto(URL);
  await page.getByPlaceholder("メールアドレス").fill("invalid-email");
  await page.getByPlaceholder("パスワード").fill("123456");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByRole("alert")).toHaveText("メールアドレスが不正です");
});

test("短いパスワードでエラーが出る", async ({ page }) => {
  await page.goto(URL);
  await page.getByPlaceholder("メールアドレス").fill("test@example.com");
  await page.getByPlaceholder("パスワード").fill("123");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "パスワードは6文字以上必要です"
  );
});

test("正しい入力ならエラーが表示されない", async ({ page }) => {
  await page.goto(URL);
  await page.getByPlaceholder("メールアドレス").fill("test@example.com");
  await page.getByPlaceholder("パスワード").fill("123456");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
