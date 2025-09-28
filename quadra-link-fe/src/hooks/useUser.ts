'use client';
import { useEffect } from 'react';
import type { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export function useUser() {
  const { user, setUser, loading, error, token, fetchUser, logout } = useAuth();

  // Ensure we only fetch once globally (AuthProvider) and hydrate if token appears later
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = await apiFetch<User>(`/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setUser(updatedUser);
    return updatedUser;
  };

  const deleteUser = async () => {
    if (!user) return;
    await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
    setUser(null);
    logout();
    return true;
  };

  return { user, loading, error, setUser, fetchUser, updateUser, deleteUser };
}
