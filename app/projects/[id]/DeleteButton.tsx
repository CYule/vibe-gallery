"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProject } from "./actions";

export default function DeleteButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    startTransition(() => deleteProject(projectId));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 border border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-[#f2f0ea] transition-colors disabled:opacity-40"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
