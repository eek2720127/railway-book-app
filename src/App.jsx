// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import api, { setAuthToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 起動時に token があればユーザ情報取得して state にセット
  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setAuthToken(token); // api に Authorization をセット
        const res = await api.get("/users"); // GET /users でユーザ名等を取得
        setUser(res.data || null);
      } catch (err) {
        console.error("fetch user failed", err);
        // トークンが無効なら削除しておく
        setAuthToken(null);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    navigate("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <nav
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <Link to="/" style={{ marginRight: 8 }}>
            Home
          </Link>
          <Link to="/signup" style={{ marginRight: 8 }}>
            Signup
          </Link>
          <Link to="/login">Login</Link>
        </div>

        {/* ユーザがいればアイコンと名前、ログアウトボタンを表示 */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user.iconUrl ? (
              <img
                src={user.iconUrl}
                alt="avatar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
                onError={(e) => {
                  // 取得に失敗したら画像を消す（任意）
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <div style={{ fontSize: 14, color: "#333" }}>{user.name}</div>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </div>
        ) : null}
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/signup"
          element={<Signup onSignup={(u) => setUser(u)} />}
        />
        <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
      </Routes>
    </div>
  );
}

function Home({ user }) {
  return (
    <div>
      <h1>Welcome{user && user.name ? `, ${user.name}` : ""}</h1>

      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user.iconUrl && (
            <img
              src={user.iconUrl}
              alt="avatar"
              style={{
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 999,
                border: "1px solid #eee",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <p style={{ margin: 0 }}>You're logged in.</p>
            {user.name && (
              <p style={{ margin: "4px 0 0", color: "#666" }}>{user.name}</p>
            )}
          </div>
        </div>
      ) : (
        <p>Please sign up or log in to manage reviews.</p>
      )}
    </div>
  );
}
