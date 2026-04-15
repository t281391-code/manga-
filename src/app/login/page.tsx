"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMessage(data.message || "");

    if (data.success) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="page-shell flex min-h-[88vh] items-center justify-center">
      <section className="panel w-full max-w-md p-7">
        <span className="badge bg-emerald-100 text-emerald-800">Welcome back</span>
        <h1 className="mt-4 text-3xl font-black">Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Use your account to continue reading manga.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="field"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="field"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="btn btn-primary w-full">Login</button>
        </form>

        {message && <p className="mt-4 text-sm font-semibold text-emerald-800">{message}</p>}
      </section>
    </main>
  );
}
