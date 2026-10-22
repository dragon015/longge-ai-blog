---
title: SFT 监督微调
domain: 后训练专题
tags: [SFT, 监督微调, 指令微调, LoRA, PEFT]
aliases: [SFT, 监督微调, 指令微调, LoRA, PEFT, QLoRA, 微调]
---

# SFT 监督微调

> 一句话：用一批"标准答案"教模型学会你想要的输出风格与能力。后训练的第一步几乎都是它。

## 核心思想

预训练模型已经"懂很多"，但不一定按你的格式答、也不一定擅长特定任务。SFT 就是用 **(指令, 期望回答)** 这样的配对数据，做一轮有监督的微调，把模型"对齐"到目标行为上。

## 两种常见做法

- **全量微调（Full Fine-tuning）**：更新全部参数。效果好但成本高、易灾难性遗忘。
- **参数高效微调（PEFT）**：只训一小部分参数，如 **LoRA / QLoRA**，显存友好、可叠加多个适配器。

## 数据构造是关键

SFT 效果上限往往由数据质量决定：

- 多样性：覆盖真实使用场景的分布
- 格式一致：系统提示、输出模板统一
- 难例挖掘：把模型做错的样本加回来重训

## 待深入

- 指令数据从哪来（合成数据 / 蒸馏 / 人工）
- 多阶段 SFT 与"思考模式融合"（Thinking Mode Fusion）

参考：[后训练总览](/post-training/) · [学习路线](/roadmap)

<!-- kb-related:start -->
## 相关笔记

- [预训练与后训练](/knowledge/training) — 标签：SFT、交叉引用
- [后训练总览](/post-training/) — 标签：SFT、交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [预训练与后训练](/knowledge/training)
- [后训练总览](/post-training/)

<!-- kb-backlinks:end -->
