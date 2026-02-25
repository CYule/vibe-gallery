"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function claimProfile(ghostId: string, username: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/profiles/${username}`);

  // Double-check the profile is still unclaimed
  const ghost = await prisma.user.findUnique({ where: { id: ghostId } });
  if (!ghost || ghost.claimed) return;

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });

  await prisma.$transaction(async (tx) => {
    if (!existingUser) {
      // Fresh account — take the ghost's identity
      await tx.user.create({
        data: {
          id: user.id,
          username: ghost.username,
          avatarUrl: ghost.avatarUrl,
          bio: ghost.bio,
          claimed: true,
        },
      });
    }
    // else: user already has an account — just absorb the ghost's content

    // Reassign all projects and likes from the ghost to the real user
    await tx.project.updateMany({
      where: { authorId: ghost.id },
      data: { authorId: user.id },
    });

    // Skip likes that would create a duplicate (same user + project)
    const ghostLikes = await tx.like.findMany({ where: { userId: ghost.id } });
    for (const like of ghostLikes) {
      const duplicate = existingUser
        ? await tx.like.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: like.projectId } },
          })
        : null;
      if (!duplicate) {
        await tx.like.update({
          where: { id: like.id },
          data: { userId: user.id },
        });
      } else {
        await tx.like.delete({ where: { id: like.id } });
      }
    }

    await tx.user.delete({ where: { id: ghost.id } });
  });

  revalidatePath(`/profiles/${username}`);
  redirect(`/profiles/${existingUser ? existingUser.username : username}`);
}
