---
title: "书籍封面抓取：从未公开接口迁移到 Open Library"
description: "不再依赖微信读书未公开接口，改用有文档的 Open Library Covers API，并处理 ISBN、尺寸、缺图和版权边界。"
pubDate: 2026-01-26
updatedDate: 2026-09-01
category: "dev-tools"
tags: ["Open Library", "ISBN", "Node.js", "Python"]
author: "荣十一"
---

原文使用微信读书未公开接口抓取封面，接口稳定性、授权和批量使用边界都不清楚。本次改为有公开文档的 [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)，并保留缺图处理。

## 用 ISBN 生成封面地址

Open Library 支持按 ISBN 请求 S、M、L 三种尺寸：

~~~text
https://covers.openlibrary.org/b/isbn/9780140328721-L.jpg?default=false
~~~

加上 default=false 时，找不到封面会返回 404，程序就能区分真实图片和默认占位图。

## Node.js 下载示例

~~~js
import { writeFile } from "node:fs/promises";

async function downloadCover(isbn) {
  const clean = isbn.replaceAll("-", "");
  const url = `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`;
  const response = await fetch(url);

  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(`${clean}.jpg`, bytes);
  return true;
}

await downloadCover("978-0-14-032872-1");
~~~

## Python 下载示例

~~~python
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen

isbn = "9780140328721"
url = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false"

try:
    Path(f"{isbn}.jpg").write_bytes(urlopen(url, timeout=15).read())
except HTTPError as error:
    if error.code != 404:
        raise
~~~

## 批量使用时的边界

- 先去除 ISBN 中的连字符，并校验长度或校验位；
- 设置超时、有限并发和失败重试，不要高频扫库；
- 记录来源与获取日期，便于以后替换；
- 缺图时保留占位状态，不要把其他版本封面强行当成同一本书；
- 封面仍可能受版权保护，公开展示和再分发前需要确认用途与授权。

如果必须使用商业数据或稳定 SLA，应选择明确授权的图书数据服务，而不是继续猜测第三方 App 的内部接口。
