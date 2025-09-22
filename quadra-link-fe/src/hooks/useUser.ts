'use client';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getToken } from '@/services/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch profile
  const fetchUser = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/users/me`, {
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

  // update user profile
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error(`Failed to update user (${res.status})`);
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // delete user account
  const deleteUser = async () => {
    if (!user) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete user (${res.status})`);
      }

      setUser(null); // clear user after deletion
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, setUser, fetchUser, updateUser, deleteUser };
}
