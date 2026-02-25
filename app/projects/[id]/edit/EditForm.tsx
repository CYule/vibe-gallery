"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { updateProject } from "../actions";
import { MonetizationStatus } from "@prisma/client";

type Project = {
  id: string;
  title: string;
  description: string | null;
  link: string;
  thumbnail: string | null;
  monetizationStatus: MonetizationStatus;
};

const STATUS_OPTIONS = [
  { value: "NOT_MONETIZED", label: "Not Monetized" },
  { value: "TRYING", label: "Trying to Monetize" },
  { value: "MONETIZED_SELF_REPORTED", label: "Monetized (Self-reported)" },
];

export default function EditForm({ project }: { project: Project }) {
  const [thumbnail, setThumbnail] = useState(project.thumbnail ?? "");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  async function handleFetchPreview() {
    const url = linkRef.current?.value.trim();
    if (!url) return;
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.title && titleRef.current) titleRef.current.value = data.title;
      if (data.description && descRef.current) descRef.current.value = data.description;
      if (data.image) setThumbnail(data.image);
    } catch {
      setFetchError("Couldn't fetch page details.");
    } finally {
      setFetching(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("thumbnail", thumbnail);
    startTransition(() => updateProject(project.id, fd));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* URL */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">
          Project URL *
        </label>
        <div className="flex gap-2">
          <input
            ref={linkRef}
            name="link"
            type="url"
            required
            defaultValue={project.link}
            className="flex-1 border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="button"
            onClick={handleFetchPreview}
            disabled={fetching}
            className="border border-black px-4 py-2 text-sm font-bold flex items-center gap-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors disabled:opacity-40"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {fetching ? "Fetching…" : "Re-fetch"}
          </button>
        </div>
        {fetchError && <p className="text-xs font-medium text-red-700">{fetchError}</p>}
      </div>

      {/* Thumbnail preview */}
      {thumbnail && (
        <div className="border border-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="Thumbnail" className="w-full aspect-video object-cover" />
          <div className="flex items-center justify-between px-3 py-2 border-t border-black">
            <span className="text-xs font-medium opacity-50 truncate">{thumbnail}</span>
            <button
              type="button"
              onClick={() => setThumbnail("")}
              className="text-xs font-bold hover:underline shrink-0 ml-2"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">Title *</label>
        <input
          ref={titleRef}
          name="title"
          type="text"
          required
          defaultValue={project.title}
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">Description</label>
        <textarea
          ref={descRef}
          name="description"
          rows={3}
          defaultValue={project.description ?? ""}
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
      </div>

      {/* Monetization status */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">
          Monetization Status
        </label>
        <select
          name="monetizationStatus"
          defaultValue={project.monetizationStatus}
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] focus:outline-none focus:ring-1 focus:ring-black"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="border border-black px-8 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-[#f2f0ea] transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? "Saving…" : "Save Changes"}
        </button>
        <a
          href={`/projects/${project.id}`}
          className="text-sm font-bold opacity-50 hover:opacity-100 hover:underline"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
