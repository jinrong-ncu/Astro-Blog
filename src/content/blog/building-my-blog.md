---
title: "How I Built a Modern Blog with Astro, Tailwind v4 and AI Agent"
description: "A deep dive into building a minimalist, high-performance blog using the latest web technologies and an AI coding partner."
pubDate: 2026-01-27
tags: ["astro", "tailwind", "ai", "coding"]
author: "刘金荣"
---

# How I Built a Modern Blog with Astro, Tailwind v4 and AI Agent

I've always wanted a space to share my thoughts on technology, design, and code, but I didn't want to spend weeks configuring a CMS or fighting with a heavy framework. I wanted something fast, beautiful, and easy to maintain.

This blog is the result.

## The Stack

For this project, I chose a stack that prioritizes performance and developer experience:

- **Astro**: The foundation. Astro's "Zero JS by default" philosophy ensures blazing fast load times, while its Islands architecture lets me hydrate interactive components only when necessary.
- **Tailwind CSS v4**: The styling engine. I'm using the latest version of Tailwind, which leverages native CSS variables for dynamic theming without the need for a complex configuration file. No `@apply`, just utility classes.
- **React**: Used sparingly for interactive elements like the theme toggle.
- **Giscus**: A lightweight, GitHub-powered comment system that requires no backend maintenance.
- **Vercel**: For seamless deployment and edge caching.

## The AI Workflow

The most unique part of this project wasn't the tech stack, but *how* I built it. I didn't write every line of CSS manually. Instead, I partnered with an AI Agent (刘金荣/Cursor) to "Vibe Code" the design.

My workflow looked like this:

1.  **Describe the Vibe**: I told the agent I wanted a "minimalist, Vercel-style aesthetic" with specific attention to typography and whitespace.
2.  **Iterate**: I'd ask for a component, review the visual result, and ask for tweaks. "Make the comments section wider," or "Fix the dark mode contrast."
3.  **Command, Don't Code**: I focused on the high-level architecture—defining the content collections, setting up the layout—while the agent handled the implementation details of the UI components.

This allowed me to move significantly faster than if I were typing out every `flex`, `grid`, and `padding` utility myself.

## Challenges

It wasn't all smooth sailing. One significant hurdle was implementing the dark mode toggle properly.

### Dark Mode Hydration

I initially ran into a hydration mismatch where the server rendered the light theme, but the user's system preference was dark, causing a flash of incorrect color on load.

To fix this, I had to ensure the theme script ran immediately in the `<head>` to block rendering until the correct class was applied to the `<html>` element. For the toggle button itself, I used a `client:only="react"` directive or a carefully timed `useEffect` to ensure it only rendered after hydration was complete, preventing the dreaded "Hydration failed" error.

```tsx
// Example of the fix logic
const theme = (() => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    return localStorage.getItem('theme');
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
})();

if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

## Conclusion

Building this blog has been a quick and rewarding journey. The combination of Astro's performance and the AI agent's coding speed allowed me to go from idea to deployment in record time.

I plan to use this space to document more of my experiments with AI-assisted software engineering. Stay tuned!
