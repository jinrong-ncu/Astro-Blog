import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { BLOG_CATEGORIES } from "./content/categories";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(BLOG_CATEGORIES),
    author: z.string().default("Anonymous"),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false).optional(),
    draft: z.boolean().default(false).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
