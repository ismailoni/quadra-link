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

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
    // Store token in localStorage
    if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
};

export const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};



export const logout = (): void => {
    localStorage.removeItem('authToken');
};
