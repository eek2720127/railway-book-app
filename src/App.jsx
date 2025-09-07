// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
// import ReviewsList from "./components/ReviewsList"; // <- 不要なのでコメントアウト/削除
import ReviewsPage from "./pages/ReviewsPage";
import api, { setAuthToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
          <Link to="/signup" style={{ marginRight: 8 }}>
            Signup
          </Link>
          <Link to="/login" style={{ marginRight: 8 }}>
            Login
          </Link>
          <Link to="/reviews" style={{ marginLeft: 8 }}>
            Reviews
          </Link>
        </div>

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
        <Route path="/reviews" element={<ReviewsPage />} />{" "}
        {/* ここだけにする */}
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
