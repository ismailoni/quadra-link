"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Heart, Repeat, Share, MoreHorizontal } from "lucide-react";
import type { Post } from "@/types";
import { useUser } from "@/hooks/useUser";
import { likePost, unlikePost, deletePost, updatePost } from "@/services/post";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({
  post,
  onClickAction,
  onCommentClickAction,
  onDeleteAction,
  onEditAction,
}: {
  post: Post;
  onClickAction?: () => void;
  onCommentClickAction?: (post: Post) => void;
  onDeleteAction?: (postId: string) => void;
  onEditAction?: (updatedPost: Post) => void;
}) {
  function isLiked(post: Post, userId: string): boolean {
    return Array.isArray(post.likes) && post.likes.some((like) => like.user?.id === userId);
  }
  const { user } = useUser();
  const userId = user?.id ?? "";
  const [liked, setLiked] = useState(isLiked(post, userId));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

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
        await unlikePost(post.id);
        toast.success("Post unliked");
      } else {
        setLiked(true);
        setLikesCount((c) => c + 1);
        await likePost(post.id);
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

  async function handleDelete() {
    try {
      await deletePost(post.id);
      onDeleteAction?.(post.id);
      toast.success("Post deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete post");
    }
  }

  async function handleEdit() {
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    try {
      const updatedPost = await updatePost(post.id, { content: editContent });
      onEditAction?.(updatedPost);
      setIsEditing(false);
      toast.success("Post updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update post");
    }
  }

  function handleCancelEdit() {
    setEditContent(post.content);
    setIsEditing(false);
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

          {isEditing ? (
            <div className="mt-1">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-800">{post.content}</p>
          )}

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

            {post.author?.id === userId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
