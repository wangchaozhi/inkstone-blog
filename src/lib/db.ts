import { createClient } from "@libsql/client";
export function database() {
  const url = process.env.TURSO_DATABASE_URL || "file:blog.db";
  if (process.env.VERCEL && !url.startsWith("libsql://"))
    throw new Error("Vercel requires a remote Turso database");
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}
export const db = database();
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  published: number;
  created_at: string;
  updated_at: string;
};
export async function posts(all = false): Promise<Post[]> {
  const r = await db.execute(
    all
      ? "SELECT * FROM posts ORDER BY created_at DESC"
      : "SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC",
  );
  return r.rows as unknown as Post[];
}
export async function postBySlug(
  slug: string,
  all = false,
): Promise<Post | undefined> {
  const r = await db.execute({
    sql: `SELECT * FROM posts WHERE slug=? ${all ? "" : "AND published=1"}`,
    args: [slug],
  });
  return r.rows[0] as unknown as Post | undefined;
}
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
