import type { MetadataRoute } from "next";
import { posts, siteUrl } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: siteUrl },
    { url: siteUrl + "/about" },
    { url: siteUrl + "/archive" },
    ...(await posts()).map((p) => ({
      url: siteUrl + "/posts/" + p.slug,
      lastModified: p.updated_at,
    })),
  ];
}
