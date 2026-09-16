import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty">
      <div className="eyebrow">404 · A PATH NOT TAKEN</div>
      <h1>这页故事，还没有写下。</h1>
      <p>文章可能已移走，或尚未发布。</p>
      <Link className="button" href="/">
        回到首页 →
      </Link>
    </section>
  );
}
