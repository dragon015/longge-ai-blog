---
title: 后训练总览
domain: 后训练专题
tags: [后训练, SFT, RLHF, DPO, RLVR, 对齐]
aliases: [后训练, Post-training, SFT, RLHF, DPO, RLVR, 对齐]
---

# 后训练总览

> 预训练给模型"知识和语言能力"，后训练给模型"能力和偏好"——让它更会对话、更听话、更会思考。

## 后训练在做什么

一个大模型的生命周期通常分两段：

1. **预训练（Pre-training）**：在海量文本上做"预测下一个词"，建立通用语言与世界知识。此时模型像个"博学但没规矩"的百科。
2. **后训练（Post-training）**：在预训练基础上做微调与对齐，让它符合人类期望——会按指令办事、输出格式稳定、必要时先思考再回答。

## 主流技术地图

- **SFT（监督微调）**：用"高质量问答对"教模型学会想要的输出风格与能力。
- **RLHF（基于人类反馈的强化学习）**：训练一个奖励模型，再用 PPO 让模型去"讨好"它。
- **DPO（直接偏好优化）**：跳过奖励模型，直接用偏好数据做优化，更简单稳定。
- **RLVR（可验证奖励的强化学习）**：用"答案对错"而不是"人类偏好"做奖励，是推理模型（如 DeepSeek-R1）的关键。

## 和"推理模型"的关系

后训练里有一支专门让模型"会思考"：通过 RLVR + 思维链，模型学会在给答案前先打草稿、自我检查。详见 [RLHF / DPO](/post-training/rlhf-dpo) 与学习路线[阶段三](/roadmap)。

---

## 子页面

- [SFT 监督微调](/post-training/sft)
- [RLHF / DPO](/post-training/rlhf-dpo)

<!-- kb-related:start -->
## 相关笔记

- [预训练与后训练](/knowledge/training) — 标签：后训练、标签：SFT、标签：RLHF、标签：DPO、标签：RLVR、交叉引用
- [RLHF 与 DPO](/post-training/rlhf-dpo) — 标签：RLHF、标签：DPO、标签：RLVR、交叉引用
- [推理模型](/knowledge/reasoning) — 标签：RLVR、交叉引用
- [SFT 监督微调](/post-training/sft) — 标签：SFT、交叉引用
- [推理模型总览](/inference-models/) — 标签：RLVR、交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [推理模型](/knowledge/reasoning)
- [预训练与后训练](/knowledge/training)
- [Claude](/base-models/claude)
- [RLHF 与 DPO](/post-training/rlhf-dpo)
- [SFT 监督微调](/post-training/sft)
- [训练系统总览](/training-systems/)
- [推理模型总览](/inference-models/)

<!-- kb-backlinks:end -->
