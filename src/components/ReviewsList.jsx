// src/components/ReviewsList.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import styles from "./ReviewsList.module.css";

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      setLoading(true);
      setError("");
      try {
        // public/books の offset=0 で先頭10件を取得する想定
        const res = await api.get("/public/books", { params: { offset: 0 } });
        // res.data が配列で返るはず
        if (mounted) {
          setReviews(Array.isArray(res.data) ? res.data.slice(0, 10) : []);
        }
      } catch (err) {
        console.error("fetch reviews failed:", err);
        if (mounted)
          setError(
            "レビュー一覧の取得に失敗しました。しばらくしてから再度お試しください。"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className={styles.info}>読み込み中…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>書籍レビュー一覧（先頭10件）</h2>
      {reviews.length === 0 ? (
        <div className={styles.info}>レビューが見つかりません。</div>
      ) : (
        <ul className={styles.list}>
          {reviews.map((r) => (
            <li key={r.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title}>{r.title}</h3>
                {r.reviewer && (
                  <div className={styles.reviewer}>by {r.reviewer}</div>
                )}
              </div>
              {r.url && (
                <a
                  className={styles.link}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  書籍情報を見る
                </a>
              )}
              <p className={styles.review}>
                {r.review ? (
                  r.review
                ) : (
                  <span className={styles.noReview}>（レビューなし）</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
