import { posts, siteUrl } from "@/lib/db";
import { xml } from "@/lib/xml";
export const dynamic = "force-dynamic";
export async function GET() {
  const all = await posts();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>墨石 Inkstone</title><link>${xml(siteUrl)}</link><description>记录思考，分享创造</description><language>zh-cn</language>${all.map((p) => `<item><title>${xml(p.title)}</title><link>${xml(siteUrl + "/posts/" + p.slug)}</link><guid>${xml(siteUrl + "/posts/" + p.slug)}</guid><description>${xml(p.excerpt)}</description><pubDate>${new Date(p.created_at).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
