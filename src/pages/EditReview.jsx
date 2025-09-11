// src/pages/EditReview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState("");
  const [review, setReview] = useState("");

  // 初期データ取得
  useEffect(() => {
    let mounted = true;
    async function fetchDetail() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/books/${id}`);
        if (!mounted) return;
        const b = res.data || {};
        setTitle(b.title || "");
        setUrl(b.url || "");
        setDetail(b.detail || "");
        setReview(b.review || "");
      } catch (err) {
        console.error("[EditReview] fetch failed", err);
        if (mounted) setError("書籍情報の取得に失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  // 更新処理
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    const trimTitle = (title || "").trim();
    if (!trimTitle) {
      setError("タイトルは必須です");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/books/${id}`, {
        title: trimTitle,
        url: (url || "").trim(),
        detail: (detail || "").trim(),
        review: (review || "").trim(),
      });
      navigate("/reviews", { replace: true });
    } catch (err) {
      console.error("[EditReview] update failed", err);
      setError(
        err.response?.data?.ErrorMessageJP ||
          err.response?.data?.message ||
          "更新に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  // 削除処理（axios直書きのトークン明示を統合）
  const handleDelete = async () => {
    if (!window.confirm("本当にこのレビューを削除しますか？")) return;

    setDeleting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // tokenを明示
        },
      });
      alert("レビューを削除しました");
      navigate("/reviews", { replace: true });
    } catch (err) {
      console.error("[EditReview] delete failed", err);
      setError(
        err.response?.data?.ErrorMessageJP ||
          err.response?.data?.message ||
          "削除に失敗しました"
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>読み込み中…</div>;

  return (
    <div style={{ maxWidth: 760, padding: 12 }}>
      <h2>レビュー編集</h2>
      {error && (
        <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleUpdate}>
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

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving || deleting}>
            {saving ? "保存中…" : "更新する"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/reviews")}
            disabled={saving || deleting}
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            style={{
              marginLeft: "auto",
              color: "white",
              background: "#d9534f",
              border: "none",
              padding: "6px 10px",
              borderRadius: 4,
            }}
          >
            {deleting ? "削除中…" : "レビューを削除"}
          </button>
        </div>
      </form>
    </div>
  );
}
