"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountAuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  async function handleGoogleLogin() {
    setMessage(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next || "/account"
        )}`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "signup") {
      setMessage("註冊成功，請至信箱完成驗證。");
    } else if (next) {
      router.push(next);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-6 font-mono text-xs tracking-wide2">
        <button
          onClick={() => setMode("login")}
          className={mode === "login" ? "text-brass" : "text-muted"}
        >
          登入
        </button>
        <button
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-brass" : "text-muted"}
        >
          註冊
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mb-6 flex w-full items-center justify-center gap-2 border border-line bg-surface px-6 py-3 font-body text-sm hover:border-brass"
      >
        <GoogleIcon />
        使用 Google 帳號登入
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="font-mono text-xs text-muted">或使用 Email</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
        />
        <input
          type="password"
          required
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line bg-surface px-4 py-3 font-body text-sm focus:border-brass"
        />
        {message && <p className="font-body text-sm text-muted">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-walnut px-6 py-3 font-body text-sm tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
        >
          {loading ? "處理中…" : mode === "login" ? "登入" : "註冊"}
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.6 2.5-7.4 2.5-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.3C40.9 36.4 44 30.8 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
