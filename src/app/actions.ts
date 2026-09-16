"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { db, postBySlug } from "@/lib/db";
import { passwordMatches, requireAdmin, startSession } from "@/lib/auth";
import { postSchema, commentSchema } from "@/lib/validation";
export type Result = { error?: string; success?: string };
async function limited(key: string, max: number, seconds: number) {
  const now = Date.now();
  const r = await db.execute({
    sql: "INSERT INTO limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END RETURNING count",
    args: [key, now + seconds * 1000, now, now],
  });
  return Number(r.rows[0].count) > max;
}
export async function login(_: Result, data: FormData): Promise<Result> {
  if (await limited("admin-login", 15, 300))
    return { error: "尝试次数过多，请 5 分钟后重试" };
  if (!passwordMatches(String(data.get("password") || "")))
    return { error: "密码错误或管理员尚未配置" };
  await startSession();
  redirect("/admin");
}
export async function logout() {
  (await cookies()).delete("inkstone-session");
  redirect("/");
}
export async function savePost(_: Result, data: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = postSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;
  const collision = await postBySlug(p.slug, true);
  if (collision && collision.id !== p.id)
    return { error: "这个文章链接已被使用" };
  const now = new Date().toISOString();
  try {
    if (p.id) {
      await db.execute({
        sql: "UPDATE posts SET slug=?,title=?,excerpt=?,content=?,category=?,tags=?,published=?,updated_at=? WHERE id=?",
        args: [
          p.slug,
          p.title,
          p.excerpt,
          p.content,
          p.category,
          p.tags,
          Number(p.published),
          now,
          p.id,
        ],
      });
    } else {
      await db.execute({
        sql: "INSERT INTO posts VALUES (?,?,?,?,?,?,?,?,?,?)",
        args: [
          randomUUID(),
          p.slug,
          p.title,
          p.excerpt,
          p.content,
          p.category,
          p.tags,
          Number(p.published),
          now,
          now,
        ],
      });
    }
  } catch {
    return { error: "保存失败，请检查文章链接是否重复后重试" };
  }
  revalidatePath("/", "layout");
  redirect("/admin?saved=1");
}
export async function deletePost(data: FormData) {
  await requireAdmin();
  const id = String(data.get("id"));
  await db.batch(
    [
      { sql: "DELETE FROM comments WHERE post_id=?", args: [id] },
      { sql: "DELETE FROM posts WHERE id=?", args: [id] },
    ],
    "write",
  );
  revalidatePath("/", "layout");
}
export async function comment(_: Result, data: FormData): Promise<Result> {
  if (data.get("website")) return { success: "评论已提交，审核后显示" };
  const parsed = commentSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "请填写昵称和 2–2000 字的评论" };
  const p = await postBySlug(parsed.data.slug);
  if (!p) return { error: "文章不存在" };
  if (await limited("comments-global", 30, 60))
    return { error: "评论提交较多，请稍后重试" };
  await db.execute({
    sql: "INSERT INTO comments VALUES (?,?,?,?,0,?)",
    args: [
      randomUUID(),
      p.id,
      parsed.data.name,
      parsed.data.body,
      new Date().toISOString(),
    ],
  });
  return { success: "评论已提交，审核后显示" };
}
export async function moderate(data: FormData) {
  await requireAdmin();
  const id = String(data.get("id"));
  await db.execute({
    sql:
      data.get("decision") === "approve"
        ? "UPDATE comments SET approved=1 WHERE id=?"
        : "DELETE FROM comments WHERE id=?",
    args: [id],
  });
  revalidatePath("/", "layout");
}
