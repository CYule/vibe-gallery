export type OGData = {
  title: string | null;
  description: string | null;
  image: string | null;
};

export async function scrapeOG(url: string): Promise<OGData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VibeGalleryBot/1.0; +https://vibegallery.app)",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) return { title: null, description: null, image: null };

  const html = await res.text();

  const getMeta = (property: string) => {
    // Match both property and name attributes, and both content orders
    const patterns = [
      new RegExp(
        `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`,
        "i"
      ),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return null;
  };

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

  return {
    title: getMeta("title") ?? titleTag ?? null,
    description: getMeta("description"),
    image: getMeta("image"),
  };
}
