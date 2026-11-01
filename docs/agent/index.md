---
title: Agent 总览
domain: Agent 专题
tags: [Agent, 智能体, 工具调用, ReAct, 规划, 记忆]
aliases: [Agent, 智能体, ReAct, Function Calling, 智能体总览]
---

# Agent 总览

> 一句话：Agent 是把大模型从"聊天框"升级成"能干活的助手"——给它工具、记忆和规划能力，让它自主完成多步任务。

## 为什么需要 Agent

单纯对话的模型：你问一句，它答一句，没有"行动"。

Agent 补上了三样东西：

- **工具（Tools）**：能调用搜索、查数据库、跑代码、发消息……
- **规划（Planning）**：把大任务拆成步骤，逐步执行、能回头重试。
- **记忆（Memory）**：记住上下文、历史与中间结果。

## 典型范式

- **ReAct**：交替进行"推理（Reason）"和"行动（Act）"，边想边做。
- **规划-执行**：先列出完整计划，再逐步调用工具落地。
- **Deep Research**：检索 → 多步推理 → 引用溯源，产出带依据的长报告。

## 关键技术点

- 工具调用协议：Function Calling / Tool Use，如何处理并行与失败
- 上下文管理：长任务如何不"忘事"、不爆上下文
- 可控性：何时停、何时追问、如何避免跑偏

## 主流架构案例解析

光讲范式还不够——2026 年最成熟的 Agent 落地形态是**编码智能体**。Claude Code、OpenAI Codex CLI、WorkBuddy 三家共享同一套骨架（Agent Loop + 工具 + 护栏），却在**沙箱隔离、上下文工程、多代理编排、记忆与可扩展能力层**上做出了截然不同的取舍。逐家拆解与对照表见 👉 [主流 AI 编码 Agent 的架构范式](/agent/architectures)。

## 子页面

- [工具调用](/agent/tool-use)
- [主流 AI 编码 Agent 的架构范式](/agent/architectures)（Codex / Claude Code / WorkBuddy 对比解析）

参考：[学习路线](/roadmap)

<!-- kb-related:start -->
## 相关笔记

- [主流 AI 编码 Agent 的架构范式](/agent/architectures) — 标签：Agent、标签：工具调用、交叉引用
- [工具调用](/agent/tool-use) — 标签：工具调用、标签：Agent、交叉引用
- [大语言模型概览](/knowledge/llms) — 交叉引用
- [推理模型](/knowledge/reasoning) — 交叉引用
- [推理模型总览](/inference-models/) — 交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [大语言模型概览](/knowledge/llms)
- [推理模型](/knowledge/reasoning)
- [主流 AI 编码 Agent 的架构范式](/agent/architectures)
- [工具调用](/agent/tool-use)
- [推理模型总览](/inference-models/)

<!-- kb-backlinks:end -->
