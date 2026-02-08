---
title: "Mac 专属：Charles v5.0.2 最新版安装教程 + HTTPS 抓包配置 (含资源)"
description: "专为 macOS 用户打造。详解 Charles 5.0.2 ISO 镜像的正确安装姿势（ISO -> DMG -> 拖拽），并附带 HTTPS 证书信任全流程。"
pubDate: 2026-02-08
tags: ["Mac", "Charles", "抓包", "前端开发", "效率工具"]
---

Charles (青花瓷) 更新到了 **v5.0.2**。对于 Mac 开发者来说，它是调试网络请求的神器。

这次提供的安装包是 **.iso 格式**，它的结构和普通安装包不太一样，很多朋友打开后会懵。其实非常简单，这篇教程带你一步步搞定。

## 📥 资源下载

这是目前最新的 Charles v5.0.2 版本（Mac 可用）：

> **下载地址：**
> [👉 点击下载 Charles Proxy v5.0.2.iso](https://psv4.userapi.com/s/v1/d2/To01rQdegwHmR5kC1IuiLAYt1OkRPgDr01GoOZXxJDTEi9lTazjVuIWZFdNWGO0Hz76vabIYuQw4dO7PJqsumKgcnMy4fouxjOpaLXp-C_iKXPIbCrZ2mBBbH9MkfH4iAdhtjs8R8rtp/Charles_Proxy_v5_0_2.iso)

---

## 💿 第一步：正确安装步骤

这个 ISO 文件其实是一个“压缩包”，里面藏着真正的安装程序。

### 1. 挂载镜像
下载完成后，直接**双击** `Charles_Proxy_v5_0_2.iso` 文件。
macOS 会自动将它挂载，桌面上会出现一个光盘图标。

### 2. 找到安装包
打开那个挂载好的光盘，你会看到一个名为 **"Charles Proxy v5.0.2"** 的文件夹。
**双击进入该文件夹**，里面有一个 `.dmg` 文件（通常叫 `Charles Proxy v5.0.2.dmg`）。

### 3. 拖拽安装
**双击这个 .dmg 文件**，系统会弹出标准的安装窗口。
这一步大家都很熟悉了：**将左边的 Charles 图标拖入右边的 Applications (应用程序) 文件夹中**。

### 4. 解决“文件已损坏” (必看)
如果你安装后打开 Charles 提示“文件已损坏”或“无法验证开发者”，这是 macOS 的安全机制在拦截。
* **解决方法**：打开终端 (Terminal)，输入以下命令并回车（输入密码时不会显示）：
    ```bash
    sudo xattr -cr /Applications/Charles.app
    ```
* 或者去 **系统设置** -> **隐私与安全性** -> 底部点击 **“仍要打开”**。

---

## 🔐 第二步：配置 Mac 证书 (解决 HTTPS 乱码)

刚装好时，抓 HTTPS 请求全是 `<unknown>`，必须在 macOS 的“钥匙串”里信任证书。

1.  打开 Charles，点击顶部菜单栏：**Help** -> **SSL Proxying** -> **Install Charles Root Certificate**。
2.  系统会自动弹出 **“钥匙串访问” (Keychain Access)** 窗口。
3.  在左侧或列表中找到 **Charles Proxy CA** (通常带个红叉 ❌)。
4.  **双击它**，点击展开 **“信任” (Trust)** 三角形。
5.  将 **“使用此证书时” (When using this certificate)** 修改为 **【始终信任】 (Always Trust)**。
6.  关闭窗口，输入开机密码保存。红叉变成加号 ➕ 即表示成功。

---

## 📱 第三步：iPhone/iPad 抓包配置

这是 iOS 开发或 H5 调试的必经之路。

### 1. 手机连接代理
1.  确保手机和 Mac 连在**同一个 Wi-Fi** 下。
2.  Mac 端 Charles 点击：**Help** -> **Local IP Address**，查看本机 IP (例如 `192.168.1.5`)。
3.  iPhone 设置 -> 无线局域网 -> 点击当前 Wi-Fi 后面的 `(i)` 图标。
4.  底部 **配置代理** -> 选择 **手动**。
    * **服务器**：填 Mac 的 IP。
    * **端口**：填 `8888`。
5.  点击存储。此时 Mac 上会弹窗提示，点击 **Allow**。

### 2. 安装并信任证书 (iOS 最严步骤)
iOS 必须完成**两步信任**，否则无法抓包：

* **第一步：下载与安装**
    * iPhone Safari 访问 `chls.pro/ssl`。
    * 允许下载配置文件。
    * 去 **设置** -> **已下载描述文件** -> 点击安装 Charles Proxy CA。

* **第二步：开启根证书信任 (容易漏！)**
    * 去 **设置** -> **通用** -> **关于本机**。
    * 拉到底部 -> **证书信任设置**。
    * 找到 Charles Proxy CA，**打开右边的开关**。

---

## ⚙️ 第四步：开启 SSL 代理 (最后一步)

回到 Mac 端 Charles：
1.  点击菜单栏 **Proxy** -> **SSL Proxying Settings**。
2.  勾选 **Enable SSL Proxying**。
3.  点击 **Add** (添加规则)：
    * Host: `*`
    * Port: `443` (或者填 `*` 也行)
4.  点击 OK。

**🎉 现在重启 Charles，你应该能看到清爽的 JSON 数据了！**