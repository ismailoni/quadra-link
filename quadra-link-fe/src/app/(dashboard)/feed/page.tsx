// src/app/feed/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getPosts } from "@/services/post";
import type { Post } from "@/types";
import PostCard from "@/components/PostCard";
import PostSheet from "@/components/PostSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const ctrlRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    try {
      const res = await getPosts(page, 10, { cacheTtl: 5_000, retries: 2, signal: ctrl.signal });
      setPosts((prev) => [...prev, ...res.data]);
      setHasMore(res.page * res.limit < res.total);
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(e?.message || "Failed to load posts");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchPosts();
    return () => ctrlRef.current?.abort();
  }, [fetchPosts]);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 font-bold text-xl">
        Home
      </div>

      {posts.length === 0 && loading ? (
        // 🔹 Skeleton Loader
        <div className="space-y-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClickAction={() => setSelectedPost(post)}
          />
        ))
      )}

      {loading && posts.length > 0 && (
        <div className="space-y-4 p-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && <p className="text-center text-gray-400 p-4">No more posts</p>}
      <div ref={loaderRef} />

      <PostSheet post={selectedPost} onCloseAction={() => setSelectedPost(null)} />
    </div>
  );
}
