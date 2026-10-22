# 龙哥的AI进阶之路

一个用 [VitePress](https://vitepress.dev/) 搭建的个人 AI 学习博客，记录我的 AI 学习路线与进阶笔记。

## 本地开发

```bash
# 安装依赖（首次）
npm install

# 启动本地预览，默认 http://localhost:5173
npm run docs:dev

# 构建静态站点到 docs/.vitepress/dist
npm run docs:build

# 本地预览构建产物
npm run docs:preview
```

## 目录结构

```
longge-ai-blog/
├── .vitepress/
│   └── config.js        # 站点配置：导航 / 侧边栏 / 搜索 / 编辑链接
├── docs/
│   ├── index.md         # 首页（hero）
│   ├── roadmap.md       # AI 学习路线总览
│   ├── about.md         # 关于我
│   ├── base-models/     # 基础模型笔记（Claude / GPT ...）
│   ├── post-training/   # 后训练笔记（SFT / RLHF / DPO ...）
│   └── agent/           # Agent 笔记
├── .github/workflows/   # GitHub Pages 自动部署
└── package.json
```

## 写新文章

在 `docs/` 下任意位置新建 `.md` 文件即可。文章顶部可用 frontmatter：

```md
---
title: 文章标题
---

## 一级小节
内容……
```

新增栏目后，记得到 `.vitepress/config.js` 的 `nav` 和 `sidebar` 里补上链接。

## 部署到 GitHub Pages

1. 把项目推送到 GitHub 仓库（如 `你的用户名/longge-ai-blog`）。
2. 打开 `.vitepress/config.js`，把 `base` 的注释去掉并改成 `/仓库名/`（如 `/longge-ai-blog/`）。
3. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
4. 之后每次 `git push` 到 `main` 分支，GitHub Actions 会自动构建并发布。
   访问地址：`https://你的用户名.github.io/仓库名/`
