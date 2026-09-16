import { requireAdmin } from "@/lib/auth";
import { db, type Post } from "@/lib/db";
import { Editor } from "@/components/forms";
import { notFound } from "next/navigation";
import Link from "next/link";
export const metadata = {
  title: "编辑文章",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireAdmin();
  const { id } = await searchParams;
  const post = id
    ? ((await db.execute({ sql: "SELECT * FROM posts WHERE id=?", args: [id] }))
        .rows[0] as unknown as Post)
    : undefined;
  if (id && !post) notFound();
  return (
    <section className="admin narrow">
      <Link href="/admin">← 工作台</Link>
      <h1>{post ? "打磨你的想法" : "写下新的灵感"}</h1>
      <Editor post={post ? { ...post } : undefined} />
    </section>
  );
}
