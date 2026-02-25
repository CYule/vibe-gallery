"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MonetizationStatus } from "@prisma/client";

async function authorise(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) redirect("/");

  const isOwner = project.authorId === user.id;
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  if (!isOwner && !isAdmin) redirect("/");

  return project;
}

export async function updateProject(projectId: string, formData: FormData) {
  await authorise(projectId);

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const link = formData.get("link") as string;
  const thumbnail = (formData.get("thumbnail") as string | null) || null;
  const monetizationStatus = formData.get("monetizationStatus") as MonetizationStatus;

  await prisma.project.update({
    where: { id: projectId },
    data: { title, description, link, thumbnail, monetizationStatus },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  await authorise(projectId);

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/");
  redirect("/");
}
