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

function keyFor(method: string, url: string, body?: any) {
  return `${method.toUpperCase()} ${url}${body ? ` ${JSON.stringify(body)}` : ""}`;
}

export function invalidateApiCache(prefix = "/") {
  for (const k of [...respCache.keys()]) {
    try {
      const url = k.split(" ").slice(1).join(" ");
      const u = new URL(url);
      if (u.pathname.startsWith(prefix)) respCache.delete(k);
    } catch {
      if (k.includes(prefix)) respCache.delete(k);
    }
  }
}

export function clearApiCache() {
  respCache.clear();
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API_BASE}${endpoint}`;

  const useCache = method === "GET" && options.skipCache !== true;
  const cacheTtl = options.cacheTtl ?? (useCache ? 15_000 : 0);
  const dedupe = options.dedupe ?? true;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retries = options.retries ?? (method === "GET" ? 2 : 0);

  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  let body: any = options.body;
  if (body && !isFormData && typeof body !== "string") body = JSON.stringify(body);

  const cacheKey = keyFor("GET", url);
  if (useCache && cacheTtl > 0) {
    const cached = respCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) return cached.data as T;
  }

  const flightKey = keyFor(method, url, method === "GET" ? undefined : body);
  if (dedupe) {
    const inflight = inFlight.get(flightKey);
    if (inflight) return inflight as Promise<T>;
  }

  // Abort/timeout merge
  const controller = new AbortController();
  const userSignal = options.signal;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (userSignal) {
    if ((userSignal as AbortSignal).aborted) controller.abort();
    (userSignal as AbortSignal).addEventListener("abort", () => controller.abort(), { once: true });
  }

  async function attempt(n: number): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      // Retry GETs on 5xx
      if (method === "GET" && res.status >= 500 && res.status < 600 && n < retries) {
        const backoff = 250 * 2 ** n + Math.random() * 100;
        await new Promise((r) => setTimeout(r, backoff));
        return attempt(n + 1);
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `API error: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    const json = await res.json();

    if (useCache && cacheTtl > 0) {
      respCache.set(cacheKey, { expiry: Date.now() + cacheTtl, data: json });
    } else if (method !== "GET") {
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

  const fetchPromise = attempt(0)
    .finally(() => {
      inFlight.delete(flightKey);
      clearTimeout(timeout);
    });

  if (dedupe) inFlight.set(flightKey, fetchPromise);
  return fetchPromise;
}

