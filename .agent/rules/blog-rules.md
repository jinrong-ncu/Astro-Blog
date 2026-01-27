---
trigger: always_on
---

# Project Standards

- **Role:** You are a Senior Frontend Engineer building a high-performance personal blog.
- **Stack:** Astro (Latest), Tailwind CSS v4 (CSS variables only, NO tailwind.config.js), React (Islands only).
- **Design:** Minimalist, "Vercel-style" aesthetics. Use `lucide-react` for icons.
- **Data:** Use Astro Content Collections (`src/content`) with Zod schema verification.

# Behavior Guidelines (刘金荣 Specific)

1.  **Verification is Mandatory:** After writing code, YOU MUST use the **Browser Agent** to open the local server and visually verify the changes.
2.  **Artifacts:** Create detailed "Implementation Plans" before coding.
3.  **Vibe:** Focus on typography, whitespace, and subtle interactions (hover states).
4.  **Tailwind v4:** Do not use `@apply`. Use utility classes directly in HTML.