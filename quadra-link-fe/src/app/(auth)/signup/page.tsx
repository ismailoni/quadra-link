// src/app/signup/page.tsx
"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({
    school: "",
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Signup failed");
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <input
        type="text"
        name="school"
        placeholder="School"
        value={form.school}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="School Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password (min 6 chars)"
        value={form.password}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
        minLength={6}
      />
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Sign Up
      </button>
    </form>
  );
}
