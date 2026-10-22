---
title: 推理模型
domain: 模型与应用
tags: [推理模型, 推理轨迹, RLVR, 思考开关, 推理缩放, 训练缩放]
aliases: [推理模型, Reasoning Model, 思维链, CoT, RLVR, 推理缩放, 思考开关, 顿悟时刻, o1, DeepSeek-R1, 推理努力]
---

# 推理模型：AI 怎么学会先打草稿再回答？

> **一句话：** 用可验证奖励（RLVR）训练，模型自己长出推理轨迹和自我纠错；思考开关 + 努力控制，让它按题目难度分配算力。

> 传统 AI 像「抢答的学生」，问完立刻蹦答案；推理模型像「会打草稿的学生」——先在草稿纸上一步步推、自我检查，再给最终答案。这篇讲清楚它为什么「会想」、以及怎么控制它「想多久」。也是本博客 [推理模型](/inference-models/) 栏目的总纲。

## 推理模型 = 会打草稿的学生

推理模型在正式回答前，会先生成一段**推理轨迹（Reasoning Trace）**：把「先算 A、再验证 B、哦不对重来」的过程写出来，最后才给答案。

::: tip 为什么要多这一步
对数学、代码、复杂逻辑，直接脱口而出很容易错。先写草稿再收敛，准确率大幅提升——代价是更慢、更费 token（钱）。
:::

---

## 它是怎么「学会思考」的

关键发现来自 **RLVR（可验证奖励的强化学习）**：训练时老师不盯草稿写得好不好，只看出**最终答案对不对**（数学题用 SymPy 验算、代码用编译器跑测试）。对了奖 1 分，错了 0 分。

有意思的是——**光靠这个答案对错奖励，模型自己就长出了「打草稿、回头检查、自我纠错」的能力**，研究者管这叫「顿悟时刻」（Aha moments），而且纯靠奖励、不用提前教。

---

## 思考开关：同一个模型，两种体质

早期推理模型（如初代 DeepSeek-R1）是「偏科生」——不管多简单都啰嗦一大篇，关不掉。

后来进化成「混合体质」（如 Qwen3）：

- **思考模式（Thinking）**：难题才打草稿。
- **非思考模式（Non-thinking）**：简单题直接答。

推理时用一个参数或「无草稿」标签切换，一个模型同时具备两种能力。

::: info 为什么这很实用
你不想每次问「今天天气怎么样」都等它写 2000 字草稿。能按问题难度切模式，是推理模型能真正落地的关键。
:::

---

## 努力（Reasoning Effort）控制：思考油门

「想多久」是可以调的。等级低 = 只给 5 分钟（草稿短、快但易错）；等级高 = 给一上午（草稿长、准但慢贵）。

- **系统提示喊话**：在系统提示里写「思考努力：低 / 中 / 高」，模型照做（背后是训练时把「努力等级 ↔ 草稿长度」绑定进去了）。
- **连续旋钮（如 Inkling）**：努力不是几档，而是 0~1 的连续值，奖励公式里按等级调「每多写一个字扣多少分」。
- **硬预算（Hard Budget）**：到点（token 上限）外部机制强行收卷，逼模型立刻给答案，防它无限发散。

::: warning 努力越大越准，但有天花板
到了某个点，再多想也不涨分（像刷题刷到瓶颈）。所以「自动判断该想多久」才是理想状态——但目前还没哪家真正做稳，大多还是人手动指定努力等级。
:::

---

## 两条缩放轴

- **训练缩放（Train-time scaling）**：换更大 / 更强的模型（换高年级学生）。
- **推理缩放（Inference-time scaling）**：同一个模型，调高努力等级让它多写草稿（让同一个人多花时间）。

两者可叠加：一个小模型开高努力，表现能逼近大模型开低努力。

::: tip AI 术语版总结
推理努力控制本质上是 **推理时计算（inference-time compute）的显式调度**：在后训练阶段注入 effort-conditioned 信号（系统提示 / 模板标志 / RLVR 长度惩罚系数 λ），使同一份权重能沿推理缩放轴在固定 token 预算内调节 reasoning trace 长度，是对「token budget 与 verifiable accuracy 的 Pareto 前沿」的运行时调节。
:::

---

## 下一步学什么

- 想看各家怎么控「思考油门」：本博客 [推理模型](/inference-models/) 栏目。
- 想知道这背后的强化学习原理：回看 [预训练与后训练](/knowledge/training) 的 RLVR 一节。
- 想知道怎么让模型「边想边调用工具 / 自己行动」：看 [Agent 智能体](/agent/)。

<!-- kb-related:start -->
## 相关笔记

- [推理模型总览](/inference-models/) — 标签：推理模型、标签：推理轨迹、标签：RLVR、标签：思考开关、交叉引用
- [预训练与后训练](/knowledge/training) — 标签：RLVR、交叉引用
- [后训练总览](/post-training/) — 标签：RLVR、交叉引用
- [RLHF 与 DPO](/post-training/rlhf-dpo) — 标签：RLVR、交叉引用
- [大语言模型概览](/knowledge/llms) — 交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [大语言模型概览](/knowledge/llms)
- [预训练与后训练](/knowledge/training)
- [后训练总览](/post-training/)
- [RLHF 与 DPO](/post-training/rlhf-dpo)
- [Agent 总览](/agent/)
- [推理模型总览](/inference-models/)

<!-- kb-backlinks:end -->

## 延伸阅读

- Sebastian Raschka《Controlling Reasoning Effort in LLMs》（[magazine.sebastianraschka.com](https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms)）
- OpenAI o1 / DeepSeek-R1 技术报告（推理模型开端）
- 本博客 [推理模型](/inference-models/) 栏目
