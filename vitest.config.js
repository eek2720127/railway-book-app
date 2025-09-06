// vitest.config.js (プロジェクトルート)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // React の DOM テストを有効にする
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",

    // vitest に実行させるファイルを限定（src 配下の .test/.spec のみ）
    include: ["src/**/*.test.{js,jsx,ts,tsx}", "src/**/*.spec.{js,jsx,ts,tsx}"],

    // Playwright や他の E2E テストフォルダは必ず除外する
    exclude: ["tests/**", "tests-examples/**", "playwright-report/**"],
  },
});
