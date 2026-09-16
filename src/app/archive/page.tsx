import Link from "next/link";
import { posts } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "文章归档" };
export default async function Page() {
  const all = await posts();
  const years = [...new Set(all.map((p) => p.created_at.slice(0, 4)))];
  return (
    <section className="admin narrow">
      <div className="eyebrow">THE ARCHIVE</div>
      <h1>沿着时间，重读生活。</h1>
      <p className="muted">共 {all.length} 篇文章，每一次记录都有迹可循。</p>
      {years.map((y) => (
        <section key={y}>
          <h2>{y}</h2>
          {all
            .filter((p) => p.created_at.startsWith(y))
            .map((p) => (
              <Link
                className="archive-row"
                href={`/posts/${p.slug}`}
                key={p.id}
              >
                <time>{p.created_at.slice(5, 10)}</time>
                <strong>{p.title}</strong>
                <span>↗</span>
              </Link>
            ))}
        </section>
      ))}
    </section>
  );
}
