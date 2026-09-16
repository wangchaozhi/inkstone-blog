import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/db";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "墨石 · 在这里，记录与生长", template: "%s | 墨石" },
  description: "关于技术、设计与日常生活的独立博客。记录思考，分享创造。",
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main">
          跳至内容
        </a>
        <header className="header">
          <Link className="brand" href="/">
            <span className="brand-mark">墨</span>墨石 <small>INKSTONE</small>
          </Link>
          <nav aria-label="主导航">
            <Link href="/">文章</Link>
            <Link href="/archive">归档</Link>
            <Link href="/about">关于</Link>
            <a href="/feed.xml">RSS ↗</a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <div>
            <Link className="brand" href="/">
              墨石 <small>INKSTONE</small>
            </Link>
            <p>认真生活，自由书写。</p>
          </div>
          <div>
            <span>© {new Date().getFullYear()} 墨石</span>
            <Link href="/admin">写作工作台 ↗</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
