---
title: RLHF 与 DPO
domain: 后训练专题
tags: [RLHF, DPO, RLVR, 奖励模型, PPO, 偏好优化]
aliases: [RLHF, DPO, RLVR, PPO, 奖励模型, 偏好优化, 对齐]
---

# RLHF / DPO

> 一句话：让模型"更合人类心意"。RLHF 用奖励模型 + 强化学习，DPO 用偏好数据直接优化，殊途同归。

## RLHF（基于人类反馈的强化学习）

经典三步走：

1. SFT 得到一个基础模型。
2. 收集人类对多个回答的偏好，训练一个 **Reward Model（奖励模型）**。
3. 用 **PPO** 强化学习，让模型生成更能拿高分的回答。

优点是有明确的"人类偏好"信号；缺点是流程复杂、训练不稳定、成本高。

## DPO（直接偏好优化）

DPO 的革命性在于：**不需要单独的奖励模型，也不需要 PPO**。

它把"偏好对齐"转化成一个分类式损失：直接拿"被偏好的回答"和"不被偏好的回答"配对，让模型拉大两者概率差距。实现简单、稳定，已成为很多开源模型的首选。

## RLVR（可验证奖励）—— 推理模型的钥匙

和"人类偏好"不同，RLVR 用**可验证对错**的奖励（数学用符号验算、代码用编译器跑测试）。DeepSeek-R1 证明：仅靠"答案对不对"的 0/1 奖励，模型就能自己学会打草稿、自我纠错（"顿悟时刻"）。这是推理模型（会思考的 AI）的核心训练法。

## 三者怎么选

- 想要"听话、风格好" → RLHF / DPO
- 想要"会思考、解题强" → RLVR
- 资源有限、求简单 → 优先 DPO

参考：[后训练总览](/post-training/) · [学习路线](/roadmap)

<!-- kb-related:start -->
## 相关笔记

- [预训练与后训练](/knowledge/training) — 标签：RLHF、标签：DPO、标签：RLVR、交叉引用
- [后训练总览](/post-training/) — 标签：RLHF、标签：DPO、标签：RLVR、交叉引用
- [推理模型](/knowledge/reasoning) — 标签：RLVR、交叉引用
- [推理模型总览](/inference-models/) — 标签：RLVR、交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [推理模型](/knowledge/reasoning)
- [预训练与后训练](/knowledge/training)
- [后训练总览](/post-training/)
- [推理模型总览](/inference-models/)

<!-- kb-backlinks:end -->
