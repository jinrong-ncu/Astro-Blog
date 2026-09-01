---
name: tutorial-writing
description: Write or substantially revise evidence-rich practical tutorials, tested troubleshooting records, how-to guides, and tool guides for this Astro Blog. Use when content must help a reader reproduce a result or locate a failure; do not use for encyclopedic notes.
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

Do not turn an existing tested tutorial into a generic documentation summary. Preserve useful device and software versions, symptoms, error codes, commands, configuration fragments, observed outputs, failed attempts and causal explanations when they are supported by the source article. Use official documentation to verify eligibility and boundaries, not to erase repository evidence.

For technical troubleshooting in this repository, inspect `src/content/blog/mac-apple-intelligence-chatgpt-login-guide.md` and `src/content/blog/iphone-shadowrocket-apple-intelligence-chatgpt-guide.md` as style references. They demonstrate the preferred evidence density; copy their reasoning pattern only when the problem actually involves multiple services, rules, caches or states.

## Tested Troubleshooting Records

Open with the exact symptom, the relevant environment, the diagnosed cause when known, and the boundary of what the article can fix. A useful troubleshooting record normally includes:

- a compact tested-environment table when versions or device variants affect the result;
- a causal model of the services, network paths, caches or state transitions involved;
- diagnostics before fixes, using stable outputs, logs, error codes or connection records;
- copyable commands or configuration with the execution location, placeholders, permissions and rule priority explained;
- an observable expected result after each major step and what a different result means;
- failed attempts when they eliminate a plausible cause or prevent repeated wasted work;
- explicit success criteria, side effects and a complete rollback path.

Do not shorten a working diagnostic chain merely to make the article look concise. Length is justified when each section contributes evidence, a decision or a recovery action. Conversely, do not invent an environment table, logs or test results for a documentation-only guide.

## Other Practical Tutorials

For application, setup, migration and comparison guides, lead with the answer or safest next action. Use only the sections needed from:

Problem -> Direct answer -> Prerequisites -> Steps -> Expected result -> Failure meaning -> Risks -> Rollback -> Related content

Each meaningful step should state the action, expected result and what failure means. Remove product history, filler, hype, forced summaries and keyword repetition.

Prefer specific headings that carry a conclusion or diagnostic question. Use tables when three or more paths, components or symptoms need comparison. End after the final useful verification, limitation or recovery note; do not force a summary or FAQ.

## Security, Privacy and Images

- Never place access keys, secrets or privileged storage credentials in browser code.
- Do not publish account IDs, device IDs, phone numbers, exact private locations or documents used for identity verification.
- Redaction must remove data rather than apply a reversible blur.
- Store article assets under public/images/blog/<slug>/ with descriptive lowercase names.
- Screenshots must prove a state or path, use specific alt text and exclude irrelevant personal information.
- State side effects and a recovery path for certificates, proxies, account changes, data migration and privileged commands.
- A proxy, cache reset or process restart may be documented when it corrects a verified routing or state problem on an otherwise eligible setup. State the official eligibility boundary and do not present it as a way to manufacture device, account or regional qualification.

## Frontmatter

Follow src/content.config.ts and ../../../docs/content-model.md. Use one primary category and 2–5 official product or technology tags. Do not repeat the frontmatter title as a Markdown H1. updatedDate is for a material verified refresh, not copy editing.

When revising an established article, make the smallest change that preserves its unique evidence and voice. Do not replace a specific title, tested workflow or detailed body with a generic checklist unless the user explicitly requests that editorial change or the evidence is demonstrably false or unsafe.

Finish by checking that the task is answerable, the result is verifiable, volatile facts are dated, risks are explicit and internal links lead to a genuine next step.
