"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type LikeState = { liked: boolean; count: number };

export async function toggleLike(
  projectId: string,
  prevState: LikeState,
  _formData: FormData
): Promise<LikeState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/projects/${projectId}`);

  // Ensure a User row exists
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      username: user.email?.split("@")[0] ?? user.id.slice(0, 8),
    },
  });

  const existing = await prisma.like.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    revalidatePath("/");
    return { liked: false, count: prevState.count - 1 };
  } else {
    await prisma.like.create({ data: { userId: user.id, projectId } });
    revalidatePath("/");
    return { liked: true, count: prevState.count + 1 };
  }
}
