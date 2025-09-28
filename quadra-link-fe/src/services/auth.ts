import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginCredentials = { email: string; password: string };
export type AuthResponse = { token: string };

export async function login(
  credentials: LoginCredentials,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials, {
    signal: opts.signal as any,
    timeout: opts.timeoutMs ?? 15000,
  });
  return res.data;
}

export const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const logout = (): void => {
  localStorage.removeItem("authToken");
};
