---
title: "Google Search Console 接入与索引状态排查"
description: "完成站点验证和 sitemap 提交，再按 URL Inspection 状态排查已抓取未编入索引、重复网页、canonical 不一致与 soft 404。"
pubDate: 2026-01-15
updatedDate: 2026-09-01
category: "websites-seo"
tags: ["Google Search Console", "Sitemap", "URL Inspection"]
author: "荣十一"
---

Search Console 不会替你“上传网站”，也不能保证收录。先确认这个 URL 本来就应该进入 Google：如果它是旧地址、重复页、筛选参数页或已经删除的内容，显示“未编入索引”可能完全正确；如果它是独立、公开且仍有效的文章，再根据具体状态修复。

本文根据 Google Search Central 与 Search Console 官方帮助于 2026 年 9 月 1 日复核。仓库中没有保存本站的 Search Console 私有查询和点击数据，因此这里说明的是官方诊断流程，不把示例状态描述成本站实测流量结果。

## 先判断这个 URL 是否应该收录

| URL 类型 | 期望结果 | 应采取的动作 |
| --- | --- | --- |
| 独立文章、分类入口或重要说明页 | 可抓取、可索引、自指 canonical | 进入 URL Inspection 排查 |
| 已被新地址完整替代的旧 URL | 永久重定向到等价新地址 | 检查重定向目标是否可索引 |
| 无替代内容的已删除 URL | 返回 404 或 410 | 不必强行恢复收录 |
| 内容重复、查询参数或排序变体 | 归并到首选 canonical | 统一 canonical、内部链接和 sitemap |
| 登录或敏感私有页；公开但不想收录的页面 | 不应进入索引 | 私有内容使用访问控制；公开页面按需用 `noindex`，都不要混入 sitemap |

先确定期望，才能判断 Search Console 的灰色“未编入索引”数量是否真的有问题。

## 1. 选择并验证站点属性

- 能修改 DNS 时，可以使用 Domain 属性统一覆盖协议和子域名。
- 只能控制某个站点前缀时，使用 URL-prefix 属性，并确保协议、域名和路径完全一致。

按 Search Console 页面给出的 DNS TXT、HTML 文件、HTML meta 标签或其他支持方式完成验证。验证记录不要在通过后立即删除；Google 后续仍可能重新检查所有权。

完成标志是 Search Console 能打开对应属性并显示报告，而不是只在 DNS 工具中看到 TXT 记录。

## 2. 提交前先检查 sitemap

在未登录浏览器中打开 sitemap 或 sitemap index，确认：

1. 返回成功响应，不要求登录，也没有跳转循环；
2. URL 是完整的 `https://` 正式域名地址；
3. 只包含希望进入搜索结果的 canonical URL；
4. 不包含草稿、404、重定向源、`noindex` 页面或预览域名；
5. 页面自己的 canonical、内部链接和 sitemap 使用相同协议、域名与尾斜杠规则。

然后在 Search Console 的 Sitemaps 报告提交 sitemap index 或 sitemap 的完整地址。状态为 Success 只说明 Google 能读取并处理它，不代表其中每个 URL 都会被抓取或收录。

[Google sitemap 文档](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)明确把提交 sitemap 定义为提示，而不是保证。sitemap 也会向 Google 提示首选 canonical，但它弱于重定向和 `rel="canonical"`，不能抵消站内其他冲突信号。

## 3. 用 URL Inspection 记录六项信息

把完整正式 URL 输入 URL Inspection，先记录：

1. 当前是否在 Google 索引中；
2. 上次抓取时间和抓取使用的设备类型；
3. Page fetch 是否成功、返回的响应状态；
4. Indexing allowed 是否被 robots 或 `noindex` 阻止；
5. User-declared canonical；
6. Google-selected canonical。

再运行 Live Test，查看 Google 当前能否获取页面和渲染主要内容。Live Test 不能预测最终是否收录，也不能实时判断 Google 最终会选择哪个 canonical；它通过只表示当前版本具备被访问的基础条件。

## 按 Page Indexing 状态处理

| Search Console 状态 | 代表什么 | 最小动作 |
| --- | --- | --- |
| URL is on Google | 当前 URL 或其 canonical 已进入索引 | 检查 canonical 是否符合预期，无需反复请求 |
| Discovered - currently not indexed | Google 已发现 URL，但尚未抓取 | 检查内部链接、sitemap、服务器可用性和无效 URL 数量 |
| Crawled - currently not indexed | Google 已抓取，但暂未收录 | 检查独立价值、渲染正文、重复内容和 canonical，不要连续重新提交 |
| Alternate page with proper canonical tag | 该 URL 是正确归并的替代页 | 若目标 canonical 正确，不需要修复 |
| Duplicate without user-selected canonical | 页面重复且未声明首选地址 | 声明一致的 canonical，或让内容实质不同 |
| Duplicate, Google chose different canonical than user | Google 不接受你声明的首选地址 | 对比三个 URL，消除重定向、内部链接和 sitemap 冲突 |
| Page with redirect | 这个 URL 会跳转，因此自身不收录 | 检查最终目标，不要要求旧 URL 本身收录 |
| Soft 404 | 返回 200，但内容像不存在、空白或错误页 | 根据页面去向改为 404/410、301，或恢复真实正文 |
| Blocked / noindex / 4xx / 5xx | 抓取或索引被明确阻止 | 先确认阻止是否符合预期，再修复响应、权限或指令 |

这些定义来自 Google 的 [Page indexing report](https://support.google.com/webmasters/answer/7440203)。不是所有“Not indexed”状态都要修；正确的重复页、重定向源和已删除页面本来就不应作为独立结果出现。

## “已抓取，但目前未编入索引”

Google 已经取得页面，但决定暂时不把它加入索引。官方说明这个状态未来可能改变，并明确表示不需要再次提交该 URL 进行抓取。

按这个顺序检查：

1. **响应与正文**：正式 URL 返回 200，未登录也能看到主要内容；不是空壳、加载失败或只有错误提示。
2. **索引许可**：没有意外的 `noindex`，robots.txt 没有阻止必要资源，canonical 指向预期 URL。
3. **独立任务**：标题、开头和正文解决一个其他页面无法完整承接的问题，而不是换词复制。
4. **重复关系**：对比 Google-selected canonical；若另一页确实等价，应合并、重定向或接受归并。
5. **发现路径**：至少有一个正常可抓取的站内页面链接到它，且链接使用 canonical URL。
6. **sitemap 一致性**：只列当前正式 URL，没有同时列出协议、域名、尾斜杠或参数变体。

如果页面没有新的信息、步骤或结果，只修改日期、堆关键词或反复点击“Request indexing”不会解决内容重叠。若页面已经充分、信号一致且 Live Test 正常，记录修改日期并等待重新处理；Google 不保证所有合规页面最终都会收录。

## “已发现，但目前未编入索引”

这个状态表示 Google 知道 URL，但尚未抓取。Google 官方说明，常见情况是系统预计抓取会加重站点负载，因此延后访问；报告里通常没有最后抓取日期。

小型静态博客可以重点检查：

- URL 是否只出现在 sitemap，没有任何正文或列表页链接；
- 首页、分类、标签和归档是否能通过普通 `<a>` 链接到文章；
- sitemap 是否生成了大量参数、筛选、分页或重复地址；
- 正式站点是否稳定返回 200，而不是间歇性 5xx、超时或防火墙挑战；
- robots.txt 是否意外挡住文章或渲染所需资源。

修复发现路径和服务器问题后，让 Google 再次抓取即可。不要轮换 sitemap 文件或批量重复请求索引来制造优先级。

## Google 选择了不同 canonical

先在 URL Inspection 同时记录 User-declared canonical 和 Google-selected canonical，再分别打开：当前 URL、你声明的 URL、Google 选择的 URL。

常见冲突包括：

- HTTP 与 HTTPS、`www` 与裸域名同时可访问；
- 有尾斜杠和无尾斜杠都返回 200；
- 预览域名、部署域名或查询参数版本可以被抓取；
- 页面 canonical 指向 A，但 sitemap 和内部链接持续使用 B；
- 两篇文章主体高度相似，却都声明自己为 canonical；
- 旧 URL 没有永久重定向，仍返回完整重复正文。

[Google canonical 文档](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)把永久重定向和 `rel="canonical"` 视为较强信号，把 sitemap 视为较弱信号。修复时让它们保持同一方向：

1. 首选页面使用绝对、自指的 canonical；
2. 被淘汰的等价 URL 永久重定向到首选页面；
3. sitemap 只列首选页面；
4. 站内链接全部改为首选 URL；
5. 首选页面返回 200，且不是另一个跳转源。

不要用 robots.txt、URL Removal 或 `noindex` 处理站内 canonical 冲突。Google 明确说明：robots.txt 不是 canonical 工具，URL Removal 会隐藏 URL 的所有版本，`noindex` 会把页面完全排除在搜索之外。

如果两个页面其实服务不同读者状态，就不要把它们互相 canonical；应让标题、正文、示例和完成结果形成实质差异。

## Soft 404 怎么处理

Soft 404 通常是页面返回 `200 OK`，但正文告诉用户“内容不存在”，或者 Google 渲染后只得到空白、极少内容或明显错误。先在 Live Test 查看截图、HTML 与响应状态。

按真实状态选择一个结果：

- **内容永久删除且没有等价替代**：返回 404 或 410，并提供对用户有帮助的 404 页面；
- **内容已经移动到等价地址**：使用永久 301 重定向；
- **页面仍应存在**：修复服务端数据、JavaScript、被阻止资源或错误模板，让 Googlebot 能看到完整主要内容；
- **页面本来内容很少**：补足真实任务信息，或重新判断它是否值得作为独立 URL。

不要把所有已删除 URL 重定向到首页或无关分类页。那不是等价替代，也可能继续被判断为 soft 404。[Google 的抓取错误文档](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)给出了 404、410、301 与恢复正文的对应边界。

## 修改后的验证顺序

1. 部署修复，先用未登录浏览器确认正式 URL、响应和正文；
2. 查看 HTML 源码中的 canonical、robots meta 和重要内部链接；
3. 重新生成 sitemap，确认不再列出旧地址、重定向源和重复版本；
4. 在 URL Inspection 运行 Live Test；
5. 只为少量重要、已实质修复的页面请求重新编入索引；
6. 对批量问题使用 Page Indexing 报告的 Validate Fix，并等待 Google 重新处理；
7. 后续比较 Google-selected canonical 和索引状态是否回到预期。

[Google 的重新抓取说明](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)同样强调，请求抓取不保证立即收录。大量新增或更新应依靠可抓取的站内导航和 sitemap。

完成标准不是“未编入索引数量归零”，而是：应该收录的页面可访问、内容独立且信号一致；重复页、重定向源和已删除页以正确理由留在未收录列表中。

上线前先用[Astro SEO 检查清单](/blog/astro-blog-seo-checklist/)验证构建产物；如果还没有稳定的文章入口、分类和内部链接，先完成[学生个人网站的最小上线方案](/blog/personal-website-for-students/)。
