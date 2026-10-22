---
title: 知识图谱
---

<!-- 本文件由 scripts/build-kb-graph.mjs 自动生成，请勿手动编辑 -->

# 知识图谱（全站）

> 这张图由构建脚本**自动**根据全站笔记的内部链接生成，并按「领域」着上霓虹配色——这就是「层级为干、链接为脉」的可视化：颜色分组是层级，连线是链接。节点越大说明被引用越多（枢纽笔记）；悬停节点可高亮它的邻居并显示粒子流向；点击节点直达那篇笔记。每新增一篇笔记、多一条引用，图谱就自动长出新节点和新连线。

<ClientOnly>
  <KnowledgeGraph />
</ClientOnly>

## 孤岛提醒

暂无孤岛——每篇笔记都至少有一条链接关联，很好。

## 标签索引（概念簇）

- **RLVR**：[推理模型](/knowledge/reasoning)、[预训练与后训练](/knowledge/training)、[后训练总览](/post-training/)、[RLHF 与 DPO](/post-training/rlhf-dpo)、[推理模型总览](/inference-models/)
- **SFT**：[预训练与后训练](/knowledge/training)、[后训练总览](/post-training/)、[SFT 监督微调](/post-training/sft)
- **RLHF**：[预训练与后训练](/knowledge/training)、[后训练总览](/post-training/)、[RLHF 与 DPO](/post-training/rlhf-dpo)
- **DPO**：[预训练与后训练](/knowledge/training)、[后训练总览](/post-training/)、[RLHF 与 DPO](/post-training/rlhf-dpo)
- **KV缓存**：[注意力机制](/knowledge/attention)、[推理优化总览](/inference-optimization/)
- **MLA**：[注意力机制](/knowledge/attention)、[DeepSeek](/base-models/deepseek)
- **RoPE**：[注意力机制](/knowledge/attention)、[模型架构总览](/architecture/)
- **梯度下降**：[机器学习基础](/knowledge/ml-basics)、[神经网络与反向传播](/knowledge/neural-networks)
- **推理模型**：[推理模型](/knowledge/reasoning)、[推理模型总览](/inference-models/)
- **推理轨迹**：[推理模型](/knowledge/reasoning)、[推理模型总览](/inference-models/)
- **思考开关**：[推理模型](/knowledge/reasoning)、[推理模型总览](/inference-models/)
- **后训练**：[预训练与后训练](/knowledge/training)、[后训练总览](/post-training/)
- **位置编码**：[Transformer 架构](/knowledge/transformer)、[模型架构总览](/architecture/)
- **基础模型**：[Claude](/base-models/claude)、[GPT](/base-models/gpt)
- **MoE**：[DeepSeek](/base-models/deepseek)、[模型架构总览](/architecture/)
- **Agent**：[Agent 总览](/agent/)、[工具调用](/agent/tool-use)
- **工具调用**：[Agent 总览](/agent/)、[工具调用](/agent/tool-use)
- **注意力机制**：[注意力机制](/knowledge/attention)
- **QKV**：[注意力机制](/knowledge/attention)
- **缩放点积注意力**：[注意力机制](/knowledge/attention)
- **GQA**：[注意力机制](/knowledge/attention)
- **多头注意力**：[注意力机制](/knowledge/attention)
- **大语言模型**：[大语言模型概览](/knowledge/llms)
- **Tokenization**：[大语言模型概览](/knowledge/llms)
- **Embedding**：[大语言模型概览](/knowledge/llms)
- **上下文窗口**：[大语言模型概览](/knowledge/llms)
- **自回归**：[大语言模型概览](/knowledge/llms)
- **ScalingLaw**：[大语言模型概览](/knowledge/llms)
- **机器学习**：[机器学习基础](/knowledge/ml-basics)
- **监督学习**：[机器学习基础](/knowledge/ml-basics)
- **无监督学习**：[机器学习基础](/knowledge/ml-basics)
- **强化学习**：[机器学习基础](/knowledge/ml-basics)
- **过拟合**：[机器学习基础](/knowledge/ml-basics)
- **评估指标**：[机器学习基础](/knowledge/ml-basics)
- **神经网络**：[神经网络与反向传播](/knowledge/neural-networks)
- **反向传播**：[神经网络与反向传播](/knowledge/neural-networks)
- **激活函数**：[神经网络与反向传播](/knowledge/neural-networks)
- **感知机**：[神经网络与反向传播](/knowledge/neural-networks)
- **推理缩放**：[推理模型](/knowledge/reasoning)
- **训练缩放**：[推理模型](/knowledge/reasoning)
- **预训练**：[预训练与后训练](/knowledge/training)
- **CLM**：[预训练与后训练](/knowledge/training)
- **MLM**：[预训练与后训练](/knowledge/training)
- **Transformer**：[Transformer 架构](/knowledge/transformer)
- **自注意力**：[Transformer 架构](/knowledge/transformer)
- **LayerNorm**：[Transformer 架构](/knowledge/transformer)
- **残差连接**：[Transformer 架构](/knowledge/transformer)
- **编码器解码器**：[Transformer 架构](/knowledge/transformer)
- **Claude**：[Claude](/base-models/claude)
- **Anthropic**：[Claude](/base-models/claude)
- **宪法AI**：[Claude](/base-models/claude)
- **DeepSeek**：[DeepSeek](/base-models/deepseek)
- **开源模型**：[DeepSeek](/base-models/deepseek)
- **GPT**：[GPT](/base-models/gpt)
- **OpenAI**：[GPT](/base-models/gpt)
- **对齐**：[后训练总览](/post-training/)
- **奖励模型**：[RLHF 与 DPO](/post-training/rlhf-dpo)
- **PPO**：[RLHF 与 DPO](/post-training/rlhf-dpo)
- **偏好优化**：[RLHF 与 DPO](/post-training/rlhf-dpo)
- **监督微调**：[SFT 监督微调](/post-training/sft)
- **指令微调**：[SFT 监督微调](/post-training/sft)
- **LoRA**：[SFT 监督微调](/post-training/sft)
- **PEFT**：[SFT 监督微调](/post-training/sft)
- **智能体**：[Agent 总览](/agent/)
- **ReAct**：[Agent 总览](/agent/)
- **规划**：[Agent 总览](/agent/)
- **记忆**：[Agent 总览](/agent/)
- **Function Calling**：[工具调用](/agent/tool-use)
- **函数调用**：[工具调用](/agent/tool-use)
- **MCP**：[工具调用](/agent/tool-use)
- **模型架构**：[模型架构总览](/architecture/)
- **注意力变体**：[模型架构总览](/architecture/)
- **训练系统**：[训练系统总览](/training-systems/)
- **分布式训练**：[训练系统总览](/training-systems/)
- **并行**：[训练系统总览](/training-systems/)
- **ZeRO**：[训练系统总览](/training-systems/)
- **FlashAttention**：[训练系统总览](/training-systems/)
- **推理优化**：[推理优化总览](/inference-optimization/)
- **量化**：[推理优化总览](/inference-optimization/)
- **投机解码**：[推理优化总览](/inference-optimization/)
- **vLLM**：[推理优化总览](/inference-optimization/)
- **评测**：[评测总览](/evaluation/)
- **基准**：[评测总览](/evaluation/)
- **Benchmark**：[评测总览](/evaluation/)
- **MMLU**：[评测总览](/evaluation/)
- **HumanEval**：[评测总览](/evaluation/)

