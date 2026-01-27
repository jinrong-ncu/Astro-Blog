---
title: "【Mac神技】一行代码搞定微信双开/多开！自动更新+防封号完美方案"
description: "分享一个我自用的Shell脚本，一键实现Mac微信双开。支持自动同步主微信版本，解决重签名问题，比网上复杂的教程简单10倍！"
pubDate: 2024-05-20
author: "刘金荣"
tags: ["Mac", "Shell", "效率工具", "微信"]
---

作为一名“打工人”，相信很多用 Mac 的朋友都有这个烦恼：**工作一个号，生活一个号，但 Mac 版微信只能打开一个！**

网上虽然有很多教程（比如用 `open -n` 命令），但都有各种痛点：
* ❌ 每次都要打开终端敲命令。
* ❌ 终端窗口不能关，一关微信就退了。
* ❌ **最头疼的是**：主微信更新后，双开的微信版本不匹配，打不开或者报错。

为了彻底解决这个问题，我写了一个 **Shell 脚本**，实现了**“一站式”**的微信双开体验。

## ✨ 这个脚本能做什么？

1.  **全自动配置**：第一次运行会自动复制微信、修改应用 ID、重新签名（解决打不开的问题）。
2.  **智能版本同步**：每次启动时，会自动检查你的主微信有没有更新。如果主微信更新了，脚本会自动把分身也更新到最新版！
3.  **原生体验**：启动后可以在程序坞（Dock）保留图标，以后直接点图标就行，不用再敲命令。

---

## 🚀 使用教程（小白也能懂）

不需要懂代码，只需要简单的 3 步：

### 第一步：创建脚本文件

打开你的终端（Terminal），输入以下命令创建一个文件：

```bash
touch wechat2.sh
```

### 第二步：复制脚本代码

用文本编辑器打开这个文件，或者直接在终端里用 `vim wechat2.sh`，然后把下面的代码**完整复制**进去：

```bash
#!/bin/bash

# =================================================================
# Mac 微信双开一站式脚本
# 作用：自动完成设置并启动第二个微信应用。
# 原理：首次运行时，创建微信副本并修改签名；后续运行则直接启动。
# =================================================================

# 定义主微信与第二个微信的路径
WECHAT_APP_PATH="/Applications/WeChat.app"
WECHAT2_APP_PATH="/Applications/WeChat2.app"

# 读取版本号，若失败返回 unknown
get_version() {
  local app_path="$1"
  /usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$app_path/Contents/Info.plist" 2>/dev/null || echo "unknown"
}

# 复制、改 BundleID 并重签名，供首次或重新同步时复用
setup_wechat2() {
  echo "[1/4] 正在复制应用... 请输入您的电脑密码："
  sudo cp -R "$WECHAT_APP_PATH" "$WECHAT2_APP_PATH"
  if [ $? -ne 0 ]; then
    echo "❌ 错误：复制应用失败，请检查权限或路径。"
    exit 1
  fi
  echo "✅ 应用复制成功！"

  echo "[2/4] 正在修改应用标识..."
  sudo /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.tencent.xinWeChat2" "$WECHAT2_APP_PATH/Contents/Info.plist"
  if [ $? -ne 0 ]; then
    echo "❌ 错误：修改 BundleID 失败。"
    exit 1
  fi
  echo "✅ 应用标识修改成功！"

  echo "[3/4] 正在进行应用重签名..."
  sudo codesign --force --deep --sign - "$WECHAT2_APP_PATH"
  if [ $? -ne 0 ]; then
    echo "❌ 错误：重签名失败。"
    exit 1
  fi
  echo "✅ 应用重签名成功！"

  echo "[4/4] 正在处理 Gatekeeper 设置..."
  sudo xattr -dr com.apple.quarantine "$WECHAT2_APP_PATH" >/dev/null 2>&1
  sudo spctl --add --label "WeChat2-UserApproved" "$WECHAT2_APP_PATH" >/dev/null 2>&1 || true
  echo "✅ 已尝试移除隔离并添加系统例外"
}

# --- 步骤 1: 检查是否需要进行初次设置 ---
if [ ! -d "$WECHAT_APP_PATH" ]; then
  echo "❌ 未找到 /Applications/WeChat.app，请先安装微信。"
  exit 1
fi

if [ ! -d "$WECHAT2_APP_PATH" ]; then
  echo "检测到是首次运行，正在为您配置第二个微信，请稍候..."
  echo "----------------------------------------"
  setup_wechat2
  echo "----------------------------------------"
  echo "🎉 初次设置全部完成！"
else
  SRC_VER=$(get_version "$WECHAT_APP_PATH")
  COPY_VER=$(get_version "$WECHAT2_APP_PATH")

  if [ "$SRC_VER" != "$COPY_VER" ]; then
    echo "🔄 检测到微信版本不一致，主版：$SRC_VER，副本：$COPY_VER，正在重新同步..."
    sudo rm -rf "$WECHAT2_APP_PATH"
    setup_wechat2
    echo "🎉 版本已同步为：$SRC_VER"
  else
    echo "✅ 已检测到配置且版本一致，将直接为您启动第二个微信。"
  fi
fi

# --- 步骤 2: 启动第二个微信 ---
echo "🚀 正在启动第二个微信..."
# 优先通过 open 启动（更接近 Finder 打开方式）
if ! open -n "$WECHAT2_APP_PATH" >/dev/null 2>&1; then
  # 回退到直接执行二进制
  nohup "$WECHAT2_APP_PATH/Contents/MacOS/WeChat" >/dev/null 2>&1 &
fi

# --- 步骤 3: 提示后续操作 ---
echo "✨ 启动命令已执行，请留意程序坞（Dock）中新出现的微信图标。"
echo "💡 如果出现“Apple 无法验证...”提示：请到‘系统设置 > 隐私与安全性’底部点击‘仍要打开’。"
echo "💡 技巧：右键新的微信图标，选择‘选项’->‘在程序坞中保留’，下次直接点图标即可！"
```

### 第三步：赋予权限并运行

在终端执行：

```bash
# 赋予执行权限
chmod +x wechat2.sh

# 运行脚本
./wechat2.sh
```

**注意：** 因为脚本需要复制应用程序和修改签名，所以运行过程中会提示你输入开机密码（输入密码时屏幕不会显示，输完回车即可）。

---

## 🛠️ 常见问题 (FAQ)

**Q: 为什么运行脚本后提示“无法验证开发者”？**
A: 这是 Mac 的安全机制。
1. 打开“系统设置” -> “隐私与安全性”。
2. 往下拉到“安全性”部分。
3. 你会看到拦截提示，点击“仍要打开”即可。

**Q: 以后每次都要运行脚本吗？**
A: 不需要！脚本运行一次成功后，你的应用程序列表里就会多出一个 **WeChat2**。
建议你在它启动后，在 Dock 栏图标上**右键 -> 选项 -> 在程序坞中保留**。以后直接点图标就行，和原版微信一模一样！

**Q: 主微信更新了怎么办？**
A: 如果你发现 WeChat2 打不开了，或者想升级版本，只需要**再次运行一下这个脚本**。它会自动检测到版本不一致，并帮你把 WeChat2 升级到最新版。

---

## 🤖 原理解析 (Geek 专区)

如果你对原理感兴趣，这个脚本主要做了这几件事：
1.  **物理复制**：将 `/Applications/WeChat.app` 复制为 `WeChat2.app`。
2.  **修改 BundleID**：利用 `PlistBuddy` 修改 `Info.plist` 中的 `CFBundleIdentifier`。这是为了让 macOS 认为这是两个完全不同的 APP，从而允许同时运行。
3.  **重签名 (CodeSign)**：因为修改了 Info.plist，原有的签名会失效，导致 APP 闪退。脚本使用 `codesign` 命令进行了简单的自签名。
4.  **移除隔离 (Quarantine)**：使用 `xattr` 移除苹果对下载文件的隔离标记，防止系统拦截。

希望这个小脚本能帮到大家，提高摸鱼...哦不，工作效率！😉

如果有问题，欢迎在评论区留言！👇