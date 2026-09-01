---
title: "Astro 博客上线前的 SEO 检查清单"
description: "从可抓取、canonical、标题描述到 sitemap、RSS、结构化数据和 404，按构建产物逐项检查 Astro 博客。"
pubDate: 2025-12-06
updatedDate: 2026-09-01
category: "websites-seo"
tags: ["Astro", "Google Search Console", "Schema.org"]
author: "荣十一"
---

Astro 博客“构建成功”只说明页面生成了，不代表搜索引擎能正确发现、理解和归并 URL。上线前至少检查：公开页面可访问、草稿不输出、canonical 正确、sitemap 可抓取、元数据唯一，以及旧 URL 有明确跳转。

下面的清单以静态 Astro 站点为例。

## 先检查构建产物

运行项目自己的生产构建，再查看输出目录：

~~~bash
npm run build
~~~

确认以下页面真实存在：

- 首页、文章页、分类页和归档页；
- /sitemap-index.xml 或集成实际生成的 sitemap；
- /rss.xml；
- 404 页面或托管平台的 404 行为；
- 旧文章迁移后的重定向响应。

不要只在开发服务器里点通页面。开发模式可能掩盖大小写、尾斜杠和静态输出差异。

## 每类页面抽查一个 HTML

在生成的 HTML 中检查：

- 一个明确、与正文意图一致的 title；
- 准确的 meta description；
- 指向首选 URL 的 canonical；
- 文章页的 BlogPosting JSON-LD；
- datePublished 与真正更新后的 dateModified；
- Open Graph 标题、描述与图片；
- 导航能从首页到达文章。

Astro 的 [sitemap 集成](https://docs.astro.build/en/guides/integrations-guide/sitemap/)需要配置站点 URL。RSS 则应过滤草稿并使用稳定文章链接。

## 避免最常见的索引问题

1. 标签页、OG 图片路由和相关推荐都过滤草稿。
2. 同一内容不要同时保留多个可索引 URL；合并时使用永久重定向。
3. 删除内容后不要把所有旧 URL 都跳到首页，应跳到等价内容或返回 404/410。
4. sitemap 只列 canonical、可索引页面。
5. 页面没有误加 noindex，也没有被 robots.txt 阻止。

如果使用 Pagefind，继续按[Astro 博客的 Pagefind 中文搜索与分类筛选](/blog/pagefind-chinese-search-astro/)把索引限制在文章标题和正文，避免导航、页脚与演示页面污染结果。

完成技术检查后，再按[Search Console 接入与索引排查](/blog/google-search-console-blog-guide/)确认 Google 实际看到的结果。
