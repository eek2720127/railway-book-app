// src/Signup.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Compressor from "compressorjs";
import api, { setAuthToken } from "./api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ onSignup }) {
  const { register, handleSubmit, reset } = useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  // コンポーネント破棄時に作成した blob URL を解放
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    // 既存 preview を解放してから新規作成
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(url);
    // デバッグログ（必要なら削除）
    console.log("selected avatar", file);
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // 1) ユーザ作成（JSON）
      const createRes = await api.post("/users", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const token = createRes.data?.token;
      if (token) setAuthToken(token);

      // 2) アイコンが選択されていれば圧縮して /uploads に送る
      if (avatarFile && token) {
        await new Promise((resolve) => {
          new Compressor(avatarFile, {
            quality: 0.7,
            maxWidth: 800,
            maxHeight: 800,
            success(result) {
              const fd = new FormData();
              fd.append("icon", result, result.name || "icon.jpg");
              api
                .post("/uploads", fd, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                .then((res) => {
                  console.log("uploads res", res.data);
                  resolve();
                })
                .catch((err) => {
                  console.error("upload failed", err);
                  resolve();
                });
            },
            error() {
              // 圧縮エラーでも元ファイルを送る
              const fd = new FormData();
              fd.append("icon", avatarFile);
              api
                .post("/uploads", fd, {
                  headers: { "Content-Type": "multipart/form-data" },
                })
                .then(() => resolve())
                .catch(() => resolve());
            },
          });
        });
      }

      // 3) 最新ユーザ情報を取る
      let user = null;
      try {
        const userRes = await api.get("/users");
        user = userRes.data;
      } catch (err) {
        console.error("fetch user after signup failed", err);
      }

      if (onSignup) onSignup(user);
      reset();
      // サインアップ成功後はレビュー一覧へ移動（Station6 要件）
      navigate("/reviews");
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.ErrorMessageJP ||
          err.response?.data?.message ||
          "サインアップに失敗しました"
      );
    }
  };

  return (
    <div style={{ maxWidth: 640, padding: 12 }}>
      <h2>新規登録</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 8 }}>
          <label>名前</label>
          <input {...register("name", { required: true })} placeholder="名前" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>メールアドレス</label>
          <input
            {...register("email", { required: true })}
            placeholder="メールアドレス"
            type="email"
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>パスワード</label>
          <input
            {...register("password", { required: true, minLength: 6 })}
            placeholder="パスワード"
            type="password"
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>アイコン（任意）</label>
          {/* ファイル入力は register では扱わず onChange で直接 state に入れる（ファイルは uncontrolled の方が扱いやすい） */}
          <input type="file" accept="image/*" onChange={onFileChange} />
          {avatarPreview && (
            <div style={{ marginTop: 8 }}>
              <img
                src={avatarPreview}
                alt="avatar preview"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit">登録する</button>
        </div>

        {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        すでにアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
      </p>
    </div>
  );
}
