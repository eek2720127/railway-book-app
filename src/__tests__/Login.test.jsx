// src/__tests__/Login.test.jsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../Login";

// API をモックしてネットワーク呼び出しを防ぐ
vi.mock("../api", () => {
  const mock = {
    post: vi.fn(() => Promise.resolve({ data: { token: "fake-token" } })),
    get: vi.fn(() => Promise.resolve({ data: null })),
  };
  return {
    default: mock,
    setAuthToken: vi.fn(),
  };
});

describe("Login コンポーネント（単体テスト）", () => {
  function renderWithRouter(ui) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  }

  it("メールアドレス input、パスワード input、ログインボタンがレンダリングされる", () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" })
    ).toBeInTheDocument();
  });

  it("不正なメールでエラーを表示する", async () => {
    renderWithRouter(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "invalid-email"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    // client-side validation が発火し role="alert" が現れるのを待つ
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "メールアドレスが不正です"
    );
  });

  it("短いパスワードでエラーを表示する", async () => {
    renderWithRouter(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "パスワードは6文字以上必要です"
    );
  });

  it("正しい入力ならエラーが表示されない", async () => {
    renderWithRouter(<Login />);
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "test@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("パスワード"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    // 正常入力なら client-side error は出ない（serverError は mock のため出ない想定）
    expect(await screen.queryByRole("alert")).toBeNull();
  });
});
