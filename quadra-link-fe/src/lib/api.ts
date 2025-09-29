// src/lib/api.ts
import { getToken } from "@/services/auth";

// Map to track ongoing GET requests for deduplication/aborting
const ongoingRequests = new Map<string, AbortController>();

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  // Always set Content-Type for requests with a body
  const hasBody = !!options.body;
  const headers: Record<string, string> = {
    ...(options.headers as any),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
  };

  // Only dedupe/abort GET requests
  let controller: AbortController | undefined;
  if ((options.method || "GET").toUpperCase() === "GET") {
    if (ongoingRequests.has(url)) {
      // Abort previous request
      ongoingRequests.get(url)!.abort();
    }
    controller = new AbortController();
    ongoingRequests.set(url, controller);
    options.signal = controller.signal;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }
    return res.json();
  } finally {
    // Clean up after request finishes
    if (controller) ongoingRequests.delete(url);
  }
}


