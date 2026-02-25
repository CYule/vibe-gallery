"use client";

import { useActionState } from "react";
import { Heart } from "lucide-react";
import { toggleLike, type LikeState } from "./likeActions";

export default function LikeButton({
  projectId,
  initialLiked,
  initialCount,
}: {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const action = toggleLike.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<LikeState, FormData>(
    action,
    { liked: initialLiked, count: initialCount }
  );

  return (
    // Stop propagation so clicking inside a <Link> card doesn't navigate
    <div onClick={(e) => e.stopPropagation()}>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1 text-xs font-bold hover:scale-110 transition-transform disabled:opacity-50"
          aria-label={state.liked ? "Unlike" : "Like"}
        >
          <Heart
            size={13}
            className={state.liked ? "fill-black" : ""}
          />
          {state.count}
        </button>
      </form>
    </div>
  );
}
