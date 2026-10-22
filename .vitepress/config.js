import { defineConfig } from 'vitepress'

// ↓↓↓ 改成你自己的信息（改这一处即可全局生效）↓↓↓
const ghUser = 'dragon015'
const repo = 'longge-ai-blog'
const ghRepoUrl = `https://github.com/${ghUser}/${repo}`
// 部署到 GitHub Pages 项目页：网址为 https://dragon015.github.io/longge-ai-blog/
const base = '/longge-ai-blog/'

export default defineConfig({
  lang: 'zh-CN',
  title: '龙哥的AI进阶之路',
  description: '记录我的 AI 学习路线与进阶笔记',
  base,

  // 内容目录：.vitepress 配置在项目根，markdown 源文件在 docs/ 下
  srcDir: 'docs',

  // 站内链接均为无后缀路由（如 /knowledge/training），VitePress SPA 可正常解析，
  // 但 1.6.x 的死链预检会误报，故关闭；链接可用性由 dev/preview 实测保证
  ignoreDeadLinks: true,

  // 站点图标（favicon）
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

  // Markdown 增强：数学公式（MathJax）。Mermaid 图由主题客户端脚本渲染
  markdown: {
    math: true,
  },

  // mermaid v11 内部按需动态 import 图表模块，dev 模式下需预构建，
  // 否则依赖加载不全会导致 render() 失败、图退化成纯文本代码块
  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },

  themeConfig: {
    logo: '/favicon.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '🗺️ 学习路线',
        items: [
          { text: '我的进阶路线', link: '/roadmap' },
          { text: '全网优质学习资源', link: '/roadmap/learning-resources' },
        ],
      },
      {
        text: '📚 知识库',
        items: [
          { text: '知识库总览', link: '/knowledge/' },
          { text: '🔄 知识成长飞轮', link: '/knowledge/graph' },
          { text: '🕳️ 知识缺口', link: '/knowledge/gaps' },
          { text: '机器学习基础', link: '/knowledge/ml-basics' },
          { text: 'Transformer 架构', link: '/knowledge/transformer' },
          { text: '注意力机制', link: '/knowledge/attention' },
          { text: '推理模型', link: '/knowledge/reasoning' },
        ],
      },
      {
        text: '🧠 模型笔记',
        items: [
          { text: '基础模型', link: '/base-models/claude' },
          { text: '　├ Claude', link: '/base-models/claude' },
          { text: '　├ GPT', link: '/base-models/gpt' },
          { text: '　├ DeepSeek', link: '/base-models/deepseek' },
          { text: '模型架构', link: '/architecture/' },
          { text: '后训练', link: '/post-training/' },
          { text: '训练系统', link: '/training-systems/' },
          { text: '推理模型', link: '/inference-models/' },
          { text: '推理优化', link: '/inference-optimization/' },
          { text: '评测', link: '/evaluation/' },
        ],
      },
      {
        text: '🤖 Agent',
        items: [
          { text: '总览', link: '/agent/' },
          { text: '工具调用', link: '/agent/tool-use' },
        ],
      },
      { text: '👤 关于', link: '/about' },
    ],

    sidebar: {
      '/knowledge/': [
        {
          text: '地图层 · 入口与工具',
          items: [
            { text: '知识库总览（MOC）', link: '/knowledge/' },
            { text: '知识图谱', link: '/knowledge/graph' },
            { text: '知识缺口', link: '/knowledge/gaps' },
            { text: '概念别名表', link: '/knowledge/aliases' },
          ],
        },
        {
          text: '① 地基',
          collapsed: false,
          items: [
            { text: '机器学习基础', link: '/knowledge/ml-basics' },
            { text: '神经网络与反向传播', link: '/knowledge/neural-networks' },
          ],
        },
        {
          text: '② 核心骨架',
          collapsed: false,
          items: [
            { text: 'Transformer 架构', link: '/knowledge/transformer' },
            { text: '注意力机制', link: '/knowledge/attention' },
          ],
        },
        {
          text: '③ 训练',
          collapsed: false,
          items: [
            { text: '预训练与后训练', link: '/knowledge/training' },
          ],
        },
        {
          text: '④ 模型与应用',
          collapsed: false,
          items: [
            { text: '大语言模型概览', link: '/knowledge/llms' },
            { text: '推理模型', link: '/knowledge/reasoning' },
          ],
        },
      ],
      '/roadmap': [
        {
          text: 'AI 学习路线',
          items: [
            { text: '我的进阶路线', link: '/roadmap' },
            { text: '全网优质学习资源', link: '/roadmap/learning-resources' },
          ],
        },
      ],
      '/base-models/': [
        {
          text: '基础模型',
          items: [
            { text: 'Claude', link: '/base-models/claude' },
            { text: 'GPT', link: '/base-models/gpt' },
            { text: 'DeepSeek', link: '/base-models/deepseek' },
          ],
        },
      ],
      '/architecture/': [
        { text: '模型架构', items: [{ text: '总览', link: '/architecture/' }] },
      ],
      '/post-training/': [
        {
          text: '后训练',
          items: [
            { text: '总览', link: '/post-training/' },
            { text: 'SFT 监督微调', link: '/post-training/sft' },
            { text: 'RLHF / DPO / RLVR', link: '/post-training/rlhf-dpo' },
          ],
        },
      ],
      '/training-systems/': [
        { text: '训练系统', items: [{ text: '总览', link: '/training-systems/' }] },
      ],
      '/inference-models/': [
        { text: '推理模型', items: [{ text: '总览', link: '/inference-models/' }] },
      ],
      '/inference-optimization/': [
        { text: '推理优化', items: [{ text: '总览', link: '/inference-optimization/' }] },
      ],
      '/evaluation/': [
        { text: '评测', items: [{ text: '总览', link: '/evaluation/' }] },
      ],
      '/agent/': [
        {
          text: 'Agent',
          items: [
            { text: '总览', link: '/agent/' },
            { text: '工具调用', link: '/agent/tool-use' },
          ],
        },
      ],
    },

    outline: { level: [2, 3] },
    lastUpdated: '最后更新',
    editLink: {
      pattern: `${ghRepoUrl}/edit/main/docs/:path`,
      text: '在 GitHub 上编辑此页',
    },

    socialLinks: [
      { icon: 'github', link: ghRepoUrl },
      { icon: 'x', link: `https://x.com/${ghUser}` },
      {
        icon: {
          svg: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="11" fill="#0066FF"/><text x="12" y="17" font-size="13" text-anchor="middle" fill="#fff" font-family="sans-serif">知</text></svg>',
        },
        link: `https://www.zhihu.com/people/${ghUser}`,
      },
      {
        icon: {
          svg: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#FF2442"/><text x="12" y="16" font-size="11" text-anchor="middle" fill="#fff" font-family="sans-serif">书</text></svg>',
        },
        link: `https://www.xiaohongshu.com/user/profile/${ghUser}`,
      },
    ],

    footer: {
      message: '基于 VitePress 构建 · 记录我的 AI 进阶之路',
      copyright: 'Copyright © 2026 龙哥',
    },

    search: { provider: 'local' },
  },
})
