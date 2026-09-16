import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db, postBySlug } from "@/lib/db";
import { CommentForm } from "@/components/forms";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await postBySlug((await params).slug);
  return p
    ? {
        title: p.title,
        description: p.excerpt,
        alternates: { canonical: `/posts/${p.slug}` },
        openGraph: { title: p.title, description: p.excerpt, type: "article" },
      }
    : { title: "文章不存在" };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await postBySlug((await params).slug);
  if (!p) notFound();
  const comments = await db.execute({
    sql: "SELECT name,body,created_at,id FROM comments WHERE post_id=? AND approved=1 ORDER BY created_at DESC",
    args: [p.id],
  });
  return (
    <article className="article-wrap">
      <Link className="muted" href="/">
        ← 返回文章
      </Link>
      <div className="post-meta">
        <span>{p.category}</span>
        <time>{p.created_at.slice(0, 10)}</time>
        <span>{Math.max(1, Math.ceil(p.content.length / 400))} 分钟阅读</span>
      </div>
      <h1>{p.title}</h1>
      <p className="lead">{p.excerpt}</p>
      <div className="author">
        <span className="avatar">墨</span>
        <div>
          墨石编辑部<small>记录思考，分享创造</small>
        </div>
      </div>
      <div className="prose">
        <Markdown remarkPlugins={[remarkGfm]}>{p.content}</Markdown>
      </div>
      <div className="tags">
        {p.tags
          .split(/[,，]/)
          .filter(Boolean)
          .map((t, i) => (
            <Link key={i} href={`/?q=${encodeURIComponent(t.trim())}`}>
              # {t.trim()}
            </Link>
          ))}
      </div>
      <section className="comments">
        <h2>
          交流与回响 <span className="count">{comments.rows.length}</span>
        </h2>
        {comments.rows.map((c) => (
          <div className="comment" key={String(c.id)}>
            <strong>{String(c.name)}</strong>
            <time>{String(c.created_at).slice(0, 10)}</time>
            <p>{String(c.body)}</p>
          </div>
        ))}
        <CommentForm slug={p.slug} />
      </section>
    </article>
  );
}
