"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty">
      <h1>暂时没能翻开这一页</h1>
      <p>请稍后再试。</p>
      <button onClick={reset}>重新加载</button>
    </section>
  );
}
