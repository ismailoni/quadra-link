import { apiFetch } from "@/lib/api";

export type LoginCredentials = { email: string; password: string };
export type AuthResponse = { token: string };

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getToken(): string | null {
  return localStorage.getItem("authToken");
}

export function logout(): void {
  localStorage.removeItem("authToken");
}