# 创意工坊

小应用和小工具的发布页，纯静态，托管在 GitHub Pages：

<https://longrain63-idea-workshop.github.io/>

## 结构

| 路径 | 说明 |
| --- | --- |
| `index.html` | 首页，读取 `data/apps.json` 渲染应用卡片 |
| `app.html` | 详情页模板，通过 `app.html?app=<slug>` 访问 |
| `data/apps.json` | 应用清单，全站唯一内容源 |
| `content/<slug>/` | 单个应用的封面、预览图、简介与使用手册（Markdown） |
| `downloads/<slug>/` | 安装包与绿色版，直接由站点提供下载 |
| `assets/css`、`assets/js` | 样式与脚本 |
| `assets/vendor/marked.min.js` | 本地内置的 Markdown 渲染器，不依赖 CDN |

## 新增一个应用

1. 新建 `content/<slug>/`，放入 `cover.svg`（或 `.webp`）、预览图 `01.svg`、`02.svg`……、`intro.md`、`manual.md`
2. 把安装包放进 `downloads/<slug>/`
3. 在 `data/apps.json` 里追加一条记录：

```json
{
  "slug": "my-app",
  "name": "应用名",
  "tagline": "一句话介绍",
  "version": "1.0.0",
  "updated": "2026-10-30",
  "tags": ["Windows"],
  "cover": "content/my-app/cover.webp",
  "intro": "content/my-app/intro.md",
  "manual": "content/my-app/manual.md",
  "previews": ["content/my-app/01.webp"],
  "downloads": [
    { "label": "Windows x64 安装包", "url": "downloads/my-app/Setup.exe", "size": "23 MB" }
  ],
  "netdisks": [
    { "label": "百度网盘", "url": "https://pan.baidu.com/s/xxxx", "code": "abcd" }
  ]
}
```

4. 提交并推送，GitHub Pages 自动更新。

`previews`、`downloads`、`netdisks` 可以省略或留空数组，页面会自动隐藏对应区块；`intro`、`manual` 也一样。只剩一个下载面板时，页面会自动铺满整行。

## 安装包放哪

目前安装包直接放在 `downloads/<slug>/`，由 Pages 提供**直接下载**。现在六个包合计约 117 MB，仓库和站点都远低于 GitHub 的上限（单文件 100 MB、仓库建议 1 GB、Pages 站点 1 GB）。

如果以后包体总量接近上限，把大包迁到 GitHub Releases（附件单文件可到 2 GB），只把 `downloads[].url` 换成附件地址即可，页面不用改。国内下载慢的包可以另外挂网盘，填在 `netdisks`。

## 本地预览

`fetch` 不能通过 `file://` 工作，需要起一个静态服务器：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 当前内容

- **nothing 文件检索** 0.9.11
- **半拍 HalfBeat** 0.2.0
- **诗词桌面壁纸** 0.2.0

三个应用的效果预览都已换成真实运行截图（截图较大的用 WebP 存放）；封面是按各应用视觉风格生成的示意图，nothing 的封面按软件实际图标绘制。以后换图直接替换 `content/<slug>/01.*`、`02.*`，并同步更新 `data/apps.json` 里的 `previews` 路径。
