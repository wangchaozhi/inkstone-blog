import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, posts } from "@/lib/db";
import { logout, moderate } from "@/app/actions";
import { DeleteButton } from "@/components/forms";
export const metadata = {
  title: "写作工作台",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  await requireAdmin();
  const all = await posts(true);
  const comments = await db.execute(
    "SELECT comments.*,posts.title FROM comments JOIN posts ON posts.id=comments.post_id ORDER BY comments.created_at DESC LIMIT 100",
  );
  return (
    <section className="admin">
      <div className="section-line">
        <div>
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h1>写作工作台</h1>
        </div>
        <form action={logout}>
          <button className="secondary">退出登录</button>
        </form>
      </div>
      <div className="stats">
        <div>
          <strong>{all.length}</strong>全部文章
        </div>
        <div>
          <strong>{all.filter((p) => p.published).length}</strong>已发布
        </div>
        <div>
          <strong>{all.filter((p) => !p.published).length}</strong>草稿
        </div>
        <div>
          <strong>{comments.rows.filter((c) => !c.approved).length}</strong>
          待审核（最近 100 条）
        </div>
      </div>
      <div className="section-line">
        <h2>文章管理</h2>
        <Link className="button" href="/admin/editor">
          ＋ 写新文章
        </Link>
      </div>
      <div className="manage-list">
        {all.map((p) => (
          <div className="manage-row" key={p.id}>
            <div>
              <Link href={`/admin/editor?id=${p.id}`}>{p.title}</Link>
              <small>
                {p.published ? "已发布" : "草稿"} · {p.category} ·{" "}
                {p.updated_at.slice(0, 10)}
              </small>
            </div>
            <div className="row-actions">
              <Link href={`/admin/editor?id=${p.id}`}>编辑</Link>
              {!!p.published && <Link href={`/posts/${p.slug}`}>查看</Link>}
              <DeleteButton id={p.id} />
            </div>
          </div>
        ))}
      </div>
      <h2>评论审核</h2>
      {!comments.rows.length && <p className="muted">暂时还没有评论。</p>}
      {comments.rows.map((c) => (
        <div className="comment" key={String(c.id)}>
          <strong>{String(c.name)}</strong>
          <small>
            {" "}
            · {String(c.title)} · {c.approved ? "已通过" : "待审核"}
          </small>
          <p>{String(c.body)}</p>
          <form action={moderate} className="row-actions">
            <input type="hidden" name="id" value={String(c.id)} />
            {!c.approved && (
              <button name="decision" value="approve">
                通过审核
              </button>
            )}
            <button className="secondary" name="decision" value="delete">
              删除评论
            </button>
          </form>
        </div>
      ))}
    </section>
  );
}
