"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { MonetizationStatus } from "@/app/types";

export async function submitProject(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  const link = formData.get("link") as string;
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const thumbnail = (formData.get("thumbnail") as string | null) || null;
  const monetizationStatus = (formData.get("monetizationStatus") as MonetizationStatus) ?? "NOT_MONETIZED";

  if (!link || !title) return;

  let authorId: string;
  let featured = false;

  if (isAdmin) {
    // Auto-feature and attribute to the @vibegallery curator account
    const curator = await prisma.user.upsert({
      where: { username: "vibegallery" },
      update: {},
      create: {
        id: crypto.randomUUID(),
        username: "vibegallery",
        claimed: false,
      },
    });
    authorId = curator.id;
    featured = true;
  } else {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        username: user.email?.split("@")[0] ?? user.id.slice(0, 8),
      },
    });
    authorId = user.id;
  }

  await prisma.project.create({
    data: { link, title, description, thumbnail, monetizationStatus, featured, authorId },
  });

  revalidatePath("/");
  redirect("/");
}
