import Link from "next/link";
import { posts } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const s = await searchParams;
  const all = await posts();
  const categories = [...new Set(all.map((p) => p.category))];
  const q = typeof s.q === "string" ? s.q.slice(0, 100) : "";
  const category = typeof s.category === "string" ? s.category : "";
  const filtered = all.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q ||
        `${p.title} ${p.excerpt} ${p.tags}`
          .toLowerCase()
          .includes(q.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.min(pages, Math.max(1, parseInt(s.page || "1") || 1));
  const visible = filtered.slice((page - 1) * 6, page * 6);
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          <span /> A DIGITAL GARDEN · 一座数字花园
        </div>
        <h1>
          把日常的灵感，
          <br />
          写成<span>长久的回响。</span>
        </h1>
        <p>
          关于技术、设计与生活的观察。
          <br />
          在这里记录思考，分享创造，也留下一点生长的痕迹。
        </p>
        <a className="hero-link" href="#articles">
          开始阅读 <span>↘</span>
        </a>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="hill h1" />
          <div className="hill h2" />
          <div className="art-caption">
            IDEAS TAKE ROOT.
            <br />
            STORIES GROW.
          </div>
          <span className="art-number">01 / ∞</span>
        </div>
      </section>
      <section id="articles" className="articles">
        <div className="section-line">
          <div>
            <div className="eyebrow">THE JOURNAL</div>
            <h2>
              最近的书写{" "}
              <span className="count">
                {all.length.toString().padStart(2, "0")}
              </span>
            </h2>
          </div>
          <form className="search" action="/">
            <input
              name="q"
              aria-label="搜索文章"
              placeholder="搜索文章、灵感…"
              defaultValue={q}
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <button aria-label="搜索" className="search-button">
              ⌕
            </button>
          </form>
        </div>
        <div className="filters">
          <Link
            className={!category ? "active" : ""}
            href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
          >
            全部文章
          </Link>
          {categories.map((c) => (
            <Link
              className={category === c ? "active" : ""}
              key={c}
              href={`/?category=${encodeURIComponent(c)}&q=${encodeURIComponent(q)}`}
            >
              {c}
            </Link>
          ))}
        </div>
        {q && (
          <p className="muted">
            “{q}” 的搜索结果 · {filtered.length} 篇{" "}
            <Link href="/">清除筛选</Link>
          </p>
        )}
        <div className="post-grid">
          {visible.map((p, i) => (
            <Link
              className={`post-card card-${i % 4}`}
              key={p.id}
              href={`/posts/${p.slug}`}
            >
              <div className="card-art" aria-hidden="true">
                <span className="art-word">
                  {["BUILD", "LESS", "CODE", "SLOW"][i % 4]}
                </span>
                <span className="card-index">
                  FIELD NOTES /{" "}
                  {String((page - 1) * 6 + i + 1).padStart(2, "0")}
                </span>
                <div className="card-shape" />
              </div>
              <div className="post-meta">
                <span>{p.category}</span>
                <time>{p.created_at.slice(0, 10).replaceAll("-", ".")}</time>
              </div>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
              <div className="read-line">
                {Math.max(1, Math.ceil(p.content.length / 400))} 分钟阅读{" "}
                <span>↗</span>
              </div>
            </Link>
          ))}
        </div>
        {!visible.length && (
          <div className="empty">
            <h3>还没有找到这片灵感</h3>
            <p>换个关键词，或者浏览全部文章。</p>
            <Link href="/">查看全部 →</Link>
          </div>
        )}
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => (
            <Link
              aria-current={page === i + 1 ? "page" : undefined}
              key={i}
              href={`/?page=${i + 1}&q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      </section>
      <section className="bottom-note">
        <span>保持好奇，保持记录。</span>
        <a href="/feed.xml">通过 RSS，订阅下一次灵感 ↗</a>
      </section>
    </>
  );
}
