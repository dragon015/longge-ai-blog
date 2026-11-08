---
title: 主流 AI 编码 Agent 的架构范式
domain: Agent 专题
tags: [Agent, 编码智能体, 多智能体, 沙箱, 工具调用, Claude Code, Codex, WorkBuddy, 架构对比]
aliases: [编码Agent, Coding Agent, Codex, Claude Code, WorkBuddy, Agent架构, 智能体架构, 终端Agent]
---

# 主流 AI 编码 Agent 的架构范式：Codex、Claude Code 与 WorkBuddy 对比解析

> **一句话：** 2026 年最成熟的 Agent 落地形态是"编码智能体"——它们共享同一套骨架（感知-思考-行动-观察的 Agent Loop + 工具系统 + 安全护栏），但三家在**沙箱隔离、上下文工程、多代理编排、记忆与可扩展能力层**上做出了截然不同的工程取舍：Claude Code 押注"结构化上下文 + 子代理编排"，Codex CLI 押注"OS 级沙箱 + 事务性补丁"，WorkBuddy 押注"多智能体 + 技能/连接器 + 三层记忆"。

2024–2026 这两年，AI 行业从"卷聊天"转向"卷能干活的 Agent"。而在所有 Agent 品类里，**编码智能体（Coding Agent）** 是第一个跑通产品-价值闭环、被数十万开发者日常依赖的形态——因为它任务边界清晰、结果可验证（代码能编译、测试能跑）、且天然就在终端/IDE 里。本篇以三家最具代表性的主流产品为例，拆解它们 2026 年的真实架构，并归纳出可以复用的设计范式。

---

## 先建立共识：所有编码 Agent 的共用骨架

不管叫什么名字，一个能"自主改代码、跑命令、看结果"的编码 Agent，都绕不开这六个部件：

1. **Agent Loop（智能体循环）**：`接收任务 → 模型推理 → 调用工具 → 观察结果 → 继续推理`，直到模型返回终态（没有更多工具调用）或触及步数上限。这是所有方案的公约数。
2. **工具系统（Tools）**：文件读写、shell 执行、搜索、补丁编辑，以及通过 **MCP** 扩展的外部工具（见 [工具调用](/agent/tool-use)）。工具调用的质量直接决定 Agent 能力上限。
3. **上下文工程（Context Engineering）**：把"哪些信息放进模型窗口、怎么组织、超预算怎么压缩"——这是 2026 年最被重视的隐性核心（不是 Prompt 工程，是 Context 工程）。
4. **安全护栏（Guardrails）**：每一次"会改世界"的动作（写文件、跑命令、联网）都要被审批/沙箱拦截。模型可以"提议"，策略层决定"准不准执行"。
5. **记忆（Memory）**：跨回合记住用户偏好、项目上下文、历史决策。
6. **多代理编排（Multi-Agent）**：把大任务拆给多个子 Agent 并行/递归执行，各自隔离上下文。

下面三家，本质就是在**这六件套上的不同权重与实现路线**。

<img src="/assets/agent-loop.svg" alt="Agent Loop 通用循环" style="max-width:100%;border:1px solid #e2e8f0;border-radius:12px;margin:16px 0" />

> 上图是编码 Agent 的通用循环骨架（ReAct 范式）：`Thought → Action → Observation` 不断迭代，直到模型判定无需再调工具、直接给出终态答案。三家产品都跑同一个 Loop，区别只在于"Action 怎么执行、Observation 怎么回灌、何时停"。

---

## 一、Claude Code：结构化上下文 + 子代理编排

Anthropic 的 Claude Code 是"把模型直接放进终端、贴着真实仓库干活"的标杆。它的架构亮点不在某个孤立技巧，而在**用结构保住长会话的 coherence（一致性）**。

### 1. Agent Loop
经典的 `agent loop`：Claude 收到任务 → 推理 → 调工具（读文件、写文件、跑 bash、搜网页）→ 观察结果 → 继续，直到返回终态。默认是**单线程循环**，一步一步来。

### 2. "HTML 形"的结构化上下文（核心心法）
Claude Code 把上下文组织成**带名字、可嵌套、有明确边界的块**（像 HTML 标签），而不是一坨扁平字符串：
- 当前文件是一块、某次工具结果是另一块，每块都有命名边界。
- 好处：运行时可以**确定性地**增删/替换/摘要某个块——比如丢掉过期的文件块、把冗长的工具结果压成摘要、重新注入新读到的文件——而不会让模型搞混"哪段是哪段"。
- 历史超预算时，组装器（assembler）把旧回合**压缩成稠密摘要块**再丢弃原文；因为边界是显式的，它精确知道"哪些 span 可以安全折叠"。这就是为什么一个超长 Claude Code 会话不会退化成一团浆糊。

### 3. 子代理编排（Orchestrator-Worker）
大模型默认单线程太慢，于是有 **subagents**：主 Agent（orchestrator）用 `Task` 工具 spawn 一个或多个 worker，每个 worker：
- 跑在**独立进程 + 独立上下文窗口**里；
- 可以有自己的 **git worktree**（多个 agent 在不同分支/目录并行改文件，互不冲突）；
- 完成后把**精炼后的结构化结果**回报给主 Agent；
- 自 2026 年 6 月起支持**递归 fork spawn**（子代理再派子代理）。

标准拓扑是 **orchestrator-worker**：主 Agent 规划、拆成独立子任务、派工、回收并合并结果。最适合"子任务相互独立"的场景（如并行跑各模块的测试、并行读不同 API 文档写说明）。

### 4. 权限门 + Hooks（刚性策略边界）
在工具层外面裹了一层**策略边界**：任何"有副作用"的动作执行前，先过 permission gate（按规则校验，必要时问你）；**Hooks** 让你把确定性代码插进生命周期节点（工具运行前/文件改完/会话结束），用来 lint、格式化、记日志、甚至一票否决。架构哲学是：**模型负责灵活推理，你的 hooks/gate 负责刚性执法**——"模型提议，策略层定夺"。

### 5. Prompt Cache 经济学
子代理会重开一份上下文，所以成本控制是纪律：只读型子代理（Explore/Plan）**省略 CLAUDE.md 与 gitStatus**（省 token）；fork 型子代理继承父 Agent 的系统提示与工具数组，使 API 前缀字节级一致 → 命中父级的 prompt cache，大幅降本。

> **Claude Code 的取舍**：用"结构保 coherence + 子代理隔离上下文 + 刚性 gate/hooks"换取**长任务不退化、并行不污染、危险动作可控**。代价是多代理 token 开销是单体的数倍，因此只在"子任务真独立、回报值回票价"时才上子代理。

---

## 二、OpenAI Codex CLI：OS 级沙箱 + 事务性补丁

OpenAI 的 Codex CLI 是"终端原生、Rust 实现"的开源编码 Agent，直接对标 Claude Code。它最鲜明的赌注是：**把安全约束压到操作系统层面（syscall 层），而不是只靠 prompt 劝说**。

### 1. 三角色 Agent Loop
一次会话 = 用户 prompt + 一个 LLM Agent（2026 默认 GPT-5 Codex，早期用 o3/o4-mini）+ 一个**本地执行器（executor）** 拥有文件系统与沙箱 shell。模型拿到系统提示、对话历史、小工具集（`shell` 跑命令、`apply_patch` 写补丁、可选 MCP 工具），发出工具调用 → 执行器决定"直接跑 / 问你 / 拒绝" → 结果回传 → 循环。

### 2. OS 级沙箱（架构的承重墙）
Codex 把"模型想干啥"和"OS 让干啥"彻底分开。**沙箱是分层的、平台原生强制**：
- macOS 用 **Apple Seatbelt**（`sandbox-exec`）；
- Linux 用 **Landlock + seccomp**；
- Windows 用 elevated policy；
- 还可用 Docker 做更强网络隔离。

默认策略**禁止联网、禁止写工作目录之外**，哪怕模型可以请求任何东西，OS 层挡着。你启动时选一个粗粒度策略：`read-only`（能跑命令不能写/不能联网）、`workspace-write`（只能在当前目录写，仍禁网，默认）、`danger-full-access`（无沙箱，仅在容器/全新 VM 里用）。

### 3. 审批矩阵（Sandbox × Approval）
与沙箱正交的是**审批模式**，控制"执行器何时暂停问你"：`ask/suggest`（每步都问）、`auto/auto-edit`（补丁自动过、命令仍问；或反之）、`never/full-auto`（什么都不问，沙箱是唯一护栏）。

两者的组合让 **`full-auto` + `workspace-write`** 成为常见生产设定：模型可以"乱挥拳"，但**既偷不走密钥、也改不到项目外的文件**，且每步不用你按键 → 吞吐拉满。这正是 Codex"敢做 full-auto"的底气：**约束在 syscall 层，而非 prompt 层**。

### 4. apply_patch：事务性编辑通道
Codex 不让模型吐整文件，而是用专用 `apply_patch` 工具写"类 unified-diff 的补丁信封"，**事务性应用**——任一 hunk 失败，整个补丁被拒、模型看到错误。好处有二：① 局部编辑远少于重发整文件，**输出 token 与延迟骤降**；② diff 强制模型交代上下文行，**在 apply 时就拦下"改错函数"那类错误**，而非等到测试才暴露。

### 5. 按需拉取上下文（不预读全仓）
模型**不会一开始就吃进整个仓库**，而是用 `rg`/`ls`/`cat` 按需把上下文拉进来。这让输入窗口小到能吃 prompt cache 的前缀折扣，且上下文规模随"它实际看过的代码量"增长，而非仓库大小。

### 6. MCP 双角色 + 云沙箱
Codex 同时是 **MCP client**（连外部 MCP server 扩工具）和**实验性 MCP server**（把自身能力暴露给别的 Agent 当工具）——这让它能被编排进更大的 Agent 流水线，而不是只能单打独斗。另有云沙箱（Codex Web）预载仓库做并行后台任务，但会把仓库内容发往 OpenAI 基础设施，对 IP 敏感代码是顾虑。

> **Codex CLI 的取舍**：用"OS 级沙箱 + 事务补丁 + 按需上下文"换取**安全可辩护的 full-auto + 低成本长会话**。它的差异化 bets 是"约束在 syscall 层"和"patch-only 编辑通道"，让无监督自治变得可接受。

---

## 三、WorkBuddy：多智能体 + 技能/连接器 + 三层记忆

WorkBuddy 是**桌面端、面向"个人知识工作全场景"的多智能体平台**型 Agent（区别于前两者"贴着代码仓库"的定位）。它的架构重心在**可扩展能力层与持久记忆**，而非单一沙箱。

### 1. Agent Loop + 延迟工具机制
同样跑 `推理 → 工具调用 → 观察` 的循环；工具采用"先 Tool Search 发现 schema、再 DeferExecuteTool 真正调用"的延迟加载机制，使一个会话能挂载远超上下文可容纳数量的工具，而只在使用时付出成本。

### 2. 多智能体编排（专家子代理）
内置可寻址的子代理角色：通用 `general-purpose`、快速探索 `Explore`、架构规划 `Plan`，以及面向表格的 `sheet-agent`、面向文档的 `doc-writer / doc-formatter / doc-converter` 流水线、面向 UI 的 `ui-design-expert` 等。主 Agent 按任务把活派给对应子代理，各自隔离上下文、回收结构化结果——与 Claude Code 的 orchestrator-worker 同源思路，但**角色是按"工作域"而非仅"读/写"划分**。

### 3. Skills：用户级 / 项目级可扩展能力层
这是 WorkBuddy 区别于"纯工具集"的关键：能力被封装成 **Skill**（带 SKILL.md 的工作流），分**用户级**（跨项目复用）与**项目级**（团队共享）。模型遇到匹配任务会主动加载 Skill 执行已验证的流程，把"零散工具"升级成"可被沉淀、可被复用、可被审计的方法论层"。社区还有"推荐市场（BuiltinMarket）"可一键安装新 Skill。

### 4. MCP 连接器（Connectors）
通过 MCP 接入外部应用、服务、数据源（如网盘、文档、微信等），让 Agent 突破本地文件边界去读写真实世界的系统。连接器的"推荐/审查"机制让扩展有安全门面。

### 5. 三层记忆（跨会话持久化）
WorkBuddy 把记忆显式分三层：
- **云记忆**：服务器生成的长程用户画像 + 历史对话检索（server-side ranking）；
- **用户级本地记忆**：`~/.workbuddy/MEMORY.md`，跨项目偏好与习惯；
- **工作区级记忆**：当前项目的每日日志与长期笔记。

这让 Agent 跨会话"记得你是谁、这个项目约定是什么"，是纯代码 Agent 少有的"人格化/项目化"记忆设计。

### 6. 可视化 + 自动化 + 沙箱权限升级
额外三件套：① **Visualizer** 把图表/示意图/交互 widget 内联渲染（教学、数据可视化场景强）；② **automation_update** 支持一次性/周期性自动化（定时跑任务）；③ **沙箱权限升级**（`dangerouslyDisableSandbox`）——默认在隔离沙箱跑，需触碰外部/本机时显式申请用户授权再出沙箱，和 Codex 的"沙箱是承重墙"理念一致，只是走"按需升级"而非"OS 原生强制默认"。

> **WorkBuddy 的取舍**：用"多智能体角色 + Skills 方法论层 + 三层记忆 + 连接器"换取**跨场景、跨会话、可累积的能力与记忆**，定位是"桌面上的个人 Agent 操作系统"。它不强求贴着单一仓库，而是把 Agent 的能力边界推到"你的全部数字工作"。

---

## 四、三方架构对照表

| 维度 | **Claude Code** | **OpenAI Codex CLI** | **WorkBuddy** |
| --- | --- | --- | --- |
| 定位 | 终端 / IDE 贴库编码 Agent | 终端原生、Rust 开源编码 Agent | 桌面端多场景个人 Agent 平台 |
| 核心循环 | Agent Loop（单线程默认） | 三角色 Loop（模型 + 执行器 + 沙箱） | Agent Loop + 延迟工具机制 |
| 上下文策略 | **结构化（HTML 形）块 + 摘要压缩**，保长会话 coherence | **按需拉取**（rg/ls/cat），不预读全仓，吃 prompt cache | 按需检索 + 三层记忆回填 |
| 安全模型 | 权限门 + Hooks（刚性策略边界） | **OS 级沙箱**（Seatbelt/Landlock）+ 审批矩阵 | 隔离沙箱默认 + **按需权限升级** |
| 编辑通道 | 写文件工具 | **apply_patch 事务性补丁**（失败整体回滚） | 文件工具 + 专用编辑器 SDK |
| 多代理 | **子代理编排**（worktree 隔离、递归 fork spawn、prompt cache 继承） | 主要单体；MCP server 角色可被外部编排 | **多角色子代理**（按工作域划分）+ Skill 编排 |
| 可扩展层 | MCP + 子代理定义 | MCP（client + server 双角色） | **Skills（用户/项目级）+ MCP 连接器 + 市场** |
| 记忆 | CLAUDE.md + 会话历史（子代理可省略） | AGENTS.md 项目指令 + 会话 | **三层记忆**（云 / 用户级 / 工作区级） |
| 差异化 bets | 结构保 coherence、子代理隔离 | syscall 层沙箱、patch-only 编辑 | 能力/记忆可累积的桌面 Agent OS |

### 三种 Agent 的底层区别（一句话概括）

抛开外壳，三家真正的"底层赌注"各用一句话讲清：

- **Claude Code**：底层是用 **git worktree 做文件系统级隔离 + HTML 形上下文块的确定性增删/压缩**，把"长任务一致性"和"可隔离并发"当作一等公民——差异在 **"结构保 coherence"**。
- **OpenAI Codex CLI**：底层是把安全约束压到 **OS 系统调用层（Seatbelt/Landlock）+ 事务性 apply_patch 补丁**，用 syscall 级沙箱换"敢开 full-auto"的可信度——差异在 **"约束在 syscall 层"**。
- **WorkBuddy**：底层是 **Skills 方法论层 + 三层记忆（云/用户级/工作区级）+ 沙箱按需权限升级**，把能力做成"可沉淀、可复用、跨会话累积"的桌面 Agent OS——差异在 **"能力/记忆可累积"**。

一句话终极版：

> **Claude Code** 靠"结构 + 子代理隔离"保长任务不崩；**Codex** 靠"OS 级沙箱 + 事务补丁"保自治可信；**WorkBuddy** 靠"技能 + 三层记忆"保能力跨会话累积。

用一张架构对比图收束（维度 × 三家，一眼看出分野）：

<img src="/assets/agent-arch-compare.svg" alt="三种编码 Agent 架构对比" style="max-width:100%;border:1px solid #e2e8f0;border-radius:12px;margin:16px 0" />

---

## 五、2026 年编码 Agent 的架构趋势（从三家归纳）

把三家放一起看，能提炼出几条 2026 年已经收敛的范式：

1. **从"Prompt 工程"转向"Context 工程"**：上下文怎么组织、怎么压缩、怎么隔离，比"怎么问"更决定长任务成败（Claude Code 的结构化块、Codex 的按需拉取都是证据）。
2. **沙箱是自治的前提**：没有 syscall/隔离层级的强制约束，"full-auto"就是不负责。三家的共识是——**先框死模型能碰的物理边界，再谈放手让它跑**。
3. **多代理从炫技变刚需**：独立上下文 + 隔离文件系统（worktree/角色）让"并行不改坏、回收只回精炼结果"成为可复用的编排拓扑。
4. **编辑通道事务化**：Codex 的 `apply_patch` 证明——让模型交付"可被校验、可整体回滚"的局部变更，比"重写整文件"更省、更安全。
5. **能力层可累积 > 工具集堆砌**：WorkBuddy 的 Skills、Claude Code 的子代理定义、Codex 的 MCP 双角色，都在把"一次性工具"升级成"可被沉淀、复用、审计的方法论"。
6. **记忆跨会话化**：编码 Agent 记项目指令（AGENTS.md / CLAUDE.md），个人 Agent 记用户与项目（三层记忆）——**能记住"你是谁、这项目怎么约定"的 Agent，才真正算'用熟了'**。

::: tip 给想自己造 Agent 的人
如果你要从零搭一个编码/工作 Agent，这三家的骨架可直接抄：**① 一个干净的 Agent Loop；② 一组最小工具 + 一个事务化编辑通道；③ 一层 OS/策略级沙箱（别只靠 prompt）；④ 一个上下文组装器（会增删/压缩块）；⑤ 可选的子代理隔离并行；⑥ 一份跨会话记忆。** 至于"Skills 方法论层 vs 纯 MCP 工具集"，取决于你想让 Agent 的能力是'可被沉淀复用'还是'即插即用'。
:::

---

## 下一步学什么

- 想先搞懂 Agent 的通用骨架与范式：[Agent 总览](/agent/)、[工具调用](/agent/tool-use)。
- 想理解 Agent 里"幻觉会被放大"的风险（前一步小错被后续当事实推演）：[大模型为什么会出现幻觉](/knowledge/hallucination)。
- 想理解"会自我验证的模型"如何压低错误链：[推理模型](/knowledge/reasoning)。
- 想动手造最小可用 Agent：从"Agent Loop + 两个工具 + 一个沙箱"起步，再逐步加多代理与记忆。

<!-- kb-related:start -->
## 相关笔记

- [Agent 总览](/agent/) — 标签：Agent、标签：工具调用、交叉引用
- [工具调用](/agent/tool-use) — 标签：工具调用、标签：Agent、交叉引用
- [大模型幻觉](/knowledge/hallucination) — 交叉引用
- [推理模型](/knowledge/reasoning) — 交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [大模型幻觉](/knowledge/hallucination)
- [推理模型](/knowledge/reasoning)
- [Agent 总览](/agent/)
- [工具调用](/agent/tool-use)

<!-- kb-backlinks:end -->

## 延伸阅读

- Anthropic 官方关于 Claude Code agent loop、subagents、Hooks 的博客与文档（以官方最新发布为准）。
- OpenAI 官方 "Running Codex safely"、"Unrolling the Codex agent loop" 技术文章，以及 Codex CLI 开源仓库（github.com/openai/codex）。
- 本库串讲：[Agent 总览](/agent/)、[工具调用](/agent/tool-use)、[大模型幻觉](/knowledge/hallucination)、[推理模型](/knowledge/reasoning)。
