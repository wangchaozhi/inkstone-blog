import { siteUrl } from "@/lib/db";
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login"] },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
