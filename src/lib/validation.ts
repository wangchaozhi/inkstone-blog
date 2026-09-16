import { z } from "zod";
export const postSchema = z.object({
  id: z.string().max(100),
  title: z.string().trim().min(1, "请输入标题").max(160),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "链接只允许小写英文、数字和连字符")
    .max(160),
  excerpt: z.string().trim().min(1).max(400),
  content: z.string().trim().min(1).max(100000),
  category: z.string().trim().min(1).max(40),
  tags: z.string().max(200),
  published: z.enum(["0", "1"]),
});
export const commentSchema = z.object({
  slug: z.string().max(160),
  name: z.string().trim().min(1).max(40),
  body: z.string().trim().min(2).max(2000),
});
