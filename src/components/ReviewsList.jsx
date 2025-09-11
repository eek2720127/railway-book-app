// src/components/ReviewsList.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./ReviewsList.module.css";

/**
 * props:
 *  - reviews: array
 *  - currentUser: { name?: string, id?: string } (optional)
 */
export default function ReviewsList({ reviews = [], currentUser = null }) {
  if (!reviews || reviews.length === 0) {
    return <div className={styles.info}>レビューが見つかりません。</div>;
  }

  // helper: is this review mine?
  const isMine = (r) => {
    if (typeof r.isMine === "boolean") return r.isMine;
    // fallback: compare reviewer name or id if available
    if (!currentUser) return false;
    if (r.reviewer && currentUser.name) {
      return r.reviewer === currentUser.name;
    }
    if (r.reviewerId && currentUser.id) {
      return r.reviewerId === currentUser.id;
    }
    return false;
  };

  return (
    <ul className={styles.list}>
      {reviews.map((r) => (
        <li key={r.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.title}>{r.title}</h3>
            {r.reviewer && (
              <div className={styles.reviewer}>by {r.reviewer}</div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              gap: 12,
            }}
          >
            <div>
              <Link
                className={styles.link}
                to={`/detail/${r.id}`}
                state={{ fromList: true }}
              >
                書籍の詳細を見る
              </Link>

              {r.url && (
                <a
                  className={styles.link}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 8 }}
                >
                  書籍情報（外部）
                </a>
              )}
            </div>

            {/* 編集ボタンは isMine 判定で表示 */}
            {isMine(r) && (
              <div>
                <Link to={`/edit/${r.id}`}>
                  <button type="button">編集</button>
                </Link>
              </div>
            )}
          </div>

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
  );
}
