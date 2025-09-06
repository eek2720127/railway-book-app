// src/__tests__/Login.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Login } from "../Login";

describe("Login コンポーネント（単体テスト）", () => {
  it("メールアドレス input、パスワード input、ログインボタンがレンダリングされる", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" })
    ).toBeInTheDocument();
  });

  it("不正なメールでエラーを表示する", async () => {
    render(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "invalid-email"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "メールアドレスが不正です"
    );
  });

  it("短いパスワードでエラーを表示する", async () => {
    render(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "パスワードは6文字以上必要です"
    );
  });

  it("正しい入力ならエラーが表示されない", async () => {
    render(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
