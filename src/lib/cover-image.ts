const imageExtensionPattern =
  /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractMetaImage(html: string, pageUrl: string) {
  const metaPattern =
    /<meta[^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["'][^>]*>/gi;

  for (const match of html.matchAll(metaPattern)) {
    const rawUrl = match[1] || match[2];

    if (rawUrl) {
      return new URL(decodeHtml(rawUrl), pageUrl).toString();
    }
  }

  return null;
}

export function isDirectImageUrl(url: string) {
  return imageExtensionPattern.test(url);
}

export async function normalizeCoverImageUrl(input?: string | null) {
  const url = input?.trim();

  if (!url) return null;
  if (isDirectImageUrl(url)) return url;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,image/*",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      return response.url || url;
    }

    const html = await response.text();
    return extractMetaImage(html, response.url || url) || url;
  } catch {
    return url;
  }
}
