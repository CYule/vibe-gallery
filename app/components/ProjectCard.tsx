import { MonetizationStatus } from "@prisma/client";
import { Heart, BadgeCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  description: string | null;
  link: string;
  thumbnail: string | null;
  monetizationStatus: MonetizationStatus;
  verifiedAmount: number | null;
  featured: boolean;
  author: { username: string };
  _count: { likes: number };
};

const STATUS_LABELS: Record<MonetizationStatus, string> = {
  NOT_MONETIZED: "Not Monetized",
  TRYING: "Trying",
  MONETIZED_SELF_REPORTED: "Monetized",
  VERIFIED: "Verified",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="border border-black bg-[#8a9a88] flex flex-col hover:translate-y-[-2px] transition-transform"
    >
      {/* Featured badge */}
      {project.featured && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-black bg-black text-[#f2f0ea]">
          <Star size={11} fill="currentColor" />
          <span className="text-xs font-black uppercase tracking-widest">Featured</span>
        </div>
      )}

      {/* Thumbnail */}
      {project.thumbnail ? (
        <div className="relative w-full aspect-video border-b border-black overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-video border-b border-black bg-black/10 flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-black/40">
            No Preview
          </span>
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-bold text-base leading-tight">{project.title}</p>
          {project.description && (
            <p className="text-sm mt-1 leading-snug text-black/70 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/20">
          <StatusBadge
            status={project.monetizationStatus}
            amount={project.verifiedAmount}
          />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-bold">
              <Heart size={12} />
              {project._count.likes}
            </span>
            <span className="text-xs font-medium opacity-60">
              @{project.author.username}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function StatusBadge({
  status,
  amount,
}: {
  status: MonetizationStatus;
  amount: number | null;
}) {
  return (
    <span className="inline-flex items-center gap-1 border border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-[#f2f0ea]">
      {status === "VERIFIED" && <BadgeCheck size={11} />}
      {STATUS_LABELS[status]}
      {status === "VERIFIED" && amount != null && (
        <span className="ml-1 font-black">${amount.toLocaleString()}</span>
      )}
    </span>
  );
}
