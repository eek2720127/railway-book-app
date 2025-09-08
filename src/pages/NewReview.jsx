// src/pages/NewReview.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function NewReview() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!title.trim()) return "タイトルは必須です";
    // 必要なら URL の簡易チェック
    if (url && !/^https?:\/\//.test(url))
      return "URL は http:// または https:// で始めてください";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    try {
      // API に合わせた body
      await api.post("/books", {
        title: title.trim(),
        url: url.trim(),
        detail: detail.trim(),
        review: review.trim(),
      });

      // 成功したら一覧に戻る
      navigate("/reviews");
    } catch (err) {
      console.error("create book failed", err);
      setError(
        err?.response?.data?.ErrorMessageJP ||
          err?.response?.data?.message ||
          "登録に失敗しました。"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, padding: 12 }}>
      <h2>書籍レビューの新規投稿</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>タイトル（必須）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>参照 URL（任意）</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>詳細（任意）</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>感想 / レビュー（任意）</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={6}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>
        )}

        <div>
          <button type="submit" disabled={saving}>
            {saving ? "保存中…" : "投稿する"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/reviews")}
            style={{ marginLeft: 8 }}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
