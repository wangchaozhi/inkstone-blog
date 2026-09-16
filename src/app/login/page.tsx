import { LoginForm } from "@/components/forms";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
export const metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="login panel">
      <div className="eyebrow">WRITER&apos;S SPACE</div>
      <h1>欢迎回到书桌前。</h1>
      <p className="muted">登录后，继续写下你的下一个想法。</p>
      <LoginForm />
    </section>
  );
}
