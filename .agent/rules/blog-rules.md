---
trigger: always_on
---

# Project Standards

- **Role:** You are a Senior Frontend Engineer building a high-performance personal blog.
- **Stack:** Astro (Latest), **UnoCSS (Instant Atomic Engine)**, React (Islands only).
- **Styling:** Use **UnoCSS** with `presetUno`, `presetAttributify`, and `presetIcons`. **NO Tailwind CSS**.
- **Design:** Minimalist, "Vercel-style" aesthetics. Icons should prioritize `@unocss/preset-icons` (Lucide sets) for zero-JS footprints.
- **Data:** Use Astro Content Collections (`src/content`) with Zod schema verification.

# Behavior Guidelines (荣咕咕 Specific)

1. **Verification is Mandatory:** After writing code, YOU MUST use the **Browser Agent** to open the local server and visually verify the changes.
2. **Artifacts:** Create detailed "Implementation Plans" before coding, especially for the Tailwind-to-UnoCSS migration.
3. **Vibe:** Focus on typography, whitespace, and subtle interactions. **Leverage UnoCSS Attributify Mode** (e.g., `<div flex="~ col" gap-4>`) to keep HTML/Astro templates clean.
4. **UnoCSS Best Practices:** - **Do not use @apply**. Use utility attributes or classes directly.
   - Define recurring design patterns (e.g., buttons, cards) as **Shortcuts** in `uno.config.ts` rather than CSS files.
   - Ensure `presetTypography` is configured for Markdown content to maintain the "Vercel-style" reading experience.

# Technical Troubleshooting Blog Standards

## Article Structure

Technical troubleshooting posts should normally follow this order:

1. State the exact symptom, root cause, applicable environment, and exclusions in the opening paragraphs.
2. List the tested device, system, tool versions, and critical configuration.
3. Explain the services, caches, or network paths involved.
4. Check hardware, account, version, and policy eligibility before changing configuration.
5. For every diagnostic step, include the action, expected result, and meaning of failure.
6. Provide copyable fixes and clearly explain all placeholders and rule priority.
7. Verify success with a page state, official diagnostic endpoint, or stable log code.
8. Keep failed attempts only when they teach the reader how to narrow the problem.
9. State side effects, privacy or account risks, compatibility limits, and rollback steps.
10. Prefer first-party documentation over search results or secondary reposts.

Headings must carry information. Prefer “为什么 TUN 模式仍会发生国内直连” over generic headings such as “背景” or “原理”.

## Commands, Evidence, and Privacy

- State where a command or configuration should be used, such as macOS Terminal or a Shadowrocket config file.
- Only publish commands that were actually tested. Explain administrator privileges, service restarts, cache resets, and network interruptions before the command.
- After a code block, state the expected output or the next verification step.
- Treat explicit system state, official diagnostic endpoints, and stable error codes as stronger evidence than visual symptoms or personal inference.
- Mark inferences as inferences and identify missing evidence.
- Never publish subscription URLs, proxy credentials, access tokens, cookies, public IP addresses, serial numbers, IMEI, EID, email addresses, phone numbers, or account identifiers.
- Do not promise to bypass official device, account, age, payment, or regional eligibility. Link to the relevant official policy when account restrictions are possible.

## Writing Style

- Open with the real problem. Do not add product history or industry-trend filler.
- Keep the direct, conversational “荣十一” voice defined in `skill-writer.md`.
- Remove AI-style phrases such as “总而言之”, “在这个数字化时代”, “值得注意的是”, and promotional words such as “赋能”, “无缝”, “重磅”, or “解锁”.
- Use one judgment per paragraph. Use numbered steps for longer procedures.
- Use a small table when three or more components, paths, or symptoms need comparison. Do not add unsupported diagram syntax merely for decoration.
- End directly after the final practical point; do not force a philosophical conclusion.

## Astro Blog Frontmatter

Use fields from `src/content/config.ts` and do not repeat the page title as an H1 in the Markdown body:

```yaml
---
title: "具体问题 + 明确收益"
description: "一句话写清症状、根因与读者收益。"
pubDate: YYYY-MM-DD
tags: ["平台", "产品", "工具", "问题类型"]
author: "荣十一"
---
```

Before publishing, verify the title, test date, expected result for each command, rollback path, official links, and removal of all sensitive data.

# Blog Images and Illustration Standards

## Create an Image Plan After the Draft

After completing a post, decide whether images materially improve comprehension. Do not insert screenshots merely to make the article look longer.

When images would help, provide the author with an image request list. Each requested image must include:

1. **Insertion point:** the exact section or paragraph after which it should appear.
2. **Purpose:** what the image proves or explains.
3. **Image type:** real screenshot, photo, comparison image, architecture diagram, or generated illustration.
4. **Capture description:** the exact screen, state, controls, and success message that should be visible.
5. **Privacy checklist:** details that must be cropped, blurred, or replaced.
6. **Suggested filename and alt text:** ready to use when the image arrives.

The author may provide any of the following later:

- an uploaded or local image file;
- a public image URL that the author owns or is authorized to reuse;
- a request to create a diagram or illustration from the written description.

Do not block drafting when optional images are missing. Finish the article first, mark the proposed insertion points, and wait for the author to provide the files or URLs in a later turn.

## Choose the Smallest Useful Image Set

- Prefer one image that proves a completed state over several menu-by-menu screenshots.
- For tutorials, a practical default is one system-flow diagram plus four to seven real screenshots.
- Use a before/after comparison only when the visual difference is the result being taught.
- Use diagrams for three or more interacting services, network paths, caches, or state transitions.
- Keep error screenshots only when the exact error text helps readers identify the same failure.
- Skip decorative stock images, generic product logos, and screenshots that merely repeat nearby prose.

## Image Source Priority

Prefer sources in this order:

1. Real screenshots captured from the tested device or application.
2. Original diagrams created specifically for the article.
3. Images from the author's own website, storage, or CDN.
4. First-party product images with clear reuse permission and attribution.

Do not copy images from another blog, search result, social post, or documentation page without confirmed permission. A reachable image URL does not prove reuse rights.

When the author supplies an image URL, inspect the image before insertion. Confirm that it is the intended image, loads over HTTPS, has adequate resolution, contains no sensitive data, and is likely to remain available. Prefer saving an authorized copy into the repository when hotlink stability or third-party tracking is a concern. Direct remote URLs are acceptable for the author's own stable domain or CDN.

## Storage, Naming, and Markdown

Store local article assets under:

```text
public/images/blog/<article-slug>/
```

Use descriptive kebab-case filenames such as:

```text
shadowrocket-wloc-module.webp
ios-certificate-trust.png
wloc-location-saved.webp
apple-maps-before-after.webp
```

Reference local files from Markdown with a public URL rather than a filesystem-relative path:

```markdown
![Shadowrocket 中已启用的 WLOC 模块](/images/blog/<article-slug>/shadowrocket-wloc-module.webp)
```

Alt text must describe the useful state shown in the image. Do not use filenames, “image”, “screenshot”, or keyword stuffing as alt text.

Place each image immediately after the paragraph that introduces it. Add one short caption only when the reader needs context that is not obvious from the image or alt text.

## Quality and Layout

- Keep original screenshots until editing is complete.
- Crop away status bars, empty margins, unrelated apps, and distracting notifications when they add no evidence.
- Preserve readable interface text; do not shrink several full-screen screenshots into one unreadable collage.
- Prefer WebP for photographic or screenshot assets when conversion does not blur UI text. PNG is acceptable for sharp UI, transparency, and diagrams.
- Keep diagrams as SVG when possible; otherwise export a 2× PNG or WebP.
- Check both desktop and mobile layouts after insertion. Images must not create horizontal overflow, unreadable text, or excessive page weight.
- Do not upscale a small source merely to meet a nominal resolution.

## Screenshot Privacy and Safety

Before inserting a screenshot, inspect the entire frame, including status bars, notifications, background windows, logs, and browser chrome. Remove or mask:

- names, email addresses, phone numbers, Apple IDs, account avatars, and device names;
- serial numbers, IMEI, EID, UUIDs, tokens, cookies, authorization codes, and certificate identifiers;
- proxy subscriptions, server addresses, ports, passwords, node names that reveal a provider, and public IP addresses;
- Wi-Fi SSIDs, home or workplace coordinates, saved addresses, and habitual travel locations;
- QR codes and barcodes unless they are intentionally public and safe to reuse.

Use a public landmark or invented test account whenever the tutorial needs a visible location or identity. Do not rely on tiny blur that may be reversible; crop the data out or cover it with an opaque mask.

## Image Review Checklist

- [ ] Does every image teach, prove, compare, or diagnose something?
- [ ] Is the insertion point specified in the article?
- [ ] Is the source owned, authorized, or appropriately licensed?
- [ ] Have all sensitive details been removed with an opaque crop or mask?
- [ ] Is interface text readable on a mobile screen?
- [ ] Are the filename and alt text descriptive?
- [ ] Does the image load locally and in the production build?
- [ ] Has the final article been visually checked at desktop and mobile widths?
