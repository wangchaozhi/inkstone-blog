"use client";
import { useActionState, useState } from "react";
import { login, savePost, comment, deletePost } from "@/app/actions";
import type { Post } from "@/lib/db";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="stack">
      <label>
        管理员密码
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <p role="alert">{state.error}</p>
      <button disabled={pending}>
        {pending ? "正在登录…" : "进入工作台 →"}
      </button>
    </form>
  );
}
export function Editor({ post }: { post?: Post }) {
  const [state, action, pending] = useActionState(savePost, {});
  const [content, setContent] = useState(post?.content || "");
  const [preview, setPreview] = useState(false);
  return (
    <form action={action} className="stack editor">
      <input type="hidden" name="id" value={post?.id || ""} />
      <label>
        文章标题
        <input
          name="title"
          required
          maxLength={160}
          defaultValue={post?.title}
        />
      </label>
      <div className="two">
        <label>
          文章链接
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="my-first-post"
            defaultValue={post?.slug}
          />
        </label>
        <label>
          分类
          <input
            name="category"
            required
            maxLength={40}
            defaultValue={post?.category || "开发手记"}
          />
        </label>
      </div>
      <label>
        摘要
        <textarea
          name="excerpt"
          required
          maxLength={400}
          rows={3}
          defaultValue={post?.excerpt}
        />
      </label>
      <label>
        标签（逗号分隔）
        <input name="tags" maxLength={200} defaultValue={post?.tags} />
      </label>
      <div className="section-line">
        <strong>正文 · Markdown</strong>
        <button
          type="button"
          className="secondary"
          onClick={() => setPreview(!preview)}
        >
          {preview ? "继续编辑" : "预览排版"}
        </button>
      </div>
      <textarea
        aria-label="正文"
        name="content"
        required
        hidden={preview}
        rows={18}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {preview && (
        <div className="prose preview">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      )}
      <label>
        发布状态
        <select name="published" defaultValue={String(post?.published || 0)}>
          <option value="0">草稿 · 仅自己可见</option>
          <option value="1">发布 · 所有人可见</option>
        </select>
      </label>
      <p role="alert">{state.error}</p>
      <button disabled={pending}>{pending ? "保存中…" : "保存文章 →"}</button>
    </form>
  );
}
export function CommentForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(comment, {});
  return (
    <form action={action} className="stack">
      <input type="hidden" name="slug" value={slug} />
      <label>
        你的昵称
        <input name="name" required maxLength={40} />
      </label>
      <label>
        留下你的想法
        <textarea
          name="body"
          required
          minLength={2}
          maxLength={2000}
          rows={4}
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        网站
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <p role="status">{state.error || state.success}</p>
      <button disabled={pending}>{pending ? "提交中…" : "提交评论"}</button>
      <small>评论经审核后显示，请友善交流。</small>
    </form>
  );
}
export function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!confirm("确定永久删除这篇文章及其评论？")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-button danger">删除</button>
    </form>
  );
}
