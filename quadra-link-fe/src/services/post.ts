import { apiFetch } from "@/lib/api";
import type { Post, Comment, Like, SuccessResponse } from "@/types";

export async function getPosts(): Promise<Post[]> {
  const res = await apiFetch("/posts");
  return res.data; // <-- Only return the posts array
}

export function getPost(id: string): Promise<Post> {
  return apiFetch(`/posts/${id}`);
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

export function deletePost(id: string): Promise<SuccessResponse> {
  return apiFetch(`/posts/${id}`, { method: "DELETE" });
}

export function addComment(postId: string, content: string) {
  return apiFetch("/posts/comment", {
    method: "POST",
    body: JSON.stringify({ postId, content }), // <-- use 'content'
  });
}

export function deleteComment(commentId: string): Promise<SuccessResponse> {
  return apiFetch(`/posts/comment/${commentId}`, { method: "DELETE" });
}

export function likePost(postId: string): Promise<Like> {
  return apiFetch("/posts/like", {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export function unlikePost(postId: string): Promise<SuccessResponse> {
  return apiFetch("/posts/unlike", {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}
