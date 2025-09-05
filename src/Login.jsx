import React, { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("メールアドレスが不正です");
    } else if (password.length < 6) {
      setError("パスワードは6文字以上必要です");
    } else {
      setError("");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">ログイン</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
