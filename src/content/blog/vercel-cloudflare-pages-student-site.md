---
title: "个人网站部署选 Vercel 还是 Cloudflare Pages"
description: "Vercel 和 Cloudflare Pages 都适合部署学生个人网站。本文从上手难度、域名、构建、静态站点和长期维护角度做一次实用对比。"
pubDate: 2026-05-11
tags: ["Vercel", "Cloudflare Pages", "个人网站", "Astro", "建站"]
author: "荣十一"
---

个人网站写完后，下一步就是部署。对学生和独立开发者来说，最常见的选择是 Vercel 和 Cloudflare Pages。

这两个平台都能很好地部署静态网站，也都支持从 GitHub 仓库自动构建。真正的区别不在“谁更强”，而在你的网站是什么类型、你想怎么维护。

## 如果你用 Astro、Hugo、Vite

静态博客、作品集、文档站，这类项目用 Vercel 或 Cloudflare Pages 都可以。

典型流程是：

1. 把项目推到 GitHub
2. 在平台导入仓库
3. 设置构建命令
4. 设置输出目录
5. 绑定域名

Astro 项目常见构建命令是：

```bash
npm run build
```

输出目录通常是：

```text
dist
```

## Vercel 的优势

Vercel 对前端框架非常友好，尤其是 Next.js。导入仓库、自动识别框架、预览部署、环境变量管理都比较顺手。

如果你经常做前端项目、React 项目、Next.js 项目，Vercel 的体验会更直接。每次提交代码后，它会自动生成预览链接，很适合给同学、老师或面试官看。

## Cloudflare Pages 的优势

Cloudflare Pages 很适合静态站点和全球访问。它和 Cloudflare 的 DNS、CDN、Workers 等能力放在一起，长期维护网站会比较完整。

如果你的域名本来就托管在 Cloudflare，Pages 绑定域名会很自然。对于纯静态博客，它也很稳。

## 怎么选

可以按项目类型选：

- Astro 静态博客：两者都可以
- Next.js 项目：优先 Vercel
- 纯静态作品集：两者都可以
- 域名和 DNS 已在 Cloudflare：Cloudflare Pages 更顺手
- 需要频繁给别人看预览部署：Vercel 很舒服

不要把部署平台选择想得太重。对个人网站来说，内容和维护频率比平台更重要。

## 绑定域名前检查什么

无论选哪个平台，绑定域名前都要检查：

- 构建是否成功
- 站点地图里的域名是否正确
- RSS 地址是否正确
- canonical 是否是正式域名
- 404 页面是否能正常显示
- 图片和字体是否加载

很多网站部署后看似正常，但 sitemap 还指向旧域名，搜索引擎会很难受。

## 我的建议

如果你刚开始做个人网站，选你更容易上手的平台。先发布，再优化。

后面真的遇到限制，也可以迁移。静态站点的好处就是可迁移性强，只要内容和代码在自己手里，平台不是锁死你的东西。
