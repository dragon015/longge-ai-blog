---
title: Claude
domain: 模型笔记
tags: [Claude, Anthropic, 宪法AI, 基础模型]
aliases: [Claude, Anthropic, 宪法AI, Constitutional AI, Opus, Sonnet, Haiku]
---

# Claude (Anthropic)

::: tip 一句话定位
Anthropic 推出的闭源大模型系列，以 **Constitutional AI（宪法式 AI）** 和" helpful、honest、harmless（3H）"对齐理念著称，是 ChatGPT 之外最具影响力的主力模型之一。
:::

> 本文为学习笔记，非官方文档。数据以各代发布时的公开信息为准。

## 模型系列总览

| 代次 | 代表版本 | 发布时间 | 关键特点 |
| --- | --- | --- | --- |
| Claude 1 | Claude / Claude Instant | 2023-03 | 初代，强调长上下文与安全对齐 |
| Claude 2 | Claude 2 / 2.1 | 2023-07 / 11 | 上下文增至 200K，编码与推理增强 |
| Claude 3 | Opus / Sonnet / Haiku | 2024-03 | 三档定位，多模态（图），SOTA 基准 |
| Claude 3.5 | Sonnet / Haiku | 2024-06 起 | 强编码、Artifacts、计算机使用（computer use） |
| Claude 4 | Opus / Sonnet | 2025 | 长时程 Agent、深度推理、工具使用 |

::: info 怎么选
- **Haiku**： cheapest、最低延迟，适合高并发简单任务。
- **Sonnet**：性价比均衡，日常 Agent / 编码首选。
- **Opus**：最强推理与长任务，预算敏感场景慎用。
:::

## 核心架构与注意力

Claude 基于 Transformer 解码器，公开信息显示其采用 **MQA / GQA** 一类共享键值注意力以压缩 KV 缓存，并配合 **RoPE** 位置编码。标准缩放点积注意力公式如下：

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V
$$

其中 $Q, K, V$ 分别是查询、键、值矩阵，$d_k$ 为键向量维度。当 $d_k$ 较大时除以 $\sqrt{d_k}$ 可避免点积过大导致 softmax 梯度消失。

::: warning 注意
Anthropic 未公开 Claude 的完整架构细节（层数、隐藏维度、专家数等），上表与公式仅作通用原理参考，不代表 Claude 的确切实现。
:::

## 训练流程（Constitutional AI）

Claude 的对齐路线不依赖大量人工标注偏好，而是用一套"宪法"原则让模型自我批评与修正，再据此训练奖励模型（RLAIF）。流程概览：

```mermaid
flowchart LR
    A[监督微调 SFT] --> B[自我批评-修订<br/>SL 阶段]
    B --> C[宪法原则打分<br/>AI 偏好]
    C --> D[训练奖励模型<br/>RLAIF]
    D --> E[强化学习<br/>RL 阶段]
    E --> F[对齐后的 Claude]
```

要点：
- **SL 阶段**：模型先生成回答，再依据宪法原则自我批评并修订。
- **RL 阶段（RLAIF）**：用 AI 生成的偏好替代部分人工标注，训练奖励模型后再做 RL 微调。
- 相比传统 RLHF，RLAIF 降低了对人工标注的依赖、提升了可解释性。

## 关键能力边界

- ✅ 超长上下文（早期即 100K–200K token），适合长文档理解与摘要。
- ✅ 工具使用 / 计算机使用（computer use），可直接操作界面与软件。
- ✅ 中文与多语言表现稳定。
- ⚠️ 闭源，无权重可本地部署；价格与速率限制需按场景权衡。

## 参考资料

- Anthropic 官方博客与模型卡片（Claude 3 / 3.5 / 4 系列）
- Bai et al., *Constitutional AI: Harmlessness from AI Feedback*
- [AI 学习路线总览](/roadmap) · [GPT](/base-models/gpt) · [后训练](/post-training/)

<!-- kb-related:start -->
## 相关笔记

- [GPT](/base-models/gpt) — 标签：基础模型、交叉引用
- [大语言模型概览](/knowledge/llms) — 交叉引用
- [DeepSeek](/base-models/deepseek) — 交叉引用
- [后训练总览](/post-training/) — 交叉引用
- [模型架构总览](/architecture/) — 交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [大语言模型概览](/knowledge/llms)
- [DeepSeek](/base-models/deepseek)
- [GPT](/base-models/gpt)
- [后训练总览](/post-training/)
- [模型架构总览](/architecture/)

<!-- kb-backlinks:end -->
