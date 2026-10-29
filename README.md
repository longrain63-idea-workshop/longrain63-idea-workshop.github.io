# 创意工坊

一些小应用和小工具的发布页，纯静态，托管在 GitHub Pages：

<https://longrain63-idea-workshop.github.io/>

## 结构

| 路径 | 说明 |
| --- | --- |
| `index.html` | 首页，读取 `data/apps.json` 渲染应用卡片 |
| `app.html` | 详情页模板，通过 `app.html?app=<slug>` 访问 |
| `data/apps.json` | 应用清单，全站唯一内容源 |
| `content/<slug>/` | 单个应用的封面、预览图、简介与使用手册（Markdown） |
| `assets/css`、`assets/js` | 样式与脚本 |
| `assets/vendor/marked.min.js` | 本地内置的 Markdown 渲染器，不依赖 CDN |

## 新增一个应用

1. 新建 `content/<slug>/`，放入 `cover.svg`（或 `.webp`）、预览图 `01.svg`、`02.svg`……、`intro.md`、`manual.md`
2. 在 `data/apps.json` 里追加一条记录：

```json
{
  "slug": "my-app",
  "name": "应用名",
  "tagline": "一句话介绍",
  "version": "1.0.0",
  "updated": "2026-10-29",
  "tags": ["Windows"],
  "cover": "content/my-app/cover.webp",
  "intro": "content/my-app/intro.md",
  "manual": "content/my-app/manual.md",
  "previews": ["content/my-app/01.webp"],
  "downloads": [
    { "label": "Windows x64 安装包", "url": "https://example.com/app.exe", "size": "38 MB" }
  ],
  "netdisks": [
    { "label": "百度网盘", "url": "https://pan.baidu.com/s/xxxx", "code": "abcd" }
  ]
}
```

3. 提交并推送，GitHub Pages 自动更新。

`previews`、`downloads`、`netdisks` 可以省略或留空数组，页面会自动隐藏对应区块；`intro`、`manual` 也一样。

## 大文件放哪

安装包不进仓库（GitHub 单文件上限 100MB，仓库过大也会触发警告）：

- **直接下载**：把文件传到 GitHub Releases 的附件，`downloads[].url` 填附件的下载地址
- **大文件 / 国内下载慢**：放网盘，填在 `netdisks`，附带提取码

## 本地预览

`fetch` 不能通过 `file://` 工作，需要起一个静态服务器：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 当前内容说明

`data/apps.json` 里的 HalfBeat、PDF 拆分合并、桌面便签目前是占位示例：封面和预览图是脚本生成的抽象示意图，下载与网盘链接是假地址，换成真实内容即可。
