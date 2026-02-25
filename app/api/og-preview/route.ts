import { NextRequest, NextResponse } from "next/server";
import { scrapeOG } from "@/lib/og";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const data = await scrapeOG(url);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 });
  }
}
