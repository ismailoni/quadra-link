// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { getToken } from "@/services/auth";

export type ApiFetchOptions = RequestInit & {
  cacheTtl?: number;
  timeoutMs?: number;
  dedupe?: boolean;
  skipCache?: boolean;
  retries?: number; // number of retry attempts for GET (default 2)
};

const respCache = new Map<string, { expiry: number; data: any }>();
const inFlight = new Map<string, Promise<any>>();

function keyFor(method: string, url: string) {
  return `${method.toUpperCase()} ${url}`;
}

export function invalidateApiCache(prefix = "/") {
  for (const k of [...respCache.keys()]) {
    const [, url] = k.split(" ");
    try {
      const u = new URL(url);
      if (u.pathname.startsWith(prefix)) respCache.delete(k);
    } catch {
      if (url.includes(prefix)) respCache.delete(k);
    }
  }
}

export function clearApiCache() {
  respCache.clear();
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API_BASE}${endpoint}`;
  const useCache = method === "GET" && options.skipCache !== true;
  const cacheTtl = options.cacheTtl ?? (useCache ? 15_000 : 0);
  const dedupe = options.dedupe ?? true;
  const timeoutMs = options.timeoutMs ?? 15_000;

  const cacheKey = keyFor("GET", url);

  // Serve fresh-enough cache for GET
  if (useCache && cacheTtl > 0) {
    const cached = respCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return Promise.resolve(cached.data as T);
    }
  }

  // Coalesce identical in-flight requests
  if (dedupe) {
    const flightKey = keyFor(method, url + (method !== "GET" ? JSON.stringify(options.body ?? "") : ""));
    const inflight = inFlight.get(flightKey);
    if (inflight) return inflight;
  }

  // Timeout + abort handling
  const controller = new AbortController();
  const userSignal = options.signal;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const signal =
    userSignal && "addEventListener" in (userSignal as any)
      ? (function merge() {
          if ((userSignal as AbortSignal).aborted) controller.abort();
          (userSignal as AbortSignal).addEventListener("abort", () => controller.abort());
          return controller.signal;
        })()
      : controller.signal;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const token = getToken();

  // Auto-stringify plain JSON bodies
  let body = options.body as any;
  if (body && !isFormData && typeof body !== "string") {
    body = JSON.stringify(body);
  }

  async function doAttempt(attempt: number): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body,
      signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err = new Error(errorData.message || `API error: ${res.status}`);
      // Retry GETs on 5xx
      if (
        method === "GET" &&
        (res.status >= 500 && res.status < 600) &&
        attempt < (options.retries ?? 2)
      ) {
        const backoff = 300 * 2 ** attempt + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
        return doAttempt(attempt + 1);
      }
      throw err;
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const json = await res.json();

    if (useCache && cacheTtl > 0) {
      respCache.set(cacheKey, { expiry: Date.now() + cacheTtl, data: json });
    } else if (method !== "GET") {
      // Invalidate affected resource family on mutations
      try {
        const u = new URL(url);
        const prefix = "/" + (u.pathname.split("/")[1] ?? "");
        invalidateApiCache(prefix);
      } catch {
        const prefix = "/" + endpoint.split("?")[0].split("/")[1];
        invalidateApiCache(prefix);
      }
    }

    return json as T;
  }

  const fetchPromise = doAttempt(0)
    .finally(() => {
      const flightKey = keyFor(method, url + (method !== "GET" ? JSON.stringify(options.body ?? "") : ""));
      inFlight.delete(flightKey);
      clearTimeout(timeout);
    });

  if (dedupe) {
    const flightKey = keyFor(method, url + (method !== "GET" ? JSON.stringify(options.body ?? "") : ""));
    inFlight.set(flightKey, fetchPromise);
  }

  return fetchPromise;
}

