"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { toggleLike, type LikeState } from "./likeActions";

export default function LikeButton({
  projectId,
  initialLiked,
  initialCount,
  isLoggedIn = false,
}: {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn?: boolean;
}) {
  const action = toggleLike.bind(null, projectId);
  const [state, formAction, isPending] = useActionState<LikeState, FormData>(
    action,
    { liked: initialLiked, count: initialCount }
  );
  const [shaking, setShaking] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNotLoggedIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShaking(true);
    setShowPopover(true);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setShowPopover(false), 3000);
  }

  useEffect(() => {
    if (!shaking) return;
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [shaking]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    if (showPopover) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          onClick={!isLoggedIn ? handleNotLoggedIn : undefined}
          className={`flex items-center gap-1 text-xs font-bold hover:scale-110 transition-transform disabled:opacity-50 ${shaking ? "shake" : ""}`}
          aria-label={state.liked ? "Unlike" : "Like"}
        >
          <Heart size={13} className={state.liked ? "fill-black" : ""} />
          {state.count}
        </button>
      </form>

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap border border-black bg-[#f2f0ea] px-3 py-2 text-xs font-bold z-10"
        >
          <a href="/login" className="underline hover:opacity-70">Sign in</a> to like this
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
}
