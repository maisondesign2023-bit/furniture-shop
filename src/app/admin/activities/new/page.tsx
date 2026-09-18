import ActivityForm from "@/components/admin/ActivityForm";

export const runtime = "edge";

export default function NewActivityPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-walnut">新增活動</h1>
      <div className="mt-8">
        <ActivityForm />
      </div>
    </div>
  );
}
