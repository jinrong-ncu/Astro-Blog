---
title: "个人博客接入 Google Search Console 并检查索引"
description: "完成站点所有权验证、提交 sitemap、使用 URL Inspection 检查抓取，并正确理解“已发现”“已抓取”和“未编入索引”。"
pubDate: 2026-01-15
updatedDate: 2026-09-01
category: "websites-seo"
tags: ["Google Search Console", "Sitemap", "URL Inspection"]
author: "荣十一"
---

Search Console 不会替你“上传网站”，它让你证明站点所有权、提交 sitemap，并查看 Google 对 URL 的抓取与索引状态。提交 sitemap 也不保证每个页面都会被收录。

本文依据 [Google Search Console 官方帮助](https://support.google.com/webmasters/answer/7451001)整理。

## 1. 选择站点属性

- 能修改 DNS 时，优先使用 Domain 属性，它覆盖协议和子域名。
- 只能改当前站点页面时，使用 URL-prefix 属性，并确保协议、域名和路径完全一致。

按页面给出的 DNS TXT、HTML 文件或 meta 标签完成验证。验证记录不要在通过后立即删除，否则后续可能失去权限。

## 2. 提交 sitemap

先在未登录浏览器中打开站点生成的 sitemap，确认返回成功且其中 URL 属于正式域名。然后在 Sitemaps 报告里提交它的完整地址。

Google 的说明强调：提交表示“告诉 Google 在哪里找”，不是把 sitemap 文件上传到 Search Console。状态不是 Success 时，先修复无法访问、格式错误或跳转过多。

## 3. 检查单个 URL

在 URL Inspection 输入完整文章地址：

- **URL is on Google**：已进入索引，但展示仍取决于查询与质量。
- **Discovered / Crawled, currently not indexed**：Google 知道或抓取过页面，但暂未收录；先检查内容重复、内部链接和页面是否真正有独立价值。
- **Duplicate**：查看 Google 选择的 canonical 是否与你声明的一致。
- **Blocked / noindex**：检查 robots、meta robots、响应和登录限制。

修改后可做 Live Test，再为少量关键页面请求重新编入索引。大量更新应依靠可抓取导航和 sitemap，而不是逐页重复提交。

上线前的技术准备可用[Astro SEO 检查清单](/blog/astro-blog-seo-checklist/)复核。
