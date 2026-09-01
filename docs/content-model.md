# Content Model

The source of truth is src/content.config.ts.

| Field | Type | Rule |
| --- | --- | --- |
| title | string | One search intent; not repeated as Markdown H1 |
| description | string | Accurate page outcome and scope |
| pubDate | date | Original publication date |
| updatedDate | optional date | Substantive verified refresh only |
| category | controlled string | One value from src/content/categories.ts |
| tags | string array | 2–5 concrete products or technologies |
| author | string | Defaults through the schema |
| featured | optional boolean | Homepage recommendation |
| draft | optional boolean | Excluded from every public output |

Example:

~~~yaml
---
title: "具体问题与结果"
description: "说明适用范围、限制和读者完成后的状态。"
pubDate: 2026-08-01
updatedDate: 2026-09-01
category: "student-benefits"
tags: ["GitHub Education", "GitHub Copilot"]
author: "Ronin.XI"
---
~~~

## Runtime Use

- Homepage, category pages and archive sort by updatedDate ?? pubDate.
- Article JSON-LD uses pubDate for datePublished and updatedDate ?? pubDate for dateModified.
- Related articles prefer the same category, then concrete tag overlap.
- Category display labels come only from src/content/categories.ts.

## URL Rules

The Markdown filename owns /blog/<slug>/. A public slug may be removed only when:

1. the destination answers the same intent;
2. internal links are updated;
3. a permanent redirect is added;
4. docs/redirects.md records the mapping;
5. the production build verifies the result.
