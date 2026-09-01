---
title: "静态个人网站选 Vercel 还是 Cloudflare Pages"
description: "按框架适配、构建限制、域名、预览部署和迁移成本比较 Vercel 与 Cloudflare Pages，给出静态学生网站的选择规则。"
pubDate: 2026-05-11
updatedDate: 2026-08-24
category: "websites-seo"
tags: ["Vercel", "Cloudflare Pages", "Astro"]
author: "Ronin.XI"
---

纯静态 Astro 个人网站，两者都能胜任。已经在 Cloudflare 管理 DNS、重视静态文件分发时，优先 Cloudflare Pages；使用 Vercel 生态框架或重视开箱即用的预览体验时，优先 Vercel。真正影响选择的是项目限制与迁移成本，不是首页宣传语。

以下限制最后核对于 2026 年 9 月 1 日，申请或迁移前请重新查看 [Vercel Limits](https://vercel.com/docs/limits) 与 [Cloudflare Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)。

## 对静态站最有影响的差异

| 维度 | Vercel | Cloudflare Pages |
| --- | --- | --- |
| Git 自动部署 | 支持 | 支持 |
| 预览部署 | 支持 | 支持 |
| 自定义域名与 HTTPS | 支持 | 支持 |
| 免费计划构建并发 | 1 | 1 |
| 单次构建超时 | 官方当前列为 45 分钟 | 官方当前列为 20 分钟 |
| 静态文件约束 | CLI 源文件上传等限制见官方页 | 免费计划站点文件数与单文件 25 MiB 限制见官方页 |

这些数字会变化；不要把它们写进长期不更新的部署脚本。

## 选择规则

- **选 Vercel**：项目使用 Vercel 重点支持的框架能力，或团队已经依赖其预览、日志和项目权限。
- **选 Cloudflare Pages**：站点是静态输出，域名和其他 Cloudflare 服务已在同一账号管理。
- **都可以**：个人简历、博客、文档站；此时选你更容易查看构建日志和迁移 DNS 的平台。

## 保持可迁移

1. 构建命令和输出目录写进 README；
2. 不把内容只存平台后台；
3. 环境变量保留名称清单，不提交值；
4. DNS TTL、重定向和自定义头单独记录；
5. 切换前用预览域名检查 canonical，正式上线后再改 DNS。

如果站点还没成型，先用[最小学生个人网站方案](/blog/personal-website-for-students/)确定内容范围。
