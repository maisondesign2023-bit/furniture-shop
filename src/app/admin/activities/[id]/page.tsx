import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Activity } from "@/types";
import ActivityEditForm from "@/components/admin/ActivityEditForm";

export const runtime = "edge";

export default async function AdminActivityEditPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: activity } = await supabase.from("activities").select("*").eq("id", params.id).single();
  if (!activity) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">編輯活動</h1>
      <div className="mt-8">
        <ActivityEditForm activity={activity as Activity} />
      </div>
    </div>
  );
}
