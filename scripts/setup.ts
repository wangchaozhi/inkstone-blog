import { database } from "../src/lib/db";
const db = database();
await db.batch(
  [
    `CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, name TEXT NOT NULL, body TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id, approved)`,
    `CREATE INDEX IF NOT EXISTS posts_published ON posts(published, created_at)`,
  ],
  "write",
);
if (process.argv.includes("--seed")) {
  const seeds = [
    [
      "building-in-public",
      "在构建中思考，在分享中成长",
      "开发手记",
      "把灵感变成作品，也把过程里的曲折、发现和小小的进步记录下来。",
      "## 从一个小问题开始\n\n很多值得做的项目，起点都不是一个宏大的计划，而是日常里一个反复出现的小问题。把它写下来，再尝试做一个最小的解决方案。\n\n## 让反馈尽早发生\n\n不要等到所有功能都完整才分享。一个清晰的原型、一段诚实的开发记录，往往比一份漂亮的路线图更有价值。\n\n> 好的作品是在一次次具体的反馈里，慢慢长出来的。\n\n## 保留自己的节奏\n\n- 每次只解决一个真正的问题\n- 为关键流程留下自动化测试\n- 写下取舍，给未来的自己留一点线索\n\n持续创作不是每天都高产，而是在停下来之后，仍然愿意回来。",
    ],
    [
      "quiet-interface",
      "让界面安静下来：关于留白与阅读",
      "设计观察",
      "当页面不再争夺注意力，文字和思考才有了呼吸的空间。",
      "## 留白不是空白\n\n留白建立了内容之间的关系。标题周围的空间、段落之间的距离，都是阅读节奏的一部分。\n\n## 先考虑文字\n\n选择舒适的行高，限制每行的长度，并为不同层级设置稳定的视觉规则。\n\n一个好的阅读界面，应当在读者开始阅读后逐渐消失。",
    ],
    [
      "server-components",
      "把数据留在服务端：理解 Server Components",
      "技术探索",
      "从一次数据请求出发，重新梳理客户端与服务端之间的边界。",
      "## 明确职责\n\n服务端组件适合读取数据库和组织内容；客户端组件适合需要状态和浏览器事件的交互。\n\n```tsx\nexport default async function Page() {\n  const posts = await getPosts();\n  return <PostList posts={posts} />;\n}\n```\n\n## 写入时重新检查权限\n\n页面上的隐藏按钮不等于权限控制。每一次服务端写入都必须独立验证当前用户。\n\n## 从简单开始\n\n先让数据流清晰，再围绕真实的性能瓶颈做优化。",
    ],
    [
      "walking-notes",
      "散步的时候，想法会自己出现",
      "生活切片",
      "离开屏幕一会儿，在街道、树影和晚风里重新找回专注。",
      "## 给注意力一个出口\n\n长时间盯着同一个问题，思路很容易变窄。散步让身体有了节奏，也让那些没有完成的念头有机会重新连接。\n\n不带任务地走一段路，看看光线如何落在建筑上，听听熟悉街道里陌生的声音。\n\n回到桌前，问题也许没有消失，但我们看待它的角度已经不同。",
    ],
  ];
  for (const [i, s] of seeds.entries()) {
    const [slug, title, category, excerpt, content] = s;
    const date = new Date(Date.now() - i * 86400000 * 3).toISOString();
    await db.execute({
      sql: "INSERT OR IGNORE INTO posts VALUES (?,?,?,?,?,?,?,?,?,?)",
      args: [
        `seed-${i}`,
        slug,
        title,
        excerpt,
        content.replaceAll("\\n", "\n"),
        category,
        "思考,创作",
        1,
        date,
        date,
      ],
    });
  }
}
console.log("Database ready");
db.close();
