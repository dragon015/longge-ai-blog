---
title: GPT 与检索问答 · 13 关实战闯关台
domain: 实战专题
tags: [Transformer, 注意力机制, 预训练, 自回归, 大语言模型, 实战]
aliases: [GPT和RAG学习, RAG入门, 引导学习客户端, 庖丁解牛, 闯关学习, 互动学习, GPT实战, 检索增强实战, 手搓GPT, nanoGPT配套, 13关Dojo]
---

# GPT 与检索问答 · 13 关实战闯关台

> **一句话：** 这是一个嵌在知识库里的交互式学习客户端——把「手搓 GPT → 训练它 → 接上检索问答」拆成 13 个**线性解锁**的关卡，每关「讲透一小块原理 → 浏览器里真跑一个实验 → 亲手完成动手任务 → 对照本机真工程」才算过关。

> 和「可随意跳读的图文笔记」不同，它是**闯关式**的：必须按顺序做完任务才解锁下一刀。看是输入，做才是内化。

---

## 直接开始（就在本页）

下方就是完整客户端，零依赖、无需安装。点「全屏打开 ↗」可切到独立窗口获得最佳体验；**嵌入版与全屏版同源共享进度**，两边接着学不会断档。

<TutorFrame />

---

## 13 关路线图（庖丁解牛顺序）

| 阶段 | 关卡 | 你要亲手做的事 | 对应知识库笔记 |
|---|---|---|---|
| **第一章 · 手搓 GPT**（7 刀） | 1 把文字变成编号 | 改一段话，看编号表怎么重算 | [大语言模型概览](/knowledge/llms) |
| | 2 猜下一个字 | 翻几批数据，看答案比题目往后挪一格 | [预训练与后训练](/knowledge/training) |
| | 3 给每个字配一组数字 | 点一个字，看「字档案」和「位置档案」相加 | [大语言模型概览](/knowledge/llms) |
| | 4 让字互相对照 | **亲手算一遍**相关分，并关掉两个开关看模型怎么变笨 | [注意力机制](/knowledge/attention) |
| | 5 让「猜错程度」降下来 | 真的训练一个小模型，看曲线下降、乱码变句子 | [预训练与后训练](/knowledge/training) |
| | 6 一个字一个字往外写 | 拨温度与候选数，手动走完写字循环 | [大语言模型概览](/knowledge/llms) |
| | 7 在本机跑通真模型 | 按清单敲四条命令，认得每一步该出现什么 | [Transformer 架构](/knowledge/transformer) |
| **第二章 · 接上检索**（5 刀） | 8 从闭卷到开卷 | 对比「闭卷瞎编」与「开卷有据」 | [大模型幻觉](/knowledge/hallucination) |
| | 9 把文档切成卡片 | 调每段长度与重叠字数，实时看切分 | [大语言模型概览](/knowledge/llms) |
| | 10 判断两段话像不像 | 拖两根箭头，直观感受夹角与相似度 | [注意力机制](/knowledge/attention) |
| | 11 找出最相关的几段 | 改返回段数、开混合检索，看命中排序变化 | [大模型幻觉](/knowledge/hallucination) |
| | 12 拼出开卷题 | 开关「只准照资料答」，亲眼看幻觉冒出来 | [大模型幻觉](/knowledge/hallucination) |
| **第三章 · 合流**（1 刀） | 13 端到端合流 | 播放 9 步流水线 + 跑评估，判断回头改哪一段 | [预训练与后训练](/knowledge/training) |

> 主线终点：给训练好的 GPT 外接「先检索再生成」，把「只凭记忆」变成「凭证据」——这正是 [大模型幻觉](/knowledge/hallucination) 里缓解胡说的头号手段。

---

## 它和真工程怎么对应

客户端是**浏览器缩小版**（教学规模，秒级反馈建立直觉），每关末尾都标注了本机 `nano-gpt-practice/` 工程里的真实文件、函数、命令行与预期输出。两者是「直觉 ↔ 真工程」的贯通关系。

> 客户端里的原理讲解已全部改成大白话，**真实代码默认折叠**，标注「可选」——看不懂代码完全不影响闯关，等你想深挖时再点开。下面这些对照关系是给进阶时用的：

- 浏览器里建的字符词表 ↔ `prepare.py` / `train.py` 里的 `sorted(set(text))`；
- 浏览器里手算的注意力打分 ↔ `model.py` 的 `CausalSelfAttention`；
- 浏览器里下降的 loss ↔ `train.py` 的真实训练循环与 `ckpt.pt`；
- 浏览器里的检索与拼装 ↔ 工程里需新建的 `prepare_kb.py` / `embed.py` / `retrieve.py` 支线。

工程本体见 [从零手搓 GPT（nanoGPT 风格实战）](/practice/nano-gpt)——它和本页是同一条学习主线的「真动手」与「引导台」。

> **说明**：浏览器实验里的数值/权重是教学示意（界面已标注），不是真实模型权重；严谨实现以对应论文与上述工程为准。

---

## 为什么用 iframe 嵌入，而不是把源码塞进笔记

客户端自带完整的 `:root` 设计变量、`100vh` 栅格布局与独立 JS 运行时。若把它内联进 markdown，会与 VitePress 主题样式、Vue 运行时互相污染。因此采用三层结构：

1. **静态资源**：`docs/public/tutor/index.html` 原样发布，零依赖、可独立双击打开；
2. **嵌入承接**：`TutorFrame.vue` 用 iframe 隔离 CSS/JS，并处理 `base` 路径、加载态、失败降级、响应式高度；
3. **全屏入口**：一键切独立窗口，窄屏下体验最佳。

iframe 与站点**同源**，所以 localStorage 里的闯关进度在嵌入版和全屏版之间互通。

<!-- kb-related:start -->
## 相关笔记

- [从零手搓 GPT（nanoGPT 风格实战）](/practice/nano-gpt) — 标签：Transformer、标签：注意力机制、标签：预训练、标签：自回归、标签：大语言模型、交叉引用
- [大语言模型概览](/knowledge/llms) — 标签：大语言模型、标签：自回归、交叉引用
- [注意力机制](/knowledge/attention) — 标签：注意力机制、交叉引用
- [预训练与后训练](/knowledge/training) — 标签：预训练、交叉引用
- [Transformer 架构](/knowledge/transformer) — 标签：Transformer、交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [注意力机制](/knowledge/attention)
- [大模型幻觉](/knowledge/hallucination)
- [大语言模型概览](/knowledge/llms)
- [预训练与后训练](/knowledge/training)
- [Transformer 架构](/knowledge/transformer)
- [从零手搓 GPT（nanoGPT 风格实战）](/practice/nano-gpt)

<!-- kb-backlinks:end -->

## 延伸阅读

- 本知识库 [大语言模型概览](/knowledge/llms) / [注意力机制](/knowledge/attention) / [Transformer 架构](/knowledge/transformer) / [预训练与后训练](/knowledge/training) / [大模型幻觉](/knowledge/hallucination)。
- 配套工程笔记：[从零手搓 GPT（nanoGPT 风格实战）](/practice/nano-gpt)。

*本客户端为教学用途的缩小版实现，概念 100% 可迁移到生产级大模型。*
