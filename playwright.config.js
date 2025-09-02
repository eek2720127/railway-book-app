// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests", // テストを置いているディレクトリ
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // baseURL を設定するとテスト内で page.goto('/') のように書けます
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn start", // Vite を yarn start で起動する想定
    port: 5173, // Vite のデフォルトポート
    reuseExistingServer: true, // すでに起動していれば再利用（手動で起動する場合に便利）
    timeout: 120_000, // サーバ起動待ちタイムアウト（ms）
  },
});
