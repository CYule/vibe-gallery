import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") as "github" | "google";
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const origin = req.nextUrl.origin;

  if (!provider || !["github", "google"].includes(provider)) {
    return NextResponse.redirect(`${origin}/login?error=invalid_provider`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(data.url);
}
