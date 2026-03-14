import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { MonetizationStatus } from "@prisma/client";
import ProjectCard from "./components/ProjectCard";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";

async function getProjects(q?: string, statuses?: string[]) {
  return prisma.project.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { author: { username: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(statuses && statuses.length > 0
        ? { monetizationStatus: { in: statuses as MonetizationStatus[] } }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { username: true } },
      _count: { select: { likes: true } },
    },
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string | string[] }>;
}) {
  const { q, status } = await searchParams;
  const statuses = status ? (Array.isArray(status) ? status : [status]) : [];
  const isFiltering = !!q || statuses.length > 0;

  const projects = await getProjects(q, statuses);
  const featured = isFiltering ? [] : projects.filter((p) => p.featured);
  const rest = isFiltering ? projects : projects.filter((p) => !p.featured);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-8 pb-4 border-b border-black">
        <h1 className="text-5xl font-black leading-tight tracking-tight mb-3">
          Discover Vibe-Coded Projects
        </h1>
        <p className="text-lg font-medium max-w-xl">
          A gallery of projects built by indie hackers. Share what you&apos;re building with the community.
        </p>
      </section>

      {/* Search + filters */}
      <section className="space-y-3">
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense>
          <FilterBar />
        </Suspense>
      </section>

      {projects.length === 0 ? (
        <EmptyState isFiltering={isFiltering} />
      ) : (
        <>
          {/* Featured section */}
          {featured.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">
                Featured
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* All / Latest / Results section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest opacity-50">
                {isFiltering
                  ? "Results"
                  : featured.length > 0
                  ? "Latest"
                  : "All Projects"}
                <span className="ml-2 font-medium">
                  ({isFiltering ? projects.length : rest.length || projects.length})
                </span>
              </h2>
              <a
                href="/submit"
                className="text-sm font-bold border border-black px-4 py-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors"
              >
                + Submit Project
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isFiltering ? projects : featured.length > 0 ? rest : projects).map(
                (project) => (
                  <ProjectCard key={project.id} project={project} />
                )
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function EmptyState({ isFiltering }: { isFiltering: boolean }) {
  return (
    <div className="border border-black border-dashed py-20 flex flex-col items-center gap-4 text-center">
      {isFiltering ? (
        <>
          <p className="text-2xl font-black">No results found.</p>
          <p className="text-sm font-medium opacity-60 max-w-xs">
            Try a different search or clear the filters.
          </p>
          <a
            href="/"
            className="text-sm font-bold border border-black px-6 py-2 hover:bg-black hover:text-[#f2f0ea] transition-colors"
          >
            Clear search
          </a>
        </>
      ) : (
        <>
          <p className="text-2xl font-black">No projects yet.</p>
          <p className="text-sm font-medium opacity-60 max-w-xs">
            Be the first to share what you&apos;re building.
          </p>
          <a
            href="/submit"
            className="text-sm font-bold border border-black px-6 py-2 hover:bg-black hover:text-[#f2f0ea] transition-colors"
          >
            + Submit the first project
          </a>
        </>
      )}
    </div>
  );
}
