import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EditForm from "./EditForm";
import { ArrowLeft } from "lucide-react";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, supabase] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    createSupabaseServerClient(),
  ]);

  if (!project) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/projects/${id}/edit`);

  const isOwner = project.authorId === user.id;
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  if (!isOwner && !isAdmin) redirect(`/projects/${id}`);

  return (
    <div className="max-w-3xl mx-auto pt-8 space-y-8">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Project
      </Link>

      <div className="border-b border-black pb-4">
        <h1 className="text-4xl font-black tracking-tight">Edit Project</h1>
        <p className="text-sm font-medium opacity-60 mt-1">{project.title}</p>
      </div>

      <EditForm project={project} />
    </div>
  );
}
