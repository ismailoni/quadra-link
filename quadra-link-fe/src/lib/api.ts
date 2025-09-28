// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { getToken } from "@/services/auth";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
    const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}


