import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginCredentials = { email: string; password: string };
export type AuthResponse = { token: string };

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/auth/login`,
    credentials
  );
  return response.data;
}

export function getToken(): string | null {
  return localStorage.getItem("authToken");
}


export function logout(): void {
  localStorage.removeItem("authToken");
}