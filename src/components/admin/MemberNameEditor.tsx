"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MemberNameEditor({
  memberId,
  initialName,
}: {
  memberId: string;
  initialName: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [value, setValue] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (value === (initialName ?? "")) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: value }).eq("id", memberId);
    setSaving(false);
    router.refresh();
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={saving}
      placeholder="填入姓名"
      className="w-32 border border-line bg-surface px-2 py-1 font-body text-sm disabled:opacity-50"
    />
  );
}
