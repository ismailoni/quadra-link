// lib/api.ts
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  post: async <T>(endpoint: string, data: any, token?: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseBody = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = (responseBody && typeof responseBody === 'object' && 'message' in responseBody)
          ? (responseBody as any).message
          : (typeof responseBody === 'string' ? responseBody : 'Request failed');
        toast.error(message);
        throw new Error(message);
      }

      return responseBody as T;
    } catch (err: any) {
      const message = err?.message || 'Network error';
      toast.error(message);
      throw err;
    }
  },
};