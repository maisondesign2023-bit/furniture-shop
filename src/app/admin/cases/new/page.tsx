import CaseStudyForm from "@/components/admin/CaseStudyForm";

export default function NewCaseStudyPage() {
  return (
    <div>
      <h1 className="font-display text-2xl italic text-walnut">新增案例</h1>
      <div className="mt-8">
        <CaseStudyForm />
      </div>
    </div>
  );
}
