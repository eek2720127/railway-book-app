// src/pages/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import Compressor from "compressorjs";
import api from "../api";
import { useNavigate } from "react-router-dom";

const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export default function Profile({ onUpdateUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previewRef = useRef(null); // プレビューURL を保持して確実に revoke する
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoadingInit(true);
    (async () => {
      try {
        const res = await api.get("/users");
        if (!mounted) return;
        const u = res?.data || {};
        setName(u.name || "");
        setEmail(u.email || "");
        setIconUrl(u.iconUrl || "");
      } catch (err) {
        console.error("fetch user failed", err);
        setError("ユーザー情報の取得に失敗しました");
      } finally {
        if (mounted) setLoadingInit(false);
      }
    })();
    return () => {
      mounted = false;
      // クリーンアップ：作ったプレビューURL を破棄
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  const onFileChange = (e) => {
    setError("");
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setAvatarFile(null);
      return;
    }

    // 型チェック
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("png / jpg 形式の画像を選択してください");
      e.target.value = null;
      return;
    }

    // サイズチェック（大きすぎる場合でも圧縮で小さくなる可能性はあるが、まず警告する）
    if (f.size > 5 * 1024 * 1024) {
      // 例えば 5MB より大きければ無条件に弾く（任意の閾値）
      setError("ファイルが大きすぎます（5MB 以上は不可）");
      e.target.value = null;
      return;
    }

    // 既存プレビューを破棄
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    previewRef.current = URL.createObjectURL(f);
    setAvatarFile(f);
    setIconUrl(previewRef.current); // プレビュー表示用
  };

  async function uploadAvatar(file) {
    // 圧縮してからアップロード。圧縮後サイズが 1MB を超える場合はエラーにする。
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
        success(result) {
          // result は Blob / File
          if (result.size > MAX_SIZE) {
            reject(
              new Error(
                "圧縮後でもファイルが大きすぎます（1MB 以下にしてください）"
              )
            );
            return;
          }
          const fd = new FormData();
          // filename が無い場合は name を付与
          const fileToSend =
            result instanceof File
              ? result
              : new File([result], file.name || "icon.jpg", {
                  type: result.type,
                });
          fd.append("icon", fileToSend);
          api
            .post("/uploads", fd) // axios が自動で Content-Type を付与する
            .then((res) => {
              const icon = res?.data?.iconUrl || res?.data?.iconurl || null;
              resolve(icon);
            })
            .catch((err) => {
              reject(err);
            });
        },
        error(err) {
          // 圧縮エラーの場合は元ファイルで試みるが、サイズ制限は守る
          if (file.size > MAX_SIZE) {
            reject(
              new Error(
                "アップロードに失敗しました（元ファイルが大きすぎます）"
              )
            );
            return;
          }
          const fd = new FormData();
          fd.append("icon", file);
          api
            .post("/uploads", fd)
            .then((res) => {
              const icon = res?.data?.iconUrl || res?.data?.iconurl || null;
              resolve(icon);
            })
            .catch((e) => reject(e));
        },
      });
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      let newIconUrl = iconUrl;

      if (avatarFile) {
        // upload
        try {
          const uploaded = await uploadAvatar(avatarFile);
          if (uploaded) {
            newIconUrl = uploaded;
            setIconUrl(uploaded);
          }
        } catch (err) {
          console.error("avatar upload error", err);
          setError(err?.message || "アイコンのアップロードに失敗しました");
          setSaving(false);
          return;
        }
      }

      // PUT /users (swagger によれば name のみ)
      await api.put("/users", { name });

      // 最新ユーザー情報取得
      const fresh = await api.get("/users");
      const user = fresh?.data || null;
      if (typeof onUpdateUser === "function") onUpdateUser(user);

      setMessage("更新しました");
      // 任意で一覧に戻る
      navigate("/reviews");
    } catch (err) {
      console.error("profile update failed", err);
      setError(
        err?.response?.data?.ErrorMessageJP ||
          err?.response?.data?.message ||
          "更新に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) return <div>読み込み中...</div>;

  return (
    <div style={{ maxWidth: 640, padding: 12 }}>
      <h2>アカウント情報編集</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>メールアドレス</label>
          <input
            value={email}
            placeholder="メールアドレス"
            type="email"
            disabled
            style={{ width: "100%", padding: 8 }}
          />
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            ※メールアドレスの変更は現在サーバー側でサポートされていない可能性があります。
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>アイコン（png / jpg、最大 1MB）</label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={onFileChange}
          />
          <div style={{ marginTop: 8 }}>
            {iconUrl && (
              <img
                src={iconUrl}
                alt="avatar preview"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
        </div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
