// src/api.js (既存)
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

const saved = localStorage.getItem("token");
if (saved) api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;

export default api;
