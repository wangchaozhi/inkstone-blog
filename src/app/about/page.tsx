export const metadata = { title: "关于墨石" };
export default function About() {
  return (
    <section className="article-wrap">
      <div className="eyebrow">A LITTLE ABOUT THIS PLACE</div>
      <h1>
        一块墨石，
        <br />
        一个思想的落脚点。
      </h1>
      <div className="prose">
        <p>欢迎来到墨石。这是一座关于技术、设计和日常生活的数字花园。</p>
        <h2>为什么写作</h2>
        <p>
          写作让模糊的想法变得清晰，也让独自探索的过程有机会与他人产生连接。这里收集开发中的实践、设计里的观察，以及生活中值得记住的小事。
        </p>
        <h2>你会在这里看到什么</h2>
        <ul>
          <li>技术探索：理解工具背后的原理。</li>
          <li>开发手记：记录从想法到作品的过程。</li>
          <li>设计观察：寻找清晰、自然的表达。</li>
          <li>生活切片：为日常留下一点空间。</li>
        </ul>
        <h2>保持联系</h2>
        <p>
          欢迎在文章下方留下你的想法，也可以通过{" "}
          <a href="/feed.xml">RSS 订阅</a>跟上更新。
        </p>
      </div>
    </section>
  );
}
