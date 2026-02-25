import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { StatusBadge } from "@/app/components/ProjectCard";
import LikeButton from "@/app/components/LikeButton";
import DeleteButton from "./DeleteButton";
import { ExternalLink, ArrowLeft, Pencil } from "lucide-react";

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, bio: true, avatarUrl: true } },
      _count: { select: { likes: true } },
    },
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, supabase] = await Promise.all([
    getProject(id),
    createSupabaseServerClient(),
  ]);

  if (!project) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === project.authorId;
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;
  const canEdit = isOwner || isAdmin;

  const hasLiked = user
    ? !!(await prisma.like.findUnique({
        where: { userId_projectId: { userId: user.id, projectId: id } },
      }))
    : false;

  return (
    <div className="max-w-3xl mx-auto pt-8 space-y-8">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Gallery
        </Link>

        {/* Owner actions */}
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${id}/edit`}
              className="inline-flex items-center gap-1.5 border border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-[#f2f0ea] transition-colors"
            >
              <Pencil size={14} />
              Edit
            </Link>
            <DeleteButton projectId={id} />
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="relative w-full aspect-video border border-black overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Title + meta */}
      <div className="space-y-4 border-b border-black pb-6">
        <h1 className="text-4xl font-black tracking-tight leading-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            status={project.monetizationStatus}
            amount={project.verifiedAmount}
          />
          <LikeButton
            projectId={id}
            initialLiked={hasLiked}
            initialCount={project._count.likes}
          />
          <span className="text-sm font-medium opacity-50">
            {new Date(project.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {project.description && (
          <p className="text-base leading-relaxed">{project.description}</p>
        )}

        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-black px-5 py-2.5 text-sm font-bold hover:bg-black hover:text-[#f2f0ea] transition-colors"
        >
          <ExternalLink size={14} />
          Visit Project
        </a>
      </div>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">
            Submitted by
          </p>
          <Link
            href={`/profiles/${project.author.username}`}
            className="text-lg font-black hover:underline"
          >
            @{project.author.username}
          </Link>
          {project.author.bio && (
            <p className="text-sm font-medium opacity-60">{project.author.bio}</p>
          )}
        </div>
        <Link
          href={`/profiles/${project.author.username}`}
          className="text-sm font-bold border border-black px-4 py-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
