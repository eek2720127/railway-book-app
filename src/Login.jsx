// src/Login.jsx
import React from "react";
import { useForm } from "react-hook-form";
import api, { setAuthToken } from "./api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = React.useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await api.post("/signin", {
        email: data.email,
        password: data.password,
      });
      // API が token を返す仕様
      const token = res.data?.token;
      if (token) {
        setAuthToken(token); // axios に Authorization をセット & localStorage に保存
      }

      // token を元にユーザ情報を取得する（必須）
      try {
        const userRes = await api.get("/users"); // GET /users
        const user = userRes.data;
        if (onLogin) onLogin(user); // App の setUser を呼ぶ
      } catch (err) {
        console.error("failed to fetch user after signin", err);
        // ここでトークンが無効なら削除等の処理を行うことも検討
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.ErrorMessageJP || "ログインに失敗しました"
      );
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>メールアドレス</label>
          <input
            {...register("email", { required: "メールアドレスは必須です" })}
          />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label>パスワード</label>
          <input
            type="password"
            {...register("password", { required: "パスワードは必須です" })}
          />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">ログイン</button>
        </div>
        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      </form>

      <p>
        アカウントをお持ちでないですか？ <Link to="/signup">新規登録</Link>
      </p>
    </div>
  );
}
