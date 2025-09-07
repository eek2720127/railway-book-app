import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { nextPage, prevPage } from "../store/paginationSlice";

export default function Pagination({ hasMore = true, loading = false }) {
  const dispatch = useDispatch();
  const offset = useSelector((s) => s.pagination.offset);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 12,
        marginTop: 16,
      }}
    >
      <button
        onClick={() => dispatch(prevPage())}
        disabled={offset === 0 || loading}
      >
        前へ
      </button>
      <button
        onClick={() => dispatch(nextPage())}
        disabled={!hasMore || loading}
      >
        次へ
      </button>
    </div>
  );
}
