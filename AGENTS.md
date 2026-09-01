# Astro Blog Agent Guide

## Product

This repository is a search-driven practical tutorial site for students and independent creators. It covers student benefits, AI tools, Mac and iPhone, websites and SEO, file safety, and selected eSIM or overseas-service problems. It does not publish a separate development-tutorial category.

It is not a wiki, a dump for isolated notes, a place for fake credentials, or a catalogue of unverified promotions.

Read before content work:

- docs/content-strategy.md
- docs/topic-clusters.md
- docs/content-model.md
- docs/redirects.md

## Editorial Decisions

Search the full article collection before writing. Identify the query, environment and verifiable completion state, then choose UPDATE, MERGE, NEW or DELETE.

- Preserve a useful published slug.
- Merge direct duplicates only into an equivalent destination and add a permanent redirect.
- Delete tests, fake documents, unsafe instructions and unsupported promotional content.
- Use first-party sources for eligibility, prices, policies, regions and current product behavior.
- Never describe documentation as personal testing.

Lead with the answer or safest next action. Include prerequisites, expected results, failure meanings, side effects and rollback when they matter. Avoid filler, hype, keyword stuffing and forced FAQs.

## Content Contract

- Articles live in src/content/blog/.
- Frontmatter follows src/content.config.ts.
- category is required and comes from src/content/categories.ts.
- tags contain 2–5 concrete products or technologies.
- updatedDate records a substantive re-verification, not a copy edit.
- A Markdown article must not repeat its frontmatter title as an H1.
- Drafts are excluded from every public route and generated asset.

## Engineering

- Keep Astro static-first.
- Use React only for interactive islands.
- Use the existing UnoCSS setup; do not add Tailwind or Tailwind-only directives.
- Never expose storage or API secrets in browser code.
- Preserve canonical URLs, RSS, sitemap, OG images, JSON-LD, search, redirects and trailing-slash behavior.
- Prefer the smallest compatible implementation and avoid unrelated dependencies.

## Project Skills

- .agents/skills/tutorial-writing/SKILL.md — drafting and restructuring practical tutorials.
- .agents/skills/seo-content-review/SKILL.md — intent, freshness, duplication, metadata and trust review.
- .agents/skills/astro-blog-conventions/SKILL.md — schema, routes, taxonomy, feeds, metadata and redirects.

## Validation

For content-only changes, validate frontmatter, internal links, sources and overlap. For schema, route or UI changes, run the production build and inspect representative article, category, tag, archive, RSS, sitemap, OG and redirect outputs.
