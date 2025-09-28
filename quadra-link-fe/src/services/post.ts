import { apiFetch, type ApiFetchOptions } from "@/lib/api";
import type { Post, Comment, Like, SuccessResponse } from "@/types";

type FetchOpts = Pick<ApiFetchOptions, "signal" | "timeoutMs" | "dedupe" | "cacheTtl" | "retries">;

export async function getPosts(page = 1, limit = 10, opts: FetchOpts = {}) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch(`/posts?${qs.toString()}`, {
    cacheTtl: opts.cacheTtl ?? 5_000,
    dedupe: opts.dedupe ?? true,
    retries: opts.retries ?? 2,
    timeoutMs: opts.timeoutMs ?? 15_000,
    signal: opts.signal,
  });
}

export function createPost(
  content: string,
  mediaUrl?: string,
  visibility: "public" | "school" | "private" = "public"
): Promise<Post> {
  return apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify({ content, mediaUrl, visibility }),
  });
}

export function updatePost(
  id: string,
  data: Partial<Pick<Post, "content" | "mediaUrl" | "visibility">>
): Promise<Post> {
  return apiFetch(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string | number, opts: FetchOpts = {}) {
  return apiFetch(`/posts/${id}`, { method: "DELETE", dedupe: false, timeoutMs: opts.timeoutMs ?? 15_000, signal: opts.signal });
}

export function addComment(postId: string, content: string): Promise<Comment> {
  return apiFetch("/posts/comment", {
    method: "POST",
    body: JSON.stringify({ postId, content }), // <-- use 'content'
  });
}

export function deleteComment(commentId: string): Promise<SuccessResponse> {
  return apiFetch(`/posts/comment/${commentId}`, { method: "DELETE" });
}

export async function likePost(postId: string | number, opts: FetchOpts = {}) {
  return apiFetch(`/posts/${postId}/like`, { method: "POST", dedupe: false, timeoutMs: opts.timeoutMs ?? 10_000, signal: opts.signal });
}

export async function unlikePost(postId: string | number, opts: FetchOpts = {}) {
  return apiFetch(`/posts/${postId}/like`, { method: "DELETE", dedupe: false, timeoutMs: opts.timeoutMs ?? 10_000, signal: opts.signal });
}
