// src/types/index.ts

// ========================
// User
// ========================
export interface User {
  id: string;
  fullname: string;
  firstname: string;
  lastname: string;
  pseudoname: string;
  email: string;
  avatar?: string;        // profile picture
  bio?: string; 
  school?: string;
  department?: string;
  level?: string;      // e.g., "100", "200"
  role: "user" | "moderator" | "counsellor" | "admin";
  createdAt: string;
  updatedAt: string;
}

// ========================
// Auth
// ========================
export interface AuthResponse {
  access_token: string;
  user: User;
}

// ========================
// Post & Comment
// ========================
export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrl?: string;

  likesCount: number;
  commentsCount: number;

  likes: Like[];
  comments: Comment[];

  visibility: "public" | "school" | "private";

  createdAt: string;
  updatedAt: string;
}


// ========================
// Like
// ========================
export interface Like {
  id: string;
  postId: string;
  user: User;
  createdAt: string;
}

// ========================
// Generic Success Response
// ========================
export interface SuccessResponse {
    message: string;
    [key: string]: any; // for any additional data
}