import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/app/components/ProjectCard";
import { ExternalLink, Heart, ArrowLeft } from "lucide-react";

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
  const project = await getProject(id);

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto pt-8 space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Gallery
      </Link>

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
          <span className="flex items-center gap-1 text-sm font-bold">
            <Heart size={13} />
            {project._count.likes}
          </span>
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
