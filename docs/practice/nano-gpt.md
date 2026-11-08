---
title: 从零手搓 GPT（nanoGPT 风格实战）
domain: 实战专题
tags: [Transformer, 注意力机制, 预训练, 自回归, 大语言模型, 幻觉]
aliases: [nanoGPT, NanoGPT, 手搓GPT, 手写GPT, 从零实现GPT, 实战GPT, 手写Transformer, Karpathy, 手搓大模型]
---

# 从零手搓 GPT：亲手跑通一个真实 Transformer 训练循环

> **一句话：** 亲手把 Embedding / 因果注意力 / Transformer Block / 自回归生成逐行写成可运行代码并跑通，是「读懂大模型」最快的闭环——它把本知识库里所有零件从「看懂」变成「能跑」。

> 想「了解大模型」，最快的路径不是再读一篇笔记，而是亲手跑通一个真实 Transformer 的训练循环。这个实战工程把 GPT 的每一行都用 PyTorch 写出来、逐行中文注释、字符级训练，**CPU 也能跑**。它和本库的「理论笔记」是配套的：笔记讲「为什么」，工程讲「怎么实现」。

---

## 为什么是它（而不是再读一篇）

读十篇注意力机制，不如亲手写一遍 `Q @ K.T / sqrt(d)`。这个工程刻意做成**最小实现**：

- 不依赖任何大模型框架，只有 `torch`；
- 字符级建模，语料几百 KB 就能跑；
- 每个类、每个张量维度都标了注释，对应你知识库里的一篇笔记。

跑完它，你再回看 [大语言模型概览](/knowledge/llms)、[注意力机制](/knowledge/attention) 会有「原来如此」的感觉——这就是「看是输入，写才是内化」。

---

## 每个组件，对应你知识库的哪篇笔记

| 代码位置 | 它是什么 | 对应笔记 |
|---|---|---|
| `model.py` `wte` / `wpe` | 词嵌入 + 位置嵌入 | [大语言模型概览](/knowledge/llms)（Tokenization / Embedding） |
| `model.py` `CausalSelfAttention` | 因果自注意力（Q/K/V 打分） | [注意力机制](/knowledge/attention)（QKV / 缩放点积 / KV 缓存） |
| `model.py` `Block` / `GPT` | Transformer Block / 整体骨架 | [Transformer 架构](/knowledge/transformer)（编码器-解码器 / 残差 / LayerNorm） |
| `train.py` 训练循环 + 交叉熵 | 预训练（下一字符预测 CLM） | [预训练与后训练](/knowledge/training)（预训练与后训练） |
| `model.py` `generate()` | 自回归采样生成 | [大语言模型概览](/knowledge/llms)（自回归循环） |
| `train.py` 的 loss 不降 / 生成胡说 | 为什么模型会幻觉 | [大模型幻觉](/knowledge/hallucination)（下一 token 预测 ≠ 事实正确） |

> 这张表就是「工程 ↔ 知识库」的桥：每改一行代码，都能在对应笔记里找到原理依据；每读一篇笔记，都能在代码里找到落点。

---

## 三步跑起来

工程代码在仓库同级的 `nano-gpt-practice/` 目录（与 `longge-ai-blog` 并列），包含 `model.py` / `config.py` / `train.py` / `generate.py` / `prepare.py`。本机操作：

```bash
# 1. 进入工程目录（与博客仓库同级）
cd ../nano-gpt-practice        # 或你存放该工程的实际路径

# 2. 安装依赖（需要 PyTorch；CPU 版即可）
pip install torch             # 或 pip install -r requirements.txt

# 3. 准备语料（默认离线：直接用 data/sample.txt 兜底，零网络依赖）
python prepare.py
#    想用真实莎士比亚语料（收敛更好），在有网的机器上：python prepare.py --download

# 4. 训练 + 生成
python train.py               # 每 200 步打印 loss 并生成样例，同时存 ckpt.pt
python generate.py            # 用训练好的模型从零生成一段文本
```

> **耗时参考**：默认配置（4 层 / 256 维 / batch 32），CPU 上 `max_iters=2000` 约几分钟；用真·莎士比亚 1MB 语料会比兜底 `sample.txt` 收敛得更像样。想上 GPU，把 `config.py` 的 `n_embd` 提到 768、`n_layer` 提到 12 即可（接近 GPT-2 small）。

---

## 你会看到什么（预期输出）

训练过程中 `val loss` 持续下降，生成的文本从**随机乱码**逐渐变成**能看出句子结构的英文**。这就是「大模型是怎么学会说话的」最直观的证据——它只是把「下一个字符预测」这个游戏玩了成千上万遍。

```
step     0 | loss 4.2xxx | ...
  eval  train=4.1xxx  val=4.2xxx
  sample: xJq!f zLk...mW#            <- 早期：纯噪声
...
step  2000 | loss 1.8xxx | ...
  sample: The gentleman was of a quiet temper, and his words were such as...  <- 后期：像样英文
```

---

## 读懂代码后，进阶实验（呼应你的理论笔记）

1. **改超参**：调 `n_layer` / `n_head` / `n_embd`，观察 loss 曲线与生成质量变化（对应 [预训练与后训练](/knowledge/training) 的 Scaling 直觉）。
2. **加现代架构组件**（呼应你笔记里的术语）：
   - 把 `nn.LayerNorm` 换成 **RMSNorm**（去掉均值中心化，更省算力）；
   - 给位置嵌入换 **RoPE**（旋转位置编码，长上下文更友好）；
   - 把多头注意力降维成 **GQA**（分组查询，推理更快）。
   > 这些正是 2023 年后主流模型的标配，也是 nanoGPT 增强版的做法。
3. **接一条 RAG 支线**（补你 KB 的 RAG 缺口）：训练完的模型是「只凭记忆」的，给它外接一个向量库（切片 → Embedding → 检索 → 把相关片段喂进 prompt），就变成「凭证据」的问答——这正是 [大模型幻觉](/knowledge/hallucination) 里说的缓解幻觉的头号手段。
4. **做安全测试**：往 prompt 里塞「忽略上文指令」之类的注入，看模型是否被带偏（呼应 AI 安全）。

---

## 常见坑

- **报错 `ModuleNotFoundError: No module named 'torch'`** → 没装依赖，先 `pip install torch`。
- **生成的都是乱码 / loss 不降** → 检查 `learning_rate`、`max_iters` 是否太小；玩具数据 2000 步起步。
- **想用真实莎士比亚但下载失败** → 手动把任意英文文本存成 `data/input.txt` 再跑 `train.py`。

---

<!-- kb-related:start -->
## 相关笔记

- [大语言模型概览](/knowledge/llms) — 标签：大语言模型、标签：自回归、交叉引用
- [注意力机制](/knowledge/attention) — 标签：注意力机制、交叉引用
- [大模型幻觉](/knowledge/hallucination) — 标签：幻觉、交叉引用
- [预训练与后训练](/knowledge/training) — 标签：预训练、交叉引用
- [Transformer 架构](/knowledge/transformer) — 标签：Transformer、交叉引用

<!-- kb-related:end -->

<!-- kb-backlinks:start -->
## 被以下笔记引用

- [大语言模型概览](/knowledge/llms)
- [预训练与后训练](/knowledge/training)

<!-- kb-backlinks:end -->

## 延伸阅读

- Andrej Karpathy《Neural Networks: Zero to Hero》（[karpathy.ai/zero-to-hero](https://karpathy.ai/zero-to-hero.html)）——本工程的灵魂来源。
- Sebastian Raschka《Build a Large Language Model From Scratch》——从 tokenizer 到完整 LLM 手写实现。
- 本知识库 [大语言模型概览](/knowledge/llms) / [注意力机制](/knowledge/attention) / [Transformer 架构](/knowledge/transformer) / [预训练与后训练](/knowledge/training) / [大模型幻觉](/knowledge/hallucination)。

*本工程为教学用途的最小实现，概念 100% 可迁移到生产级大模型。*
