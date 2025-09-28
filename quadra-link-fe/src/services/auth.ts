import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    message: string;
    // Optionally add user info if returned by backend
}

export const login = async (
  credentials: LoginCredentials,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<AuthResponse> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials, {
    signal: opts.signal as any, // axios supports AbortController
    timeout: opts.timeoutMs ?? 15000,
  });
  return response.data;
};
export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};



export const logout = (): void => {
    localStorage.removeItem('authToken');
};
