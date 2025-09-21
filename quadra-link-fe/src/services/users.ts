// src/services/users.ts
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

export function getUsers(): Promise<User[]> {
  return apiFetch("/users");
}

export function getUser(id: string): Promise<User> {
  return apiFetch(`/users/${id}`);
}

export function createUser(userData: Partial<User>): Promise<User> {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function updateUser(id: string, userData: Partial<User>): Promise<User> {
  return apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
}

export function updateUserAdmin(id: string, data: Partial<User>): Promise<User> {
  return apiFetch(`/users/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
