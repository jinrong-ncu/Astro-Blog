---
name: astro-blog-conventions
description: Implement or review this repository's Astro content architecture, routing, metadata, feeds, taxonomy, redirects, and related-post behavior. Use for blog plumbing and content-model changes, not for drafting an article by itself.
---

# Astro Blog Conventions

Read ../../../AGENTS.md and the relevant files under ../../../docs/ before changing content infrastructure.

## Repository Contract

- Articles live in src/content/blog/ and use the schema in src/content.config.ts.
- Published filenames define /blog/<slug>/ URLs. A removed or merged public URL needs an equivalent permanent redirect.
- Every public article has one controlled category, 2–5 entity tags, pubDate, and an optional updatedDate for substantive re-verification.
- Drafts must be absent from articles, tags, categories, archive, RSS, sitemap, OG routes, search and related content.
- Category identifiers live in src/content/categories.ts; UI labels must come from the central map.

## Framework Boundaries

- Keep Astro static-first and use React only for interaction that needs client state.
- Use the existing UnoCSS setup. Do not add Tailwind or use Tailwind-only directives such as @apply.
- Reuse current components and design tokens before adding dependencies or a new styling system.
- Prefer the smallest compatible change and preserve mobile, dark-mode and accessibility behavior.
- Do not turn a visual preference such as glass effects into a mandatory project-wide rule.

## Metadata and Discovery

- Keep canonical URLs, trailing slashes, RSS, sitemap, OG images and JSON-LD consistent.
- BlogPosting dateModified uses updatedDate ?? pubDate and articleSection uses the category label.
- Related content scores shared category before overlapping concrete tags. Never include a draft or the current article.
- Redirect only to an equivalent destination. Record each old-to-new mapping in ../../../docs/redirects.md.

## Change Workflow

1. Inspect the schema and every consumer of the affected field.
2. Search for links to routes or files being removed.
3. Make content, route and documentation updates together.
4. Run the production build.
5. Inspect representative article, category, tag, archive, RSS, sitemap, OG and redirect outputs.

Never publish secrets, account identifiers or fake documents as demonstrations.
