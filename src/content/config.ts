import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // 'content' = markdown文件, 'data' = json/yaml数据
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // 自动把字符串转成 Date 对象
    pubDate: z.date(),
    author: z.string().default('Anonymous'),
    tags: z.array(z.string()).default([]),
    // image: z.string().optional() // 以后可以加封面图
  }),
});

export const collections = {
  'blog': blogCollection,
};