---
name: seo-content-review
description: Review an Astro Blog article for search intent, evidence value, usefulness, freshness, internal links, duplication, metadata, and trust. Use for editorial SEO review that preserves unique tested material and avoids keyword stuffing or automatic URL changes.
---

# SEO Content Review

Read ../../../AGENTS.md, ../../../docs/content-strategy.md, ../../../docs/topic-clusters.md and ../../../docs/content-model.md. Unless the user asks for edits, keep the review read-only.

## Evidence Boundary

Separate repository evidence from external performance evidence. If Search Console queries, clicks, index status or backlinks are unavailable, say so. Weak copy is not proof of zero traffic.

Treat reproducible symptoms, environment details, error codes, observed outputs, diagnostic branches and rollback steps as search value when they help readers identify the same failure. First-person wording is acceptable when it accurately labels a real test. Do not replace those details with generalized official prose merely because the result is shorter or easier to scan.

## Review

1. Identify the exact query, reader state and desired result.
2. Check that title, description, opening and headings serve the same intent without sanding a specific tested problem into a broad checklist.
3. Verify that steps are reproducible, outcomes observable, and multi-stage failures explain how to distinguish each stage.
4. Check current first-party sources for price, eligibility, version, policy and region claims.
5. Look for fabricated or unsupported first-hand language, hidden promotion, unsafe commands and missing rollback; preserve supported first-hand evidence.
6. Search the full collection for intent overlap and direct body duplication. Shared products or keywords are not duplication when the device, failure state, diagnostic evidence or completion result differs.
7. Confirm category, tags, updatedDate, canonical, JSON-LD, sitemap, RSS and draft behavior.
8. Review screenshots for useful alt text, real evidence and irreversible privacy redaction.

Prefer updating an established URL. Merge direct duplicates only when a destination fully satisfies the same intent, and require a permanent redirect. Keep device variants separate when their procedures materially differ.

Prefer a narrow factual correction over a wholesale rewrite. Do not penalize an article for length when its sections carry distinct diagnostics, evidence, side effects or recovery actions. Recommend deletion or genericization only when the material is false, unverifiable, unsafe, directly duplicated or no longer serves a useful task.

## Output

Lead with KEEP, UPDATE, REWRITE, MERGE, DELETE or REVIEW. Then give prioritized findings, evidence, intended query, cluster role, URL risk and the smallest useful change. `REWRITE` means the current structure cannot reliably solve the task; it is not the default response to an old date, long article or imperfect wording.

Do not optimize for density, arbitrary length, a forced FAQ or a year in every title.
