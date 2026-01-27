---
title: "Hello World: I Built This Blog with AI"
description: "How I built a modern, high-performance blog in one night using Astro and AI agents."
pubDate: 2026-01-27
tags: ["Astro", "AI", "Life"]
author: "刘金荣"
---

# Welcome to my new corner of the internet.

This entire blog—design, code, and content—was built by chatting with an AI Agent. We tackled everything from dark mode hydration to dynamic Open Graph image generation.

## The Stack

- **Astro**: For blazingly fast static site generation.
- **Tailwind CSS v4**: For utility-first styling without the configuration bloat.
- **React**: For interactive islands like the search modal.
- **Vercel**: For seamless deployment.
- **Pagefind**: For static, client-side search.

## The Experience

Building this was unlike any traditional coding experience. Instead of writing every line of boilerplate, I acted as the architect while **刘金荣** (the AI Agent) handled the implementation.

We hit some interesting challenges along the way, particularly with **Open Graph images**. We started with a manual `satori` setup but eventually switched to `astro-og-canvas` for better stability and easier configuration. We even added support for custom fonts to ensure Chinese characters render perfectly!

## Code Snippet

Here is the configuration we used to generate the social cards you see when sharing this link:

```typescript
// src/pages/og/[...slug].ts
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const entries = await getCollection('blog');
const pages = Object.fromEntries(entries.map((post) => [post.slug, post]));

const { getStaticPaths, GET } = await OGImageRoute({
    param: 'slug',
    pages: pages,
    getImageOptions: (path, page: any) => ({
        title: page.data.title,
        description: page.data.description,
        bgGradient: [[24, 24, 27]], // Zinc-900
        border: { color: [63, 63, 70], width: 20 }, // Zinc-700
        font: {
            title: { size: 60, color: [255, 255, 255], families: ['Noto Sans SC'] },
            description: { size: 30, color: [161, 161, 170], families: ['Noto Sans SC'] },
        },
        fonts: [
            './fonts/NotoSansSC-Bold.ttf',
        ],
    }),
});

export { getStaticPaths, GET };
```

## Stay tuned

I'll be sharing more about my journey with AI engineering, frontend development, and whatever else catches my interest.

Stay tuned for more.
