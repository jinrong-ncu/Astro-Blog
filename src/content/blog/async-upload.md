---
title: "React 多文件上传：并发队列、取消与安全直传"
description: "用有限并发、AbortController 和明确状态管理批量上传；生产环境通过服务端签发 URL，绝不把对象存储密钥放进浏览器。"
pubDate: 2021-09-11
updatedDate: 2026-09-01
category: "dev-tools"
tags: ["React", "AbortController", "S3", "Cloudflare R2"]
author: "荣十一"
---

多文件上传需要同时解决三件事：限制并发避免网络与内存被占满、让每个任务可以取消、让浏览器在不接触存储密钥的前提下上传。本站的[上传演示](/demos/upload/)只模拟队列和取消，不会把你选择的文件发到服务器。

## 状态模型先于 UI

每个文件至少记录：

~~~ts
type UploadStatus = "waiting" | "uploading" | "success" | "error" | "cancelled";

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  abortController?: AbortController;
}
~~~

队列调度器每次只把 waiting 任务补到并发上限。任务完成、失败或取消后，再调度下一项。不要一次 Promise.all 所有文件。

## 取消必须传到网络层

创建任务时保存 AbortController，并把 signal 交给 fetch 或实际上传 SDK：

~~~ts
const controller = new AbortController();

await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  signal: controller.signal,
});

controller.abort();
~~~

只有把 signal 传到底层请求，取消才会停止传输。仅把界面状态改成 cancelled，网络仍可能继续。

## 生产环境使用签名 URL

安全流程是：

1. 浏览器把文件名、类型和大小发给你已有的服务端；
2. 服务端鉴权、验证文件规则，并向 S3/R2 生成短期签名 URL；
3. 浏览器直接 PUT 到该 URL；
4. 上传后由服务端确认对象、写入业务记录。

不要在 React 代码、环境变量前缀或静态配置里放 access key 与 secret key。前端构建产物对访问者可见。

## 进度、重试和重复文件

- fetch 本身没有通用上传进度事件；需要精确进度时可使用 XHR 或支持进度回调的客户端。
- 重试只针对可恢复错误，并限制次数；取消不应自动重试。
- 对象 key 使用服务端生成的随机标识，不直接信任文件名。
- 校验 MIME、扩展名、大小和账号配额；公开下载还需评估恶意内容。
- 组件卸载时中止所有活动任务，避免继续更新已卸载界面。

## 验收清单

把并发设为 3，选择 8 个文件：同一时刻最多应有 3 个 uploading；取消其中一个后，下一个 waiting 任务开始；点击全部取消后，不再出现新的成功任务。生产接入还要在浏览器网络面板确认请求确实被终止。
