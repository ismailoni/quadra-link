"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Heart, Repeat, Share } from "lucide-react";
import type { Post } from "@/types";
import { useUser } from "@/hooks/useUser";
import { likePost, unlikePost } from "@/services/post";
import { toast } from "sonner";

export default function PostCard({
  post,
  onClickAction,
  onCommentClickAction,
}: {
  post: Post;
  onClickAction?: () => void;
  onCommentClickAction?: (post: Post) => void;
}) {
  function isLiked(post: Post, userId: string): boolean {
    return Array.isArray(post.likes) && post.likes.some((like) => like.user?.id === userId);
  }
  const { user } = useUser();
  const userId = user?.id ?? "";
  const [liked, setLiked] = useState(isLiked(post, userId));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);

  const likeCtrlRef = useRef<AbortController | null>(null);
  const likeBusyRef = useRef(false);                       
  useEffect(() => {                                   
    return () => {
      likeCtrlRef.current?.abort();
    };
  }, []);

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (likeBusyRef.current) return;                       
    likeBusyRef.current = true;          

    // cancel previous like in-flight
    likeCtrlRef.current?.abort();                 
    likeCtrlRef.current = new AbortController();  

    try {
      if (liked) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));           
        await unlikePost(post.id, {
          signal: likeCtrlRef.current.signal,    
          timeoutMs: 10_000,                      
        } as any);
        toast.success("Post unliked");                   
      } else {
        setLiked(true);
        setLikesCount((c) => c + 1);
        await likePost(post.id, {
          signal: likeCtrlRef.current.signal,         
          timeoutMs: 10_000,                               
        } as any);
        toast.success("Post liked");                       
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // rollback to current state of post if needed
        setLiked(isLiked(post, userId));
        setLikesCount(post.likesCount ?? 0);
        // no error toast on cancel
      } else {
        setLiked(isLiked(post, userId));
        setLikesCount(post.likesCount ?? 0);
        toast.error(err?.message || "Failed to like/unlike post"); 
        console.error("Failed to like/unlike:", err);
      }
    } finally {
      likeBusyRef.current = false;                         
    }
  }

  function handleCommentClick(e: React.MouseEvent) {
    e.stopPropagation();
    onCommentClickAction?.(post);
  }

  return (
    <div
      className="border-b p-4 cursor-pointer hover:bg-gray-50 transition"
      onClick={onClickAction}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
          {post.author?.avatar ?? post.author?.Pseudoname?.[0] ?? "U"}
        </div>

        {/* Post content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold hover:underline">
              {post.author?.Pseudoname || "Unknown"}
            </span>
            <span className="text-gray-500">
              @{post.author?.school || "user"}
            </span>
            <span className="text-gray-400">
              · {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <p className="mt-1 text-gray-800">{post.content}</p>

          {/* Actions */}
          <div className="flex gap-6 mt-3 text-sm text-gray-500">
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <MessageCircle size={16} />
              <span>{post.commentsCount ?? 0}</span>
            </button>

            <div className="flex items-center gap-1 hover:text-green-600">
              <Repeat size={16} />0{/* <span>{post.repostsCount ?? 0}</span> */}
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${
                liked ? "text-pink-600" : "hover:text-pink-600"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1 hover:text-gray-700">
              <Share size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 60 * 1000) return "just now";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
  if (diff < 24 * 60 * 60 * 1000)
    return `${Math.floor(diff / (60 * 60 * 1000))}h`;
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
}
