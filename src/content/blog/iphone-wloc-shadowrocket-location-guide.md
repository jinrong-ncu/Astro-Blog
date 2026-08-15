---
title: "iPhone 无需越狱修改网络定位：WLOC + Shadowrocket 完整教程"
description: "使用 WLOC、Shadowrocket 和自建选点站 wloc.liujinrong.cn 修改 iPhone 的 Apple 网络定位，包含模块导入、HTTPS 解密、证书信任、选点、验证和恢复步骤。"
pubDate: 2026-08-15
tags: ["iPhone", "iOS", "WLOC", "Shadowrocket", "网络定位"]
author: "荣十一"
---

iPhone 不越狱，也能通过 Shadowrocket 修改 Apple 网络定位服务返回的坐标。关键不是“改 GPS 芯片”，而是让 WLOC 模块拦截 `gs-loc.apple.com` 的 Wi-Fi / 基站定位响应，再把返回坐标替换成测试位置。

我另外部署了一套 WLOC 选点页面：[wloc.liujinrong.cn](https://wloc.liujinrong.cn/)。地图选点、搜索地点、粘贴地图链接、收藏坐标、随机扰动和恢复数据都可以直接在手机上完成，不需要手填经纬度。

先把边界说清楚：这套方案适合自己的设备、自己的 App 或明确授权的定位测试。不要拿它绕过考勤、签到、支付、游戏、网约车或平台地区规则。

## WLOC 改的是网络定位，不是硬件 GPS

iOS 的定位结果会综合多个来源：

| 定位来源 | WLOC 能否修改 | 说明 |
| --- | --- | --- |
| Apple Wi-Fi / 基站网络定位 | 可以 | Shadowrocket 拦截 WLOC 响应并替换坐标 |
| GPS 卫星信号 | 不可以 | 室外 GPS 很强时，系统可能继续采用真实坐标 |
| IP 所在地区 | 不可以 | 由 Shadowrocket 当前出口节点决定 |
| App 服务端风控 | 不可以 | App 仍可能结合 IP、设备和账户信息判断 |

所以它在室内、弱 GPS 或以 Wi-Fi 定位为主的测试环境里更容易生效。室外空旷位置如果一直收到稳定 GPS 信号，地图可能在目标位置和真实位置之间跳动。

WLOC 是开源项目，原理和最新模块可以查看 [Yu9191/wloc](https://github.com/Yu9191/wloc)。它使用的是 Apple 内部网络定位链路，不是 Apple 对第三方承诺长期稳定的公开 API，系统升级后存在失效的可能。

## 开始前需要准备什么

- 一台自己的 iPhone；
- 已安装 Shadowrocket；
- Shadowrocket 中有一条可以正常联网的节点；
- Safari 可以打开 [WLOC 选点页面](https://wloc.liujinrong.cn/)；
- 愿意为两个指定 Apple 定位域名启用 HTTPS 解密。

这里不要求节点一定是美国。目标坐标来自 WLOC 设置，代理节点只负责让请求经过 Shadowrocket；节点国家影响的是 IP，不是写入的经纬度。

## 第一步：把 WLOC 模块导入 Shadowrocket

WLOC 的 Shadowrocket 模块地址是：

```text
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.module
```

在 Shadowrocket 中进入当前使用的配置，操作路径通常是：

```text
配置 → 当前配置右侧 ⓘ → 模块 → 右上角添加
```

粘贴上面的模块地址并保存，然后确认“Apple WLOC 定位修改”模块已经启用。Shadowrocket 版本不同，菜单文字可能略有区别，但入口都在当前配置的模块管理中。

不要把网上复制来的整段脚本随便覆盖到模块里。直接订阅项目的原始模块，后续项目修复 iOS 兼容问题时更容易更新。

当前模块主要包含两条规则：

- `wloc.js`：拦截 `/clls/wloc` 响应，解析并替换网络定位坐标；
- `wloc-settings.js`：拦截 `/wloc-settings/save` 请求，把选点结果写进 Shadowrocket 的持久化存储。

## 第二步：只为两个定位域名开启 HTTPS 解密

WLOC 需要读取并修改 HTTPS 响应，因此必须启用 Shadowrocket 的 HTTPS 解密。进入当前配置详情，找到“HTTPS 解密”，打开开关。

检查主机名列表中是否包含：

```text
gs-loc.apple.com
gs-loc-cn.apple.com
```

正常情况下，导入模块后会自动追加这两个域名。如果没有，就手动添加。

不要为了省事填写 `*` 或开启全部域名解密。CA 证书属于高权限配置，把范围限制在这两个 WLOC 主机，可以减少对其他账户、支付和网页流量的影响。

## 第三步：安装并完全信任 Shadowrocket CA 证书

只打开 HTTPS 解密开关还不够，iOS 必须安装并信任 Shadowrocket 生成的 CA 证书。

先在 Shadowrocket 的“HTTPS 解密”页面生成并安装证书。系统提示描述文件已经下载后，进入：

```text
设置 → 通用 → VPN 与设备管理 → 已下载的描述文件 → 安装
```

安装完成后，再进入：

```text
设置 → 通用 → 关于本机 → 证书信任设置
```

找到刚刚生成的 Shadowrocket 证书，开启“完全信任”。回到 Shadowrocket，证书状态应该显示系统已信任。

这一步最容易漏：描述文件“已安装”不等于证书“已完全信任”。如果证书没有完全信任，选点页面通常可以打开，但点击“储存到设备”会提示模块未生效。

证书不要转发给其他人，也不要安装来源不明的 CA。测试结束且不再使用 WLOC 时，应关闭 HTTPS 解密并移除证书，恢复范围会在后面单独说明。

## 第四步：让 Safari 请求经过 Shadowrocket

回到 Shadowrocket 首页：

1. 选择一条可以正常联网的节点；
2. 打开 Shadowrocket 总开关；
3. 确认系统状态栏或控制中心出现 VPN 状态；
4. 保持 WLOC 模块和 HTTPS 解密同时启用。

全局路由可以继续使用“配置”。只要当前配置没有把 `gs-loc.apple.com` 绕过脚本，没必要为了 WLOC 长期开全局代理。

此时应该同时满足五个条件：

- Shadowrocket 已连接；
- WLOC 模块已启用；
- HTTPS 解密已开启；
- CA 证书已安装并完全信任；
- MITM 主机名包含两个 Apple WLOC 域名。

## 第五步：在自建 WLOC 页面选择位置

用 iPhone Safari 打开：

```text
https://wloc.liujinrong.cn/
```

页面提供六种底图：卫星、WGS84、高德、彩色、标准和暗色。选择位置有三种方法：

1. 直接在地图上点击或拖动蓝色标记；
2. 在“搜索地点”中输入地名；
3. 粘贴 Apple Maps、Google Maps、高德、百度地图链接或经纬度文本。

高德地图在中国大陆使用 GCJ-02 坐标，而 WLOC 内部写入 WGS84。这个选点页面会在高德底图和 WGS84 之间自动换算，直接点目标位置即可，不用自己计算偏移。

选好位置后，页面会显示六位小数的经纬度。第一次测试建议把“扰动半径”保持为 `0`，方便反复验证同一个坐标。需要模拟小范围位置变化时，再填写一个合理的米数。

## 第六步：储存坐标并检查当前生效值

点击“储存到设备”。正常情况下，按钮会变成“已储存”，页面底部同时显示写入的经纬度和时间。

这个操作不是把坐标上传给 Apple。页面会请求一个专门的设置路径：

```text
https://gs-loc.apple.com/wloc-settings/save
```

它由 Shadowrocket 的 `wloc-settings.js` 在本机拦截，随后把坐标写入持久化字段 `wloc_settings`。下次 iOS 请求 Apple WLOC 网络定位时，另一个脚本才会读取这个坐标并替换响应。

写入后，在“当前生效坐标”卡片点击“刷新”。如果能看到经度、纬度、精度和扰动半径，说明网页到 Shadowrocket 模块的设置链路已经打通。

页面里的两类数据并不在同一个地方：

| 数据 | 保存位置 | 清除浏览器缓存后的结果 |
| --- | --- | --- |
| 收藏的位置 | Safari `localStorage` | 收藏会消失 |
| 当前生效坐标 | Shadowrocket 持久化存储 | 不受 Safari 缓存影响 |

收藏只是方便下次快速选点。点击一个收藏后，还要再点一次“储存到设备”，它才会成为新的生效坐标。

## 第七步：让 iOS 重新请求网络定位

坐标成功写入，不代表地图会立即刷新。尤其是 iOS 26 及更新系统，`locationd` 可能长时间复用此前的定位缓存。

先试一次影响较小的流程：

1. 彻底关闭地图 App；
2. 关闭“设置 → 隐私与安全性 → 定位服务”；
3. 保持 Shadowrocket 配置不变；
4. 重新打开定位服务；
5. 再打开地图验证。

如果仍然显示旧位置，直接重启 iPhone。重启后按下面的顺序操作：

1. 先连接 Shadowrocket，确认 VPN 已出现；
2. 确认 WLOC 模块和 HTTPS 解密仍处于开启状态；
3. 再打开定位服务；
4. 最后打开 Apple 地图检查位置。

重启的目的不是重新安装模块，而是清理 `locationd` 内存中的旧定位结果，让系统重新发起 WLOC 请求。

## 怎么判断是哪一步没成功

| 表现 | 更可能的原因 | 处理方法 |
| --- | --- | --- |
| 页面显示“模块未生效” | 模块、HTTPS 解密或证书缺一项 | 检查模块开关、两个主机名和证书完全信任 |
| 点击储存后仍查询失败 | Safari 请求没有经过当前 Shadowrocket 配置 | 检查 VPN 状态和当前启用的配置 |
| 已显示生效坐标，地图仍是真实位置 | iOS 定位缓存或硬件 GPS 优先 | 关闭地图后重试；iOS 26+ 建议重启 |
| 地图一直转圈 | 脚本异常、旧模块或多个同类模块冲突 | 临时关闭 WLOC，更新模块并检查日志 |
| 定位在真假位置之间跳动 | GPS 与网络定位结果互相竞争 | 改到室内或弱 GPS 环境测试 |
| 选点页面地图加载失败 | 地图库或瓦片服务无法访问 | 检查 Shadowrocket 节点后刷新页面 |

排查时别同时安装多个拦截 `gs-loc.apple.com` 的模块。两套脚本改同一条响应，最常见的结果不是“双倍生效”，而是地图一直加载或脚本直接报错。

## 如何恢复真实定位

最稳妥的恢复方法是关闭或删除 WLOC 模块，然后重启 iPhone。模块停止拦截后，Apple 网络定位响应会恢复原样。

如果只是临时清除目标位置，可以在 [WLOC 选点页面](https://wloc.liujinrong.cn/) 的“当前生效坐标”中点击“清除数据”。保持官方模块的默认参数不变时，清除 `wloc_settings` 后脚本会进入透传模式。

如果你曾手工修改模块里的默认经纬度，仅清除网页保存的数据可能不够，因为脚本仍会读取模块参数。遇到这种情况直接关闭模块，再重启设备。

完全不再使用时，再做两步收尾：

1. 在 Shadowrocket 中关闭 HTTPS 解密；
2. 到“设置 → 通用 → VPN 与设备管理”和“证书信任设置”中删除证书并取消信任。

## 使用限制和安全边界

- WLOC 只修改 Apple Wi-Fi / 基站网络定位，不能控制 GPS 卫星信号。
- App 可以结合 IP、蓝牙、运动传感器、账户和服务端数据识别异常位置。
- HTTPS 解密证书具有较高权限，只应安装在自己的设备上，并把主机范围限制到 WLOC 域名。
- Apple 内部接口、iOS 缓存策略和 Shadowrocket 模块格式都可能变化，失效时先查看项目更新。
- 请只用于开发调试、定位功能测试、自动化测试或其他获得明确授权的场景。

选点入口：[wloc.liujinrong.cn](https://wloc.liujinrong.cn/)

项目与最新模块：[Yu9191/wloc](https://github.com/Yu9191/wloc)
