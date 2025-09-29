// src/app/feed/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getPosts } from "@/services/post";
import type { Post } from "@/types";
import PostCard from "@/components/PostCard";
import PostSheet from "@/components/PostSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // ← add

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

    // abort previous in-flight fetch to avoid UI flicker
    ctrlRef.current?.abort();
    const controller = new AbortController();
    ctrlRef.current = controller;

    try {
      const res = await getPosts(page, 10, { signal: controller.signal });
      setPosts((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const incoming = res.data.filter((p) => !prevIds.has(p.id));
        return [...prev, ...incoming];
      });
      setHasMore(res.page * res.limit < res.total);
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
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
      { rootMargin: "400px 0px", threshold: 0.01 } // ← prefetch earlier
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading]);

  const handleRefresh = () => {
    if (loading) return;
    ctrlRef.current?.abort();
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setTimeout(() => {
      fetchPosts();
      toast.success("Feed refreshed");
    }, 0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 font-bold text-xl flex items-center justify-between">
        <span>Home</span>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading} className="gap-2">
          {loading ? "Loading..." : "Refresh"}
        </Button>
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
