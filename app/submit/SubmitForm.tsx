"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, ExternalLink, Star } from "lucide-react";
import { submitProject } from "./actions";

type OGPreview = {
  title: string | null;
  description: string | null;
  image: string | null;
};

const STATUS_OPTIONS = [
  { value: "NOT_MONETIZED", label: "Not Monetized" },
  { value: "TRYING", label: "Trying to Monetize" },
  { value: "MONETIZED_SELF_REPORTED", label: "Monetized (Self-reported)" },
];

export default function SubmitForm({ isAdmin }: { isAdmin: boolean }) {
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState<OGPreview | null>(null);
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
    setPreview(null);

    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Could not fetch URL");
      const data: OGPreview = await res.json();

      setPreview(data);
      if (data.title && titleRef.current && !titleRef.current.value) {
        titleRef.current.value = data.title;
      }
      if (data.description && descRef.current && !descRef.current.value) {
        descRef.current.value = data.description;
      }
    } catch {
      setFetchError("Couldn't fetch page details. Fill in the fields manually.");
    } finally {
      setFetching(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (preview?.image) fd.set("thumbnail", preview.image);
    startTransition(() => submitProject(fd));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Admin notice */}
      {isAdmin && (
        <div className="flex items-center gap-2 border border-black bg-black text-[#f2f0ea] px-4 py-2.5">
          <Star size={13} fill="currentColor" />
          <p className="text-xs font-black uppercase tracking-widest">
            Admin — will be auto-featured under @vibegallery
          </p>
        </div>
      )}

      {/* URL field + fetch button */}
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
            placeholder="https://yourproject.com"
            className="flex-1 border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="button"
            onClick={handleFetchPreview}
            disabled={fetching}
            className="border border-black px-4 py-2 text-sm font-bold flex items-center gap-1.5 hover:bg-black hover:text-[#f2f0ea] transition-colors disabled:opacity-40"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            {fetching ? "Fetching…" : "Fetch Details"}
          </button>
        </div>
        {fetchError && (
          <p className="text-xs font-medium text-red-700">{fetchError}</p>
        )}
      </div>

      {/* Thumbnail preview */}
      {preview?.image && (
        <div className="border border-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.image} alt="Preview" className="w-full aspect-video object-cover" />
          <input type="hidden" name="thumbnail" value={preview.image} />
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
          placeholder="My Vibe Project"
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">Description</label>
        <textarea
          ref={descRef}
          name="description"
          rows={3}
          placeholder="What does it do? Who's it for?"
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
      </div>

      {/* Monetization status */}
      <div className="space-y-1">
        <label className="block text-sm font-bold uppercase tracking-wide">
          Monetization Status
        </label>
        <select
          name="monetizationStatus"
          defaultValue="NOT_MONETIZED"
          className="w-full border border-black px-3 py-2 text-sm font-medium bg-[#f2f0ea] focus:outline-none focus:ring-1 focus:ring-black"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="border border-black px-8 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-[#f2f0ea] transition-colors disabled:opacity-40 flex items-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isPending ? "Submitting…" : "Submit Project"}
      </button>
    </form>
  );
}
