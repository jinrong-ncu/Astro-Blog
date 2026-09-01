# Astro Blog

A static Astro tutorial site focused on practical, verifiable answers for students and independent developers.

## Content

- Student benefits and education verification
- AI tools and official support boundaries
- Mac and iPhone software troubleshooting
- Development problem solving
- Personal websites, deployment and SEO
- File backup and account migration
- Selected eSIM and overseas-service guides

The September 2026 migration replaced the old knowledge-note model, removed test and unsafe content, merged duplicate articles, and introduced primary categories plus substantive update dates.

## Stack

- Astro 7 and Content Layer collections
- Markdown
- UnoCSS
- React islands where interaction is required
- Pagefind search
- RSS, sitemap, canonical metadata, OG images and JSON-LD

## Structure

~~~text
src/content/blog/       Published tutorials
src/content.config.ts   Frontmatter schema
src/content/categories.ts  Category identifiers and labels
src/pages/blog/         Article routes
src/pages/categories/   Category routes
src/pages/tags/         Tag routes
docs/                   Current editorial documentation
.agents/skills/         Project-level Skills
AGENTS.md               Canonical agent instructions
~~~

## Development

~~~sh
npm install
npm run dev
npm run build
npm run preview
~~~

The build generates the Astro site and then creates the Pagefind index in dist/.

## Editorial References

- [Agent guide](AGENTS.md)
- [Content strategy](docs/content-strategy.md)
- [Topic clusters](docs/topic-clusters.md)
- [Content model](docs/content-model.md)
- [Redirect registry](docs/redirects.md)
