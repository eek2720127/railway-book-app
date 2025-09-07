// src/App.jsx
import RequireAuth from "./components/RequireAuth";
import RedirectIfAuth from "./components/RedirectIfAuth";
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import ReviewsPage from "./pages/ReviewsPage";
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
        setAuthToken(token);
        const res = await api.get("/users");
        setUser(res.data || null);
      } catch (err) {
        console.error("fetch user failed", err);
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

          {/* Reviews は常に表示（RequireAuth 側で保護） */}
          <Link to="/reviews" style={{ marginRight: 8 }}>
            Reviews
          </Link>

          {/* 未ログイン時のみ Signup / Login を表示 */}
          {!user && (
            <>
              <Link to="/signup" style={{ marginRight: 8 }}>
                Signup
              </Link>
              <Link to="/login">Login</Link>
            </>
          )}
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

        {/* /reviews はログイン必須 */}
        <Route
          path="/reviews"
          element={
            <RequireAuth>
              <ReviewsPage />
            </RequireAuth>
          }
        />

        {/* サインアップ/ログインページはログイン済みなら /reviews にリダイレクト */}
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <Signup onSignup={(u) => setUser(u)} />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login onLogin={(u) => setUser(u)} />
            </RedirectIfAuth>
          }
        />
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
