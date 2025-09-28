// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
import { getToken } from "@/services/auth";

type ApiFetchOptions = RequestInit & {
  cacheTtl?: number;   // ms for GET cache (default 15s)
  timeoutMs?: number;  // abort after (default 15s)
  dedupe?: boolean;    // coalesce identical in-flight requests (default true)
  skipCache?: boolean; // bypass GET cache
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

  const fetchPromise = fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    signal,
  })
    .then(async (res) => {
      clearTimeout(timeout);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${res.status}`);
      }
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
    })
    .finally(() => {
      const flightKey = keyFor(method, url + (method !== "GET" ? JSON.stringify(options.body ?? "") : ""));
      inFlight.delete(flightKey);
    });

  if (dedupe) {
    const flightKey = keyFor(method, url + (method !== "GET" ? JSON.stringify(options.body ?? "") : ""));
    inFlight.set(flightKey, fetchPromise);
  }

  return fetchPromise;
}

