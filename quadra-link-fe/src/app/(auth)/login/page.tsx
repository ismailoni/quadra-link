// src/app/login/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { login } from "@/services/auth";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);

  const { user, loading } = useUser();
  const router = useRouter();

  // redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/feed");
    }
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();

    try {
      await login(
        { email, password },
        { signal: ctrlRef.current.signal, timeoutMs: 15000 }
      );

      toast.success("Login Successful 🎉", {
        description: "Redirecting you to your feed...",
      });

      setTimeout(() => router.push("/feed"), 1200);
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        toast.message("Login canceled");
      } else {
        setError(err.message || "Login failed");

        toast.error("Login Failed", {
          description: err?.message || "Something went wrong",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => () => ctrlRef.current?.abort(), []);

  // show spinner while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Login to continue your wellness journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <div className="flex justify-end mt-1">
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
