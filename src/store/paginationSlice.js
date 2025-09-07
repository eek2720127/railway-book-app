// src/store/paginationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  offset: 0, // API offset（0, 10, 20, ...）
  limit: 10,
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    nextPage(state) {
      state.offset += state.limit;
    },
    prevPage(state) {
      state.offset = Math.max(0, state.offset - state.limit);
    },
    setOffset(state, action) {
      state.offset = Math.max(0, action.payload || 0);
    },
    resetPagination(state) {
      state.offset = 0;
    },
  },
});

export const { nextPage, prevPage, setOffset, resetPagination } =
  paginationSlice.actions;
export default paginationSlice.reducer;
