import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import SubmitForm from "./SubmitForm";

export default async function SubmitPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="space-y-8 pt-8">
      <div className="border-b border-black pb-4">
        <h1 className="text-4xl font-black tracking-tight">Submit a Project</h1>
        <p className="text-sm font-medium opacity-60 mt-1">
          Paste your URL and we&apos;ll pull the details automatically.
        </p>
      </div>
      <SubmitForm isAdmin={isAdmin} />
    </div>
  );
}
