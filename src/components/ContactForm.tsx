"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const { error: insertError } = await supabase.from("contact_messages").insert({
      first_name: form.get("first_name"),
      last_name: form.get("last_name") || null,
      email: form.get("email"),
      phone: form.get("phone") || null,
      message: form.get("message"),
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDone(true);
    (e.target as HTMLFormElement).reset();
  }

  if (done) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-display text-lg italic text-walnut">已收到你的訊息</p>
        <p className="mt-2 font-body text-sm text-muted">
          我們會盡快與你聯繫，謝謝你的預約諮詢。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-body text-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">名字</span>
          <input name="first_name" required className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">姓氏</span>
          <input name="last_name" className="input" />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">Email *</span>
          <input name="email" type="email" required className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-xs text-muted">電話</span>
          <input name="phone" className="input" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block font-mono text-xs text-muted">訊息 *</span>
        <textarea name="message" required rows={5} className="input" />
      </label>

      {error && <p className="text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-walnut px-8 py-3 tracking-wide2 text-surface hover:bg-brass disabled:opacity-50"
      >
        {submitting ? "送出中…" : "送出"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #dad4c8;
          background: #f8f6f2;
          padding: 0.75rem 1rem;
        }
        .input:focus {
          border-color: #9c7a4f;
          outline: none;
        }
      `}</style>
    </form>
  );
}
