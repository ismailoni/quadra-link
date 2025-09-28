'use client';
import { useEffect } from 'react';
import type { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type ApiFetchOptions } from '@/lib/api';

export function useUser() {
  const { user, setUser, loading, error, token, fetchUser, logout } = useAuth();

  // Ensure we only fetch once globally (AuthProvider) and hydrate if token appears later
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  const updateUser = async (updates: Partial<User> | FormData, opts: ApiFetchOptions = {}) => {
    if (!user) return;
    const isFormData = updates instanceof FormData;
    const updated = await apiFetch<User>(`/users/${user.id}`, {
      method: 'PATCH',
      body: isFormData ? updates : JSON.stringify(updates),
      headers: isFormData ? undefined : { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      dedupe: false,
      timeoutMs: opts.timeoutMs ?? 20_000,
      signal: opts.signal,
    });
    setUser(updated);
    return updated;
  };

  const deleteUser = async (opts: ApiFetchOptions = {}) => {
    if (!user) return;
    await apiFetch(`/users/${user.id}`, { method: 'DELETE', dedupe: false, timeoutMs: opts.timeoutMs ?? 20_000, signal: opts.signal });
    setUser(null);
    logout();
    return true;
  };

  return { user, loading, error, setUser, fetchUser, updateUser, deleteUser };
}
