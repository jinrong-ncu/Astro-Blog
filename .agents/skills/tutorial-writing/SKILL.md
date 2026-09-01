---
name: tutorial-writing
description: Write or substantially revise practical tutorials, how-to guides, troubleshooting posts, and tool guides for this Astro Blog. Use when content must solve a concrete reader task; do not use for encyclopedic notes.
---

# Tutorial Writing

Read ../../../AGENTS.md, ../../../docs/content-strategy.md, ../../../docs/topic-clusters.md and ../../../docs/content-model.md before content work.

## Decide Before Writing

Search titles, descriptions, headings, tags and bodies. Define the reader's query, environment and completion state in one sentence.

- UPDATE when an existing URL can own the task.
- MERGE when pages substantially overlap.
- NEW only for a materially different reader state and outcome.
- DELETE when a page is a test, duplicate without unique value, unsupported promotion, fake document or unsafe instruction.

Keep published slugs unless an equivalent permanent redirect is implemented and documented.

## Evidence

Use first-hand reproducible testing, repository evidence and first-party documentation in that order. For price, eligibility, version, region, policy or API behavior, check the current official source and record the verification date.

Never fabricate a test, output, error, credential, qualification or user story. Distinguish tested behavior from documentation and inference.

Troubleshooting records should capture the actual symptom, environment, failed attempts, smallest fix, verification and rollback. Commands must say where they run, explain placeholders and elevated permissions, and avoid destructive shortcuts.

## Structure

Lead with the direct answer or safest next action. Use only useful sections from:

Problem -> Direct answer -> Prerequisites -> Steps -> Expected result -> Failure meaning -> Risks -> Rollback -> Related content

Each meaningful step should state the action, expected result and what failure means. Remove product history, filler, hype, forced summaries and keyword repetition.

## Security, Privacy and Images

- Never place access keys, secrets or privileged storage credentials in browser code.
- Do not publish account IDs, device IDs, phone numbers, exact private locations or documents used for identity verification.
- Redaction must remove data rather than apply a reversible blur.
- Store article assets under public/images/blog/<slug>/ with descriptive lowercase names.
- Screenshots must prove a state or path, use specific alt text and exclude irrelevant personal information.
- State side effects and a recovery path for certificates, proxies, account changes, data migration and privileged commands.

## Frontmatter

Follow src/content.config.ts and ../../../docs/content-model.md. Use one primary category and 2–5 official product or technology tags. Do not repeat the frontmatter title as a Markdown H1. updatedDate is for a material verified refresh, not copy editing.

Finish by checking that the task is answerable, the result is verifiable, volatile facts are dated, risks are explicit and internal links lead to a genuine next step.
