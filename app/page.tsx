import { prisma } from "@/lib/prisma";
import ProjectCard from "./components/ProjectCard";

export const revalidate = 60;

async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { username: true } },
      _count: { select: { likes: true } },
    },
  });
}

export default async function HomePage() {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-8 pb-4 border-b border-black">
        <h1 className="text-5xl font-black leading-tight tracking-tight mb-3">
          Discover Vibe-Coded Projects
        </h1>
        <p className="text-lg font-medium max-w-xl">
          A gallery of projects built by indie hackers. See what&apos;s
          shipping, what&apos;s making money, and what&apos;s worth copying.
        </p>
      </section>

      {projects.length === 0 ? (
        <EmptyState />
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

          {/* All / Latest section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest opacity-50">
                {featured.length > 0 ? "Latest" : "All Projects"}
                <span className="ml-2 font-medium">({rest.length || projects.length})</span>
              </h2>
              <a
                href="/submit"
                className="text-sm font-bold border border-black px-4 py-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors"
              >
                + Submit Project
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(featured.length > 0 ? rest : projects).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-black border-dashed py-20 flex flex-col items-center gap-4 text-center">
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
    </div>
  );
}
