// src/pages/ReviewsPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api";
import ReviewsList from "../components/ReviewsList";
import Pagination from "../components/Pagination";
import styles from "../components/ReviewsList.module.css";

export default function ReviewsPage() {
  console.log("ReviewsPage: render");
  const offset = useSelector((state) => state?.pagination?.offset ?? 0);
  const limit = useSelector((state) => state?.pagination?.limit ?? 10);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true); // ← 追加: 次ページがあるかどうか

  useEffect(() => {
    let mounted = true;
    console.log(
      `[ReviewsPage] useEffect fired offset=${offset} limit=${limit}`
    );

    async function fetchPage() {
      setLoading(true);
      setError("");
      console.log(`[ReviewsPage] fetchPage offset=${offset}`);
      try {
        const res = await api.get("/public/books", { params: { offset } });
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
          // 受け取った配列を limit 件に切って表示
          const pageItems = dataArray.slice(0, limit);
          setReviews(pageItems);

          // hasMore 判定: 取得した件数が limit と等しいなら次ページがある可能性がある
          // （API が total を返さない想定のための簡易判定）
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
  }, [offset, limit]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>書籍レビュー一覧</h2>

      {/* デバッグ用 JSON 出力（必要なければ削除可） */}
      {/* <pre style={{ whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(reviews, null, 2)}
      </pre> */}

      {loading ? (
        <div className={styles.info}>読み込み中…</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <ReviewsList reviews={reviews} />
          {/* hasMore と loading を渡す */}
          <Pagination hasMore={hasMore} loading={loading} />
        </>
      )}
    </div>
  );
}
