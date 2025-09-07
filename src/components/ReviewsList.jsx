// src/components/ReviewsList.jsx
import React from "react";
import styles from "./ReviewsList.module.css";

export default function ReviewsList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return <div className={styles.info}>レビューが見つかりません。</div>;
  }

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
  );
}
