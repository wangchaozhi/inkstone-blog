# 墨石 · Inkstone

一个可独立运行的中文全栈博客。Next.js 16 App Router、React 19、TypeScript、SQLite / Turso，配有写作后台与自动化测试。

## 功能

- 响应式文章首页、分类、搜索、分页、归档、阅读时长和标签检索
- Markdown + GFM 正文和编辑预览；禁用原始 HTML，避免文章注入脚本
- 单管理员登录、8 小时 HttpOnly 签名会话、服务端权限检查
- 新建、编辑、草稿、发布、删除；草稿不进入公开页面、RSS 或 sitemap
- 匿名评论、服务端校验、蜜罐和数据库共享频率限制、后台审核与删除
- 文章 SEO metadata、RSS、sitemap、robots、404、加载和错误页面
- Playwright 端到端测试与 GitHub Actions CI

## 本地启动

使用 Node.js 22+。

```sh
npm ci
cp .env.example .env.local
# 编辑 .env.local，设置 ADMIN_PASSWORD（至少 12 位）和 SESSION_SECRET（至少 32 位）
# 可用 openssl rand -hex 32 生成 SESSION_SECRET
npm run db:seed
npm run dev
```

打开 http://localhost:3000，访问 `/admin` 登录管理后台。没有内置默认密码。初始文章为演示内容，可在后台修改或删除。`db:setup` 只建表，`db:seed` 会幂等插入四篇示例文章；不要在日常启动或生产部署时重复运行 seed，否则已删除的示例文章会重新出现。

`.env.local`、本地数据库和测试产物均在 `.gitignore` 中。不要将凭据提交到仓库。本地数据库默认保存为项目目录下的 `blog.db`。

## 验证与开发循环

```sh
npm run check       # ESLint、TypeScript、生产构建
npx playwright install chromium
npm test            # 独立 test.db，端口 3100
```

测试覆盖搜索/分类/空结果、RSS/sitemap、404、手机无横向溢出、未登录保护、错误密码、创建草稿、公开隔离、Markdown 预览、发布、评论审核、删除和登出。测试服务器使用专用测试凭据，不依赖个人 `.env.local` 的管理员密码。不要将 `file:test.db` 指向真实数据库。

推荐每轮修改后运行相关测试，再执行 `npm run check && npm test`，检查 diff，提交并 push。CI 在每次 push / PR 后执行相同检查。

## 后续部署到 Vercel

当前仓库没有自动创建付费资源，也没有部署。部署时需提供远程 Turso 数据库；Vercel 临时文件系统不能用来持久化 SQLite。

1. 创建 Turso 数据库和访问 token，取得 `libsql://...` URL。
2. 使用远程环境变量执行一次 `npm run db:setup`。需要演示内容时才额外执行 seed。
3. 在 Vercel 导入 GitHub 仓库，框架选择 Next.js，Node.js 22，构建命令 `npm run build`。
4. 设置以下环境变量（Preview 和 Production 使用独立数据库与密钥）：

| 变量                   | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `TURSO_DATABASE_URL`   | 远程 `libsql://...` 地址，生产必填       |
| `TURSO_AUTH_TOKEN`     | 数据库访问令牌                           |
| `ADMIN_PASSWORD`       | 至少 12 位的强随机管理员密码             |
| `SESSION_SECRET`       | 至少 32 位随机密钥，轮换会使已有会话失效 |
| `NEXT_PUBLIC_SITE_URL` | 最终 HTTPS 域名，不带尾部 `/`            |

5. 部署后检查登录、发布、评论审核、RSS 与 sitemap，再绑定自定义域名。

应用会拒绝在 Vercel 上使用本地 SQLite。生产 cookie 自动启用 Secure。更换管理员密码后，请同时轮换 SESSION_SECRET 以撤销旧会话。备份由数据库提供方或离线 SQLite 备份负责。

## 架构和边界

- `src/app`：服务端页面、Server Actions 和 RSS 路由
- `src/components/forms.tsx`：交互表单、Markdown 预览、提交反馈
- `src/lib`：数据访问、认证、校验与 XML 转义
- `scripts/setup.ts`：显式数据库初始化与可选种子数据
- `tests`：浏览器 → Server Actions → 数据库 → 页面回显的完整流程

这是面向个人作者的博客，不包含多用户注册、邮件通知、媒体上传和富文本编辑。图片可以通过 Markdown 外链引用。管理面板显示最近 100 条评论；文章检索当前在服务端内存过滤，适合个人博客内容规模。高流量场景应升级为数据库分页/全文索引。

登录限流为全站 5 分钟 15 次，评论为全站每分钟 30 次，存储于数据库以跨实例生效。这是基础防护，高流量上线时建议在边缘增加按 IP 限流和验证码。全站限流可能影响其他访问者，避免把它视为完整反滥用系统。

所有管理写入均在 Server Action 内验证会话；Next.js 提供同源校验。输入使用 Zod 校验和参数化 SQL；评论默认不可见，经过审核才公开。没有引入默认账号或公开安装入口。
