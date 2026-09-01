---
title: "Astro 博客的 Pagefind 中文搜索：只索引正文并按分类筛选"
description: "让 Pagefind 只收录 Astro 文章标题与正文，排除导航、页脚和演示页；再用分类 filter、按需加载和中文查询完成可验证的站内搜索。"
pubDate: 2026-08-29
category: "websites-seo"
tags: ["Pagefind", "Astro", "Static Site Search"]
author: "Ronin.XI"
---

Astro 项目安装并运行 Pagefind，不代表站内搜索已经在使用它。先确认前端是否真的加载 `/pagefind/pagefind.js`，再用 `data-pagefind-body` 限定文章内容，并通过 `data-pagefind-filter` 建立分类筛选。

这个博客改造前虽然在构建脚本中运行 Pagefind，搜索框却把所有 Markdown 正文再次序列化到每个页面，再由自定义脚本匹配。第一次完成改造后的构建结果是：Pagefind 索引从 109 个页面收敛到 24 篇公开文章，并识别出 `category`、`tag` 两类过滤器。写入本教程后文章数量会继续增加，所以不要把 24 当成固定目标。

## 先确认当前搜索到底用了什么

在项目根目录搜索 Pagefind 和自建索引：

~~~bash
rg -n 'pagefind|search-index|getCollection\("blog"\)' package.json src
~~~

如果只在构建脚本里看到：

~~~json
{
  "scripts": {
    "build": "astro build && npx pagefind --site dist"
  }
}
~~~

但搜索组件没有导入 `/pagefind/pagefind.js`，那么 Pagefind 产物可能根本没有被用户调用。本项目原来的 `Search.astro` 还会读取所有文章、剥离 Markdown，再把正文 JSON 内联进每个 HTML；这既重复了索引工作，也让页面携带与当前内容无关的数据。

预期改造结果是：Astro 只输出页面和索引标记，Pagefind 在构建后生成独立静态文件，浏览器打开搜索框时才加载它们。

## 只标记文章标题区和正文

Pagefind 默认从整个 `<body>` 开始索引。一旦站点中出现 `data-pagefind-body`，没有这个属性的页面会被排除；同一页面可以有多个标记区域，它们的内容会合并。

文章页可以把标题信息与正文分别标记：

~~~astro
<article>
  <header data-pagefind-body>
    <h1>{entry.data.title}</h1>
    <!-- 分类、标签、日期 -->
  </header>

  <div data-pagefind-body class="prose">
    <Content />
  </div>

  <aside>
    <!-- 相关推荐不会进入索引 -->
  </aside>
</article>
~~~

不要把属性加到全站 Layout 的 `<main>`。那会让首页、分类页、项目页和演示页重新进入索引，也会把同一导航文案重复写进大量页面。

本项目只在公开文章路由中添加标记；草稿原本就不会生成文章页，因此也不会进入 Pagefind。

## 把分类、标签和结果摘要写成元数据

搜索结果需要文章描述、分类、标签和更新日期。它们不必重复显示在正文里，可以从 Layout 的 `<head>` 交给 Pagefind：

~~~astro
<meta
  name="description"
  content={description}
  data-pagefind-meta="description[content]"
/>
<meta
  data-pagefind-filter="category[content]"
  content={pagefind.category}
/>
<meta
  data-pagefind-meta="category[content]"
  content={pagefind.categoryLabel}
/>
<meta
  data-pagefind-meta="tags[content]"
  content={pagefind.tags.join(" · ")}
/>
<meta
  data-pagefind-meta="date[content]"
  content={pagefind.date}
/>
~~~

这里故意把分类 filter 保存为稳定 ID，例如 `websites-seo`，把用户看到的中文名称保存为 metadata。筛选逻辑不会因为显示文案调整而失效，结果卡片仍可显示“建站与 SEO”。

标签允许一篇文章拥有多个值，直接在现有标签链接上捕获：

~~~astro
{
  entry.data.tags.map((tag) => (
    <a
      href={`/tags/${encodeURIComponent(tag)}/`}
      data-pagefind-filter="tag"
    >
      {tag}
    </a>
  ))
}
~~~

Pagefind 会自动把第一个 `h1` 作为标题 metadata。页面存在多个 `h1` 或特殊布局时，再显式添加 `data-pagefind-meta="title"`，不要同时维护另一份标题字符串。

## 搜索框打开时再加载 Pagefind

Pagefind 的浏览器 API 位于构建产物，不应该被 Vite 当作源码依赖打包。用动态路径在运行时加载：

~~~ts
type PagefindModule = {
  init: () => Promise<void>;
  filters: () => Promise<Record<string, Record<string, number>>>;
  search: (
    term: string | null,
    options?: { filters?: Record<string, string> },
  ) => Promise<{
    results: Array<{
      data: () => Promise<{
        url: string;
        meta: Record<string, string>;
      }>;
    }>;
  }>;
};

const bundlePath = "/pagefind/pagefind.js";
const pagefind = (await import(
  /* @vite-ignore */ bundlePath
)) as PagefindModule;

await pagefind.init();
~~~

如果站点部署在子路径而不是域名根目录，`bundlePath` 必须跟随实际 base path，不能直接照抄 `/pagefind/`。

这个博客把加载 Promise 缓存在 `window` 上，避免页面生命周期重复初始化；搜索框打开时先初始化，用户输入时调用 `preload()`，再延迟约 160 毫秒执行搜索。快速连续输入还要为请求编号，只渲染最后一次结果，避免旧请求覆盖新查询。

## 同时支持关键词和仅分类浏览

先读取可用过滤器，给下拉选项显示实际文章数：

~~~ts
const filters = await pagefind.filters();
const categoryCounts = filters.category ?? {};
~~~

关键词与分类同时存在时：

~~~ts
const response = await pagefind.search(query, {
  filters: { category: selectedCategory },
});
~~~

用户只选择分类、不输入关键词时，把搜索词传为 `null`：

~~~ts
const response = await pagefind.search(null, {
  filters: { category: selectedCategory },
});
~~~

Pagefind 的搜索响应先返回轻量结果引用。界面只展示前八条时，再加载这八条的数据：

~~~ts
const visibleResults = await Promise.all(
  response.results.slice(0, 8).map((result) => result.data()),
);
~~~

如果使用 `innerHTML` 拼接自定义结果卡片，标题、描述、标签和 URL 必须先进行 HTML 转义。Pagefind 索引来自自己的静态内容，也不应成为跳过输出编码的理由。

## 中文搜索的预期和限制

Pagefind 的 Extended 版本支持中文分词，这也是直接运行 `npx pagefind` 时的默认版本。它可以把连续中文文本拆成可搜索片段，但官方当前明确说明中文不支持 stemming。

因此验证时应使用真实中文词组：

- 搜索“学生资格”，确认能找到包含对应片段的文章；
- 搜索“Astro”，确认英文产品名仍能匹配；
- 搜索分类 ID 不应成为主要用法，用户通过分类下拉选择；
- 不要承诺同义词、词根变化或语义搜索能力。

Pagefind 是静态全文检索，不是向量搜索，也不需要为了中文接入服务器或数据库。

## 构建并验证真实产物

`astro dev` 不会自动生成这个项目的 Pagefind 目录。完成改动后运行：

~~~bash
npm run build
npm run preview
~~~

构建日志应出现类似结果：

~~~text
Found a data-pagefind-body element on the site.
Ignoring pages without this tag.
Indexed 25 pages
Indexed 2 filters
~~~

数字取决于公开文章数量。更重要的是确认：

1. 索引页数等于公开文章数，而不是所有 HTML 数量；
2. `filters.category` 的计数总和等于索引文章数；
3. 首页 HTML 不再包含旧的完整正文 JSON；
4. 打开搜索框后，浏览器才请求 `/pagefind/`；
5. 关键词搜索和仅分类搜索都返回正确 URL；
6. 深色模式、键盘 Enter、关闭按钮和移动端下拉框仍能使用。

本次最终浏览器验证中，“Pagefind”返回 3 篇相关文章；清空关键词并选择“建站与 SEO”后返回 6 篇，而且结果的分类 metadata 全部一致。这是 2026-09-01 当时内容集合的实测结果，不是固定断言。

## 常见失败与回退

| 症状 | 原因 | 最小修复 |
| --- | --- | --- |
| 开发模式提示索引未生成 | `/pagefind/` 只在生产构建后存在 | 用 `npm run build && npm run preview` 验证 |
| 构建仍索引所有页面 | `data-pagefind-body` 加在全局 Layout | 只在文章需要检索的区域添加 |
| 分类数量都是 0 | filter 名称或 `content` 值不一致 | 检查 `category[content]` 和中央分类 ID |
| 标题或描述为空 | 页面缺少首个 `h1`，metadata 未捕获属性 | 显式设置 `title`、`description[content]` |
| 快速输入时结果跳回旧查询 | 异步结果没有版本控制 | 只渲染最后一次请求 |
| 部署后动态导入 404 | 站点部署在子路径 | 让 bundle path 使用实际 base path |

需要回退时，应同时恢复搜索组件和页面上的 Pagefind 标记。只删除 `data-pagefind-body` 而继续构建 Pagefind，会让它再次索引整个 `<body>`；只恢复旧搜索组件则会重新把正文 JSON放回每个页面。

Pagefind 官方的[索引范围文档](https://pagefind.app/docs/indexing/)说明了 `data-pagefind-body` 的全站行为，[过滤器文档](https://pagefind.app/docs/filtering/)和[浏览器 API](https://pagefind.app/docs/api/)给出了 filter 与动态搜索方式，[多语言文档](https://pagefind.app/docs/multilingual/)记录了中文分词边界。以上资料于 2026-09-01 复核。

要检查搜索之外的 canonical、sitemap、RSS 和结构化数据，继续看[Astro 博客上线前的 SEO 清单](/blog/astro-blog-seo-checklist/)。
