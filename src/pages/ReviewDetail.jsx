import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export default function ReviewDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // 書籍詳細を取得
  useEffect(() => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        console.log("[ReviewDetail] GET /books/" + id);
        const res = await api.get(`/books/${id}`);
        console.log("[ReviewDetail] response:", res?.status, res?.data);
        setBook(res.data || null);
      } catch (err) {
        console.error("[ReviewDetail] fetch failed", err);
        setError("書籍情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ログ送信（一覧から来たときだけ）
  useEffect(() => {
    const fromList = location.state?.fromList ?? false;
    if (!fromList) return;
    (async () => {
      try {
        await api.post("/logs", { selectBookId: id });
        console.log("[ReviewDetail] log sent for", id);
      } catch (err) {
        console.warn("[ReviewDetail] log send failed", err);
      }
    })();
  }, [id, location.state]);

  // 削除処理
  const handleDelete = async () => {
    if (!window.confirm("本当にこのレビューを削除しますか？")) return;

    setDeleting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      console.log("[ReviewDetail] DELETE /books/" + id, "token:", token);

      await api.delete(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("レビューを削除しました");
      navigate("/reviews", { replace: true });
    } catch (err) {
      console.error("[ReviewDetail] delete failed", err);
      if (err.response) {
        setError(
          err.response.data?.ErrorMessageJP ||
            err.response.data?.message ||
            `サーバエラー: ${err.response.status}`
        );
      } else if (err.request) {
        setError(
          "サーバから応答がありません。ネットワークを確認してください。"
        );
      } else {
        setError(err.message || "削除に失敗しました");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>読み込み中…</div>;
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>
        <button onClick={() => navigate(-1)}>一覧に戻る</button>
      </div>
    );
  }
  if (!book) {
    return (
      <div style={{ padding: 20 }}>
        データが見つかりません。
        <div style={{ marginTop: 8 }}>
          <button onClick={() => navigate(-1)}>一覧に戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, padding: 20 }}>
      <h2>{book.title}</h2>
      <div style={{ color: "#666", marginBottom: 12 }}>
        {book.reviewer ? `by ${book.reviewer}` : ""}
      </div>

      {book.url && (
        <div style={{ marginBottom: 12 }}>
          <a href={book.url} target="_blank" rel="noopener noreferrer">
            書誌情報（外部）を開く
          </a>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <strong>詳細</strong>
        <p>{book.detail || "（詳細なし）"}</p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>感想 / レビュー</strong>
        <p>{book.review || "（レビューなし）"}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button onClick={() => navigate(-1)}>一覧に戻る</button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            marginLeft: "auto",
            background: "#d9534f",
            color: "white",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
          }}
        >
          {deleting ? "削除中…" : "レビューを削除"}
        </button>
      </div>
    </div>
  );
}
