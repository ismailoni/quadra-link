'use client';
import React, { useEffect, useState } from 'react';
import type { Post } from '@/types';
import { getPosts, createPost, addComment, likePost } from '@/services/post';
import { useUser } from '@/hooks/useUser';

const FeedPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // New post states
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'school' | 'private'>('public');
  const [creating, setCreating] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Comment and like states
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [postId: string]: boolean }>({});
  const [likeLoading, setLikeLoading] = useState<{ [postId: string]: boolean }>({});

  // Fetch posts when user is available
  useEffect(() => {
    if (!user) {
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    getPosts()
      .then((data) => setPosts(data))
      .catch((err) => setPostError('Failed to load posts.'))
      .finally(() => setLoadingPosts(false));
  }, [user]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      setPostError('Post content cannot be empty.');
      return;
    }
    setCreating(true);
    setPostError(null);
    try {
      const newPost = await createPost(newPostContent, mediaUrl, visibility);
      setPosts((prevPosts) => [newPost, ...(Array.isArray(prevPosts) ? prevPosts : [])]);
      setNewPostContent('');
      setMediaUrl('');
      setVisibility('public');
    } catch (error: any) {
      setPostError(error.message || 'Failed to create post.');
    }
    setCreating(false);
  };

  // Like handler
  const handleLike = async (postId: string) => {
    setLikeLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await likePost(postId);
      // Optionally, refetch posts or update likesCount locally
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
        )
      );
    } catch (err) {
      setPostError('Failed to like post.');
    }
    setLikeLoading((prev) => ({ ...prev, [postId]: false }));
  };

  // Comment handler
  const handleAddComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      await addComment(postId, text);
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      // Optionally, refetch posts or update commentsCount locally
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        )
      );
    } catch (err) {
      setPostError('Failed to add comment.');
    }
    setCommentLoading((prev) => ({ ...prev, [postId]: false }));
  };

  if (userLoading) return <div className="feed-loading">Loading user...</div>;
  if (!user) return <div className="feed-login-prompt">Please log in to view your feed.</div>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 24,
        background: '#f9f9f9',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Feed</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Welcome to your dashboard feed, <span style={{ fontWeight: 600 }}>{user.name}</span>.
      </p>

      <div>
        {loadingPosts ? (
          <div className="feed-loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: 20,
                marginBottom: 20,
                transition: 'box-shadow 0.2s',
              }}
              className="feed-post-card"
            >
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.name}
                style={{
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  marginRight: 18,
                  objectFit: 'cover',
                  border: '2px solid #eee',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <strong style={{ fontSize: 16 }}>{post.author.name}</strong>
                  <span
                    style={{
                      color: '#888',
                      fontSize: 12,
                      marginLeft: 10,
                      background: '#f1f1f1',
                      borderRadius: 4,
                      padding: '2px 6px',
                    }}
                  >
                    {new Date(post.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: '#0070f3',
                      background: '#eaf6ff',
                      borderRadius: 4,
                      padding: '2px 6px',
                    }}
                  >
                    {post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1)}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 15 }}>{post.content}</div>
                {post.mediaUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={post.mediaUrl}
                      alt="media"
                      style={{
                        maxWidth: '100%',
                        borderRadius: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                    />
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 13, color: '#888', display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={likeLoading[post.id]}
                    style={{
                      marginRight: 16,
                      background: 'none',
                      border: 'none',
                      color: '#0070f3',
                      cursor: likeLoading[post.id] ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    👍 {post.likesCount} Like
                  </button>
                  <span>💬 {post.commentsCount} Comments</span>
                </div>
                {/* Comment input */}
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    value={commentText[post.id] || ''}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="Add a comment..."
                    style={{
                      width: '70%',
                      padding: 6,
                      borderRadius: 6,
                      border: '1px solid #ddd',
                      fontSize: 14,
                      marginRight: 8,
                    }}
                    disabled={commentLoading[post.id]}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={commentLoading[post.id]}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: '#0070f3',
                      color: '#fff',
                      border: 'none',
                      cursor: commentLoading[post.id] ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {commentLoading[post.id] ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="feed-no-posts">No posts available.</div>
        )}
        {postError && (
          <div style={{ color: 'red', marginTop: 8, marginBottom: 8 }}>{postError}</div>
        )}
      </div>

      <div
        style={{
          marginTop: 32,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Create New Post</h2>
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 15,
            marginBottom: 10,
            resize: 'vertical',
          }}
          placeholder="What's on your mind?"
        />
        <input
          type="text"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 15,
            marginBottom: 10,
          }}
          placeholder="Media URL (optional)"
        />
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as 'public' | 'school' | 'private')}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid #ddd',
            fontSize: 15,
            marginBottom: 10,
            background: '#f9f9f9',
          }}
        >
          <option value="public">🌍 Public</option>
          <option value="school">🏫 School</option>
          <option value="private">🔒 Private</option>
        </select>
        <button
          onClick={handleCreatePost}
          disabled={creating}
          style={{
            marginTop: 8,
            padding: '10px 20px',
            borderRadius: 6,
            background: creating ? '#aaa' : '#0070f3',
            color: '#fff',
            border: 'none',
            cursor: creating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
          }}
        >
          {creating ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default FeedPage;
