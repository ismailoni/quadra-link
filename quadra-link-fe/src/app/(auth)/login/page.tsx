// app/auth/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await api.post<{ message?: string }>(
        "/auth/login",
        data
      );

      const message = (response as any)?.message ?? "Login successful!";
      toast.success(message);

      // cookie is already set by backend
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] bg-gradient-to-br from-blue-200 via-indigo-200 to-blue-300 overflow-hidden rounded-sm">
      {/* Subtle background animation */}
      <div className="absolute inset-0">
        <div className="absolute w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse" />
        <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse delay-2000" />
      </div>

      {/* Left side illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 text-white">
        <div className="max-w-md text-center animate-fadeIn">
          <img
            src="/login-illustration.svg"
            alt="Community Illustration"
            className="w-full h-auto mb-6 drop-shadow-lg"
          />
          <h2 className="text-3xl font-bold mb-2">
            Join the Quadra Link Community
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Stay connected, share experiences, and grow with people who care.
          </p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl transition-transform hover:scale-[1.01] duration-300">
          <div className="h-1 w-full bg-gradient-to-r from-blue-200 to-indigo-200 rounded-md" />
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 text-center">
              Welcome back 👋
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 animate-fadeIn"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <Input
                  placeholder="your@email.com"
                  type="email"
                  className={`input-focus ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    className={`input-focus pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-2.5 transition-all flex items-center justify-center shadow-lg cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              {/* Links */}
              <div className="flex justify-between items-center text-sm mt-3">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-blue-600 hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="text-gray-600 hover:underline transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
