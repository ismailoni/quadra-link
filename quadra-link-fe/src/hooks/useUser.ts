'use client';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getToken } from '@/services/auth';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        console.log(`"Auth token being sent:", ${token}`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            setUser(null); // not logged in
          } else {
            throw new Error(`Error: ${res.status}`);
          }
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
