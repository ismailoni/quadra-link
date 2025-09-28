"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Post } from "@/types";
import { addComment, likePost, unlikePost } from "@/services/post";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Heart, Repeat, Share } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner"; // ← add

export default function PostSheet({
  post,
  onCloseAction,
}: {
  post: Post | null;
  onCloseAction: () => void;
}) {
  const { user } = useUser();
  const userId = user?.id ?? "";
  function isLiked(post: Post | null | undefined, userId: string): boolean {
    if (!post || !Array.isArray(post.likes)) return false;
    return post.likes.some((like) => like.user?.id === userId);
  }
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post?.comments || []);
  const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);
  const [liked, setLiked] = useState(isLiked(post, userId));

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Abort controllers + busy guard
  const likeCtrl = useRef<AbortController | null>(null);      // ← add
  const commentCtrl = useRef<AbortController | null>(null);   // ← add
  const likeBusyRef = useRef(false);                          // ← add

  useEffect(() => {
    if (post) {
      setComments(post.comments || []);
      setLikesCount(post.likesCount ?? 0);
      setLiked(isLiked(post, userId));
    }
  }, [post, userId]); // ← include userId

  // Cleanup on unmount
  useEffect(() => {                                          // ← add
    return () => {
      likeCtrl.current?.abort();
      commentCtrl.current?.abort();
    };
  }, []);

  if (!post) return null;

  async function handleComment() {
    if (!comment.trim() || !post) return;
    try {
      // cancel any in-flight comment request
      commentCtrl.current?.abort();                          // ← add
      commentCtrl.current = new AbortController();           // ← add

      const newComment = await addComment(post.id, comment);
      setComments((prev) => [...prev, newComment]);
      setComment("");
      toast.success("Comment added");                        // ← add
    } catch (err: any) {
      if (err?.name === "AbortError") return;               // ← add
      toast.error(err?.message || "Failed to add comment");  // ← add
      console.error("Failed to add comment:", err);
    }
  }

  async function handleLike() {
    if (!post || likeBusyRef.current) return;                // ← add busy guard
    likeBusyRef.current = true;                              // ← add
    try {
      // cancel any in-flight like/unlike
      likeCtrl.current?.abort();                             // ← add
      likeCtrl.current = new AbortController();              // ← add

      if (liked) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));            // ← safe decrement
        await unlikePost(post.id, {
          signal: likeCtrl.current.signal,                   // ← add
          timeoutMs: 10_000,                                 // ← add
        } as any);
        toast.success("Post unliked");                       // ← add
      } else {
        setLiked(true);
        setLikesCount((c) => c + 1);
        await likePost(post.id, {
          signal: likeCtrl.current.signal,                   // ← add
          timeoutMs: 10_000,                                 // ← add
        } as any);
        toast.success("Post liked");                         // ← add
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        // rollback
        setLiked(isLiked(post, userId));
        setLikesCount(post.likesCount ?? 0);
        toast.error(err?.message || "Failed to update like"); // ← add
        console.error("Failed to like/unlike:", err);
      }
    } finally {
      likeBusyRef.current = false;                           // ← add
    }
  }

  function focusCommentInput() {
    inputRef.current?.focus();
  }

  return (
    <Sheet open={!!post} onOpenChange={onCloseAction}>
      <SheetContent className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Post</SheetTitle>
        </SheetHeader>

        {/* Post Content */}
        <div className="mt-4 p-4 border-b">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
              {post.author?.avatar ?? post.author?.Pseudoname?.[0] ?? "U"}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{post.author?.Pseudoname}</div>
              <p className="mt-2 text-gray-800 text-lg">{post.content}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-around mt-4 text-sm text-gray-500">
            <button
              onClick={focusCommentInput}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <MessageCircle size={18} />
              <span>{comments.length}</span>
            </button>

            <div className="flex items-center gap-1 hover:text-green-600 cursor-pointer">
              <Repeat size={18} />0{/* <span>{post.repostsCount ?? 0}</span> */}
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                liked ? "text-pink-600" : "hover:text-pink-600"
              }`}
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
              <Share size={18} />
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                {c.author?.avatar ?? c.author?.Pseudoname?.[0] ?? "U"}
              </div>
              <div className="flex-1 border rounded-lg p-2 bg-gray-50">
                <span className="font-semibold">
                  {c.author?.Fullname ?? (c.author?.id ?? "Unknown User")}
                </span>
                <p className="text-sm">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm">No comments yet</p>
          )}
        </div>

        {/* Add Comment */}
        <div className="p-3 border-t flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
          />
          <Button onClick={handleComment}>Send</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
