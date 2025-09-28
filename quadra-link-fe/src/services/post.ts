import { apiFetch } from "@/lib/api";
import type { Post, Comment, Like, SuccessResponse } from "@/types";


export async function getPosts(page = 1, limit = 10) {
  return apiFetch(
    `/posts?page=${page}&limit=${limit}`,
    { method: "GET" }
  );
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

export async function deletePost(id: string | number): Promise<SuccessResponse> {
  return apiFetch(`/posts/${id}`, { method: "DELETE"});
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

export async function likePost(postId: string | number) {
  return apiFetch(`/posts/${postId}/like`, { method: "POST"});
}

export async function unlikePost(postId: string | number) {
  return apiFetch(`/posts/${postId}/like`, { method: "DELETE"});
}
