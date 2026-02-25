import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProjectCard from "@/app/components/ProjectCard";
import { claimProfile } from "./actions";
import { ArrowLeft, UserCheck } from "lucide-react";

async function getProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { username: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile, supabase] = await Promise.all([
    getProfile(username),
    createSupabaseServerClient(),
  ]);

  if (!profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Don't show the claim banner to the person who already owns this profile
  const isOwner = user?.id === profile.id;
  const showClaimBanner = !profile.claimed && !isOwner;

  return (
    <div className="pt-8 space-y-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Gallery
      </Link>

      {/* Claim banner */}
      {showClaimBanner && (
        <div className="border border-black border-dashed p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-black text-base">Is this you?</p>
            <p className="text-sm font-medium opacity-60">
              This profile was created by the gallery. Claim it to take ownership
              of your projects.
            </p>
          </div>
          {user ? (
            <form
              action={async () => {
                "use server";
                await claimProfile(profile.id, profile.username);
              }}
            >
              <button
                type="submit"
                className="shrink-0 flex items-center gap-2 border border-black px-5 py-2.5 text-sm font-bold hover:bg-black hover:text-[#f2f0ea] transition-colors"
              >
                <UserCheck size={15} />
                Claim this profile
              </button>
            </form>
          ) : (
            <Link
              href={`/login?next=/profiles/${username}`}
              className="shrink-0 flex items-center gap-2 border border-black px-5 py-2.5 text-sm font-bold hover:bg-black hover:text-[#f2f0ea] transition-colors"
            >
              <UserCheck size={15} />
              Sign in to claim
            </Link>
          )}
        </div>
      )}

      {/* Profile header */}
      <div className="flex items-start gap-6 border-b border-black pb-8">
        <Avatar username={profile.username} avatarUrl={profile.avatarUrl} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">
              @{profile.username}
            </h1>
            {!profile.claimed && (
              <span className="text-xs font-black uppercase tracking-widest border border-black/30 px-2 py-0.5 opacity-40">
                Unclaimed
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="text-base font-medium opacity-70 max-w-md">
              {profile.bio}
            </p>
          )}
          <p className="text-sm font-bold opacity-50">
            {profile.projects.length}{" "}
            {profile.projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>

      {/* Projects grid */}
      <section>
        <h2 className="text-xl font-black mb-6 uppercase tracking-wide">
          Vibe Portfolio
        </h2>
        {profile.projects.length === 0 ? (
          <p className="text-sm font-medium opacity-50 border border-dashed border-black p-8 text-center">
            No projects yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Avatar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="w-16 h-16 border border-black object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-16 h-16 border border-black bg-[#8a9a88] flex items-center justify-center shrink-0">
      <span className="text-xl font-black">{username[0].toUpperCase()}</span>
    </div>
  );
}
