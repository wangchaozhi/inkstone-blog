import { test, expect } from "@playwright/test";

test("public reading, search, feeds, mobile and protected routes", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "把日常的灵感",
  );
  await page
    .getByRole("textbox", { name: "搜索文章" })
    .fill("Server Components");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page.locator(".post-card")).toHaveCount(1);
  await page.locator(".post-card").click();
  await expect(page.locator(".prose h2").first()).toHaveText("明确职责");
  await page.goto("/?category=" + encodeURIComponent("设计观察"));
  await expect(page.locator(".post-card")).toHaveCount(1);
  await page.goto("/?q=nonexistent-query");
  await expect(page.getByText("还没有找到这片灵感")).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("管理员密码").fill("wrong");
  await page.getByRole("button", { name: "进入工作台" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("密码错误");
  for (const path of ["/feed.xml", "/sitemap.xml", "/robots.txt"])
    expect((await request.get(path)).status()).toBe(200);
  expect((await request.get("/posts/missing-post")).status()).toBe(404);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("author and reader complete publishing and moderation lifecycle", async ({
  page,
  browser,
}) => {
  const slug = "e2e-" + Date.now();
  await page.goto("/login");
  await page.getByLabel("管理员密码").fill("test-only-password-12345");
  await page.getByRole("button", { name: "进入工作台" }).click();
  await expect(page).toHaveURL("/admin");
  await page.getByRole("link", { name: "＋ 写新文章" }).click();
  await page.getByLabel("文章标题").fill("自动化测试文章");
  await page.getByLabel("文章链接").fill(slug);
  await page.getByLabel("摘要").fill("这是一篇测试文章摘要");
  await page
    .getByLabel("正文", { exact: true })
    .fill("## 测试标题\n\n这是一段完整正文。");
  await page.getByRole("button", { name: "预览排版" }).click();
  await expect(page.locator(".preview h2")).toHaveText("测试标题");
  await page.getByRole("button", { name: "继续编辑" }).click();
  await page.getByRole("button", { name: "保存文章" }).click();
  await expect(page).toHaveURL(/admin\?saved/);
  const readerContext = await browser.newContext();
  const reader = await readerContext.newPage();
  expect(
    (await reader.goto("http://localhost:3100/posts/" + slug))?.status(),
  ).toBe(404);
  expect(
    await (await reader.request.get("http://localhost:3100/feed.xml")).text(),
  ).not.toContain(slug);
  const row = page.locator(".manage-row").filter({ hasText: "自动化测试文章" });
  await row.getByRole("link", { name: "编辑", exact: true }).click();
  await page.getByLabel("发布状态").selectOption("1");
  await page.getByRole("button", { name: "保存文章" }).click();
  await expect(page).toHaveURL(/admin\?saved/);
  await reader.goto("http://localhost:3100/posts/" + slug);
  await expect(reader.getByRole("heading", { level: 1 })).toHaveText(
    "自动化测试文章",
  );
  await reader.getByLabel("你的昵称").fill("测试读者");
  await reader.getByLabel("留下你的想法").fill("这是等待审核的评论");
  await reader.getByRole("button", { name: "提交评论" }).click();
  await expect(reader.getByRole("status")).toContainText("审核后显示");
  await reader.reload();
  await expect(reader.locator(".comment")).toHaveCount(0);
  await page.reload();
  await page
    .locator(".comment")
    .filter({ hasText: "这是等待审核的评论" })
    .getByRole("button", { name: "通过审核" })
    .click();
  await expect(
    page.locator(".comment").filter({ hasText: "这是等待审核的评论" }),
  ).toContainText("已通过");
  await reader.reload();
  await expect(reader.locator(".comment")).toContainText("这是等待审核的评论");
  page.on("dialog", (d) => d.accept());
  await page
    .locator(".manage-row")
    .filter({ hasText: "自动化测试文章" })
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await expect(
    page.locator(".manage-row").filter({ hasText: "自动化测试文章" }),
  ).toHaveCount(0);
  expect(
    (await reader.goto("http://localhost:3100/posts/" + slug))?.status(),
  ).toBe(404);
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/admin/editor");
  await expect(page).toHaveURL(/login/);
  await readerContext.close();
});
