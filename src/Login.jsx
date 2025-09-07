// src/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api, { setAuthToken } from "./api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const { register, handleSubmit } = useForm();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handle = async (data) => {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await api.post("/signin", {
        email: data.email,
        password: data.password,
      });
      const token = res.data?.token;
      if (token) setAuthToken(token);

      // ユーザ情報取得
      let user = null;
      try {
        const userRes = await api.get("/users");
        user = userRes.data;
      } catch (err) {
        console.error("fetch user after signin failed", err);
      }

      if (onLogin) onLogin(user);
      navigate("/reviews");
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.ErrorMessageJP ||
          err.response?.data?.message ||
          "ログインに失敗しました"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, padding: 12 }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit(handle)}>
        <div>
          <input
            {...register("email", { required: true })}
            placeholder="メールアドレス"
          />
        </div>
        <div>
          <input
            {...register("password", { required: true })}
            placeholder="パスワード"
            type="password"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={submitting}>
            {submitting ? "処理中…" : "ログイン"}
          </button>
        </div>
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      </form>
      <p>
        アカウントがない方は <Link to="/signup">新規登録</Link>
      </p>
    </div>
  );
}
