// src/pages/ReviewsPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api";
import ReviewsList from "../components/ReviewsList";
import Pagination from "../components/Pagination";
import styles from "../components/ReviewsList.module.css";
import { Link } from "react-router-dom";

export default function ReviewsPage({ user = null }) {
  console.log("ReviewsPage: render");
  const offset = useSelector((state) => state?.pagination?.offset ?? 0);
  const limit = useSelector((state) => state?.pagination?.limit ?? 10);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log(
      `[ReviewsPage] useEffect fired offset=${offset} limit=${limit}`
    );

    async function fetchPage() {
      setLoading(true);
      setError("");
      try {
        // ログイン済みなら認証版 /books を使って isMine 等を受け取れるようにする
        const path = user ? "/books" : "/public/books";
        const res = await api.get(path, { params: { offset } });
        console.log("[ReviewsPage] api response:", res);
        const maybe = res?.data;
        let dataArray = [];

        if (Array.isArray(maybe)) dataArray = maybe;
        else if (maybe && Array.isArray(maybe.data)) dataArray = maybe.data;
        else if (maybe && Array.isArray(maybe.items)) dataArray = maybe.items;
        else if (maybe && Array.isArray(maybe.books)) dataArray = maybe.books;
        else {
          if (maybe && typeof maybe === "object") {
            for (const k of Object.keys(maybe)) {
              if (Array.isArray(maybe[k])) {
                dataArray = maybe[k];
                console.warn(`[ReviewsPage] used first array property "${k}"`);
                break;
              }
            }
          }
        }

        console.log("[ReviewsPage] parsed dataArray length:", dataArray.length);
        if (mounted) {
          const pageItems = dataArray.slice(0, limit);
          setReviews(pageItems);
          setHasMore(dataArray.length === limit);
        }
      } catch (err) {
        console.error("[ReviewsPage] fetch error:", err);
        if (mounted) setError("レビュー一覧の取得に失敗しました");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPage();
    return () => {
      mounted = false;
      console.log("[ReviewsPage] cleanup");
    };
  }, [offset, limit, user]); // user を依存に追加

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>書籍レビュー一覧</h2>

      <div style={{ marginBottom: 12 }}>
        {user ? (
          <Link to="/new">+ 新しいレビューを投稿</Link>
        ) : (
          <Link to="/login">ログインしてレビューを投稿</Link>
        )}
      </div>

      {loading ? (
        <div className={styles.info}>読み込み中…</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <ReviewsList reviews={reviews} currentUser={user} />
          <Pagination hasMore={hasMore} loading={loading} />
        </>
      )}
    </div>
  );
}
