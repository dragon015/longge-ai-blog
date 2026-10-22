// build-kb-graph.mjs
// 知识图谱成长飞轮脚本（全站版）：
//   1. 扫描全站笔记：docs/knowledge + base-models / post-training / agent / architecture 等专题目录
//   2. 解析每篇的 tags / aliases / domain 与内部链接
//   3. 生成 graph.md   —— 按「领域」分组的 Mermaid 全站图谱 + 标签索引 + 孤岛提醒
//   4. 生成 gaps.md    —— 对照主概念表检测未覆盖概念（待补清单 = 飞轮输入）
//   5. 生成 aliases.md —— 概念别名表（口语词 → 笔记，抢救搜索召回）
//   6. 向每篇笔记注入「相关笔记」（正向关联，基于共同标签/交叉引用，幂等）
//   7. 向每篇笔记注入「被以下笔记引用」（反向链接，幂等）
//   8. 刷新页面里的 <!-- kb-progress --> 标记（首页/总览的动态覆盖进度）
// 设计为构建期自动跑（package.json 的 prebuild），新增笔记即自动生长。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.resolve(__dirname, '../docs')
const KB_DIR = path.join(DOCS, 'knowledge')

// 参与图谱的目录（顺序即扫描优先级，knowledge 优先）
const SCAN_DIRS = [
  'knowledge',
  'base-models',
  'post-training',
  'agent',
  'architecture',
  'training-systems',
  'inference-models',
  'inference-optimization',
  'evaluation',
]

// 目录 → 默认领域（frontmatter 里的 domain 优先）
const DIR_DOMAIN = {
  'base-models': '模型笔记',
  'post-training': '后训练专题',
  'agent': 'Agent 专题',
  'architecture': '模型架构专题',
  'training-systems': '训练系统专题',
  'inference-models': '推理模型专题',
  'inference-optimization': '推理优化专题',
  'evaluation': '评测专题',
}

// 不进入图谱的文件
const EXCLUDE_SLUGS = new Set(['graph', 'gaps', 'aliases'])

// 理想 AI 课程体系主概念表：hit 任一关键词即视为已覆盖
const CONCEPTS = [
  { name: '机器学习基础', match: ['机器学习', '监督学习', '无监督学习', '强化学习', '梯度下降', '过拟合', '评估指标'], hint: '三大范式、训练/验证/测试、损失函数、正则化' },
  { name: '神经网络与反向传播', match: ['神经网络', '反向传播', '激活函数', '感知机', '链式法则'], hint: '从感知机到多层网络，前向/反向传播' },
  { name: 'Transformer 架构', match: ['Transformer', '自注意力', '位置编码', 'LayerNorm', '残差连接', '编码器', '解码器'], hint: '现代大模型统一骨架' },
  { name: '注意力机制', match: ['注意力机制', 'QKV', '缩放点积', 'KV', 'GQA', 'MLA', 'RoPE', '多头注意力'], hint: 'Q/K/V、KV 缓存、变体对比' },
  { name: '预训练', match: ['预训练', 'CLM', 'MLM', '自监督', '因果语言建模', '掩码语言'], hint: '海量文本自学，预测下一个 token' },
  { name: '后训练（SFT/RLHF/DPO）', match: ['后训练', 'SFT', 'RLHF', 'DPO', '奖励模型', '偏好优化'], hint: '把基础模型调教成好用的助手' },
  { name: 'RLVR 与推理训练', match: ['RLVR', '可验证奖励', '顿悟'], hint: '用答案对错当奖励，模型自己学会思考' },
  { name: '大语言模型（LLM）', match: ['大语言模型', 'Tokenization', 'Embedding', '上下文窗口', '自回归', 'Scaling', '困惑度'], hint: '分词、向量化、自回归生成' },
  { name: '推理模型', match: ['推理模型', '推理轨迹', '思考开关', '推理缩放', '训练缩放', '努力'], hint: '会打草稿、可控思考油门' },
  { name: 'Agent 智能体', match: ['Agent', '智能体', '工具调用', 'function calling', 'MCP'], hint: '让模型调用工具、自主完成任务' },
  { name: '推理优化与量化', match: ['量化', '蒸馏', '推理优化', 'KV 缓存', '批处理', '投机解码', 'FlashAttention'], hint: '降本提速：量化/蒸馏/缓存优化' },
  { name: '模型架构对比', match: ['模型架构', 'DeepSeek', 'Llama', 'Qwen', 'Gemma', 'Mistral', 'MoE'], hint: '逐家拆解主流开源模型骨架' },
  { name: '参数高效微调（LoRA/PEFT）', match: ['LoRA', 'PEFT', '适配器', '微调'], hint: '低成本定制专属模型' },
  { name: '多模态', match: ['多模态', '视觉语言', 'VLM', '图文', '语音'], hint: '文本+图像/语音的统一建模' },
  { name: 'RAG 检索增强生成', match: ['RAG', '检索增强', '向量数据库', '向量库'], hint: '给模型外接知识库，缓解幻觉' },
  { name: '提示工程', match: ['提示工程', 'Prompt', 'Few-shot', 'CoT', '思维链'], hint: '把任务讲清楚的工程技巧' },
  { name: '评测与基准', match: ['评测', '基准', 'Benchmark', 'MMLU', 'HumanEval', '困惑度'], hint: '怎么客观衡量模型好坏' },
  { name: '数据工程与数据质量', match: ['数据工程', '数据质量', '合成数据', '数据清洗'], hint: '后训练瓶颈常在数据不在算力' },
  { name: '部署与推理服务', match: ['部署', '推理服务', 'vLLM', '推理框架', '服务化'], hint: '把模型变成可调用的线上服务' },
  { name: 'AI 安全与对齐', match: ['安全', '对齐', 'Alignment', '红队', '越狱', '宪法'], hint: '让模型可控、可信、不胡来' },
]

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return { meta: {}, body: raw }
  const fm = m[1]
  const meta = {}
  const arr = (key) => {
    const line = fm.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`))
    return line ? line[1].split(',').map(s => s.trim()).filter(Boolean) : null
  }
  meta.tags = arr('tags') || []
  meta.aliases = arr('aliases') || []
  const titleLine = fm.match(/title:\s*(.+)/)
  if (titleLine) meta.title = titleLine[1].trim()
  const domainLine = fm.match(/domain:\s*(.+)/)
  if (domainLine) meta.domain = domainLine[1].trim()
  return { meta, body: raw.slice(m[0].length) }
}

const nodeId = (dir, slug) =>
  `${dir}__${slug}`.replace(/[^a-zA-Z0-9]/g, '_')

const routeOf = (dir, slug) =>
  dir === 'knowledge' ? `/knowledge/${slug}` : `/${dir}${slug === 'index' ? '/' : `/${slug}`}`

const routeKey = (r) => r.replace(/\/+$/, '') || '/'

function extractLinks(body) {
  const out = new Set()
  for (const m of body.matchAll(/\]\((\/[^)\s]+)\)/g)) out.add(routeKey(m[1].split('#')[0]))
  for (const m of body.matchAll(/\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/g)) out.add(`/knowledge/${m[1].trim()}`)
  return [...out]
}

function listNotes() {
  const notes = []
  for (const dir of SCAN_DIRS) {
    const full = path.join(DOCS, dir)
    if (!fs.existsSync(full)) continue
    for (const f of fs.readdirSync(full).filter(f => f.endsWith('.md')).sort()) {
      const slug = f.replace(/\.md$/, '')
      if (EXCLUDE_SLUGS.has(slug) || slug.startsWith('_')) continue
      if (dir === 'knowledge' && slug === 'index') continue
      const raw = fs.readFileSync(path.join(full, f), 'utf8')
      const { meta, body } = parseFrontmatter(raw)
      const route = routeOf(dir, slug)
      const h1 = body.match(/^#\s+(.+)$/m)
      notes.push({
        dir,
        slug,
        route,
        key: routeKey(route),
        id: nodeId(dir, slug),
        title: meta.title || (h1 ? h1[1].trim() : slug),
        tags: meta.tags,
        aliases: meta.aliases,
        domain: meta.domain || DIR_DOMAIN[dir] || '其他',
        links: extractLinks(body),
        body,
      })
    }
  }
  return notes
}

const notes = listNotes()
const byKey = Object.fromEntries(notes.map(n => [n.key, n]))

function collectEdges() {
  const edges = []
  const seen = new Set()
  for (const n of notes) {
    for (const k of n.links) {
      const t = byKey[k]
      if (t && t.id !== n.id && !seen.has(`${n.id}->${t.id}`)) {
        seen.add(`${n.id}->${t.id}`)
        edges.push([n, t])
      }
    }
  }
  return edges
}

const edges = collectEdges()

function buildGraph() {
  const L = []
  L.push('---', 'title: 知识图谱', '---', '')
  L.push('<!-- 本文件由 scripts/build-kb-graph.mjs 自动生成，请勿手动编辑 -->', '')
  L.push('# 知识图谱（全站）', '')
  L.push('> 这张图由构建脚本**自动**根据全站笔记的内部链接生成，并按「领域」着上霓虹配色——这就是「层级为干、链接为脉」的可视化：颜色分组是层级，连线是链接。节点越大说明被引用越多（枢纽笔记）；悬停节点可高亮它的邻居并显示粒子流向；点击节点直达那篇笔记。每新增一篇笔记、多一条引用，图谱就自动长出新节点和新连线。')
  L.push('')
  L.push('<ClientOnly>')
  L.push('  <KnowledgeGraph />')
  L.push('</ClientOnly>')
  L.push('')

  const degree = {}
  for (const n of notes) degree[n.id] = 0
  for (const [a, b] of edges) { degree[a.id]++; degree[b.id]++ }
  const islands = notes.filter(n => degree[n.id] === 0)
  L.push('## 孤岛提醒', '')
  if (islands.length) {
    L.push('以下笔记还没有任何链接关联，把它们用起来（加标签、互相引用）就能接入图谱：', '')
    for (const n of islands) L.push(`- [${n.title}](${n.route})`)
  } else {
    L.push('暂无孤岛——每篇笔记都至少有一条链接关联，很好。')
  }
  L.push('', '## 标签索引（概念簇）', '')
  const tagMap = {}
  for (const n of notes) for (const t of n.tags) (tagMap[t] ||= []).push(n)
  for (const t of Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length)) {
    L.push(`- **${t}**：${tagMap[t].map(n => `[${n.title}](${n.route})`).join('、')}`)
  }
  L.push('')
  return L.join('\n') + '\n'
}

// 覆盖判定只看标题 + 标签（别名只进别名表，避免误命中虚报覆盖）
const conceptText = (n) => [n.title, ...n.tags].join(' ')

function isCovered(c) {
  return notes.some(n => c.match.some(k => conceptText(n).includes(k)))
}

function buildGaps() {
  const L = []
  L.push('---', 'title: 知识缺口', '---', '')
  L.push('<!-- 本文件由 scripts/build-kb-graph.mjs 自动生成，请勿手动编辑 -->', '')
  L.push('# 知识缺口与待补清单', '')
  L.push('> 这是「成长飞轮」的**输入**：脚本对照一份「理想 AI 课程体系」主概念表，扫描全站笔记的标题 / 标签 / 别名，自动检测出**还没覆盖**的概念。每补一篇笔记，这里的勾就会多一个——它反过来驱动你去采集、去写作。', '')
  L.push('', '## 已覆盖', '')
  const covered = CONCEPTS.filter(isCovered)
  for (const c of covered) {
    const hit = notes.find(n => c.match.some(k => [n.title, ...n.tags, ...n.aliases].join(' ').includes(k)))
    L.push(`- [x] **${c.name}** — 见 [${hit.title}](${hit.route})`)
  }
  L.push('', '## 待补（飞轮输入）', '')
  for (const c of CONCEPTS.filter(c => !isCovered(c))) {
    L.push(`- [ ] **${c.name}** — ${c.hint}`)
  }
  L.push('', `> 覆盖进度：${covered.length} / ${CONCEPTS.length} 个核心概念。补完一篇后重新跑 \`npm run kb:graph\`（或构建）即可刷新本页。`, '')
  return L.join('\n') + '\n'
}

function buildAliases() {
  const L = []
  L.push('---', 'title: 概念别名表', '---', '')
  L.push('<!-- 本文件由 scripts/build-kb-graph.mjs 自动生成，请勿手动编辑 -->', '')
  L.push('# 概念别名表（搜索急救包）', '')
  L.push('> 人回忆概念时用的是**口语词**：你可能记得「注意力」，想不起页面标题叫「注意力机制」；记得「KV Cache」，想不起它在「推理优化」里也有一份。本表由各篇笔记 frontmatter 里的 `aliases` 字段自动汇总——在右上角搜索框输入下表任意一词，都能落到对应笔记。', '')
  const rows = []
  for (const n of notes) {
    for (const a of n.aliases) rows.push([a, n])
  }
  rows.sort((a, b) => a[0].localeCompare(b[0], 'zh'))
  L.push('## 别名 → 笔记', '')
  L.push('| 你可能输入 | 对应笔记 |', '| --- | --- |')
  for (const [a, n] of rows) L.push(`| ${a} | [${n.title}](${n.route}) |`)
  L.push('', '## 笔记 → 别名（写作时补录用）', '')
  for (const n of notes.filter(n => n.aliases.length)) {
    L.push(`- [${n.title}](${n.route})：${n.aliases.join('、')}`)
  }
  L.push('', '> 给笔记加别名的方法：在 frontmatter 里写 `aliases: [Attention, 自注意力, QKV]`，下次构建本表自动更新。', '')
  return L.join('\n') + '\n'
}

const START = '<!-- kb-related:start -->'
const END = '<!-- kb-related:end -->'
const BSTART = '<!-- kb-backlinks:start -->'
const BEND = '<!-- kb-backlinks:end -->'

function insertBlock(raw, start, end, block, preferAfter = null) {
  if (raw.includes(start) && raw.includes(end)) {
    return raw.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${block}\n${end}`)
  }
  if (preferAfter && raw.includes(preferAfter)) {
    const i = raw.indexOf(preferAfter) + preferAfter.length
    return raw.slice(0, i) + `\n\n${start}\n${block}\n${end}` + raw.slice(i)
  }
  if (raw.includes('## 延伸阅读')) {
    return raw.replace('## 延伸阅读', `${start}\n${block}\n${end}\n\n## 延伸阅读`)
  }
  return raw.trimEnd() + `\n\n${start}\n${block}\n${end}\n`
}

function injectRelatedAndBacklinks() {
  for (const n of notes) {
    const related = notes
      .filter(o => o.id !== n.id)
      .map(o => {
        const shared = o.tags.filter(t => n.tags.includes(t))
        const linked = n.links.includes(o.key) || o.links.includes(n.key)
        const reasons = [...shared.map(t => `标签：${t}`), ...(linked ? ['交叉引用'] : [])]
        return { o, score: shared.length + (linked ? 0.5 : 0), reasons }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
    let block = '## 相关笔记\n\n'
    block += related.length
      ? related.map(x => `- [${x.o.title}](${x.o.route})${x.reasons.length ? ` — ${x.reasons.join('、')}` : ''}`).join('\n') + '\n'
      : '_（暂无自动关联，给笔记加上共同标签或互相链接后会自动出现）_\n'

    const incoming = notes.filter(o => o.id !== n.id && o.links.includes(n.key))
    let bblock = '## 被以下笔记引用\n\n'
    bblock += incoming.length
      ? incoming.map(o => `- [${o.title}](${o.route})`).join('\n') + '\n'
      : '_（还没有笔记引用这篇——在别的笔记里加一条指向它的链接，这里就会自动出现）_\n'

    const file = path.join(DOCS, n.dir, n.slug + '.md')
    let raw = fs.readFileSync(file, 'utf8')
    raw = insertBlock(raw, START, END, block)
    raw = insertBlock(raw, BSTART, BEND, bblock, END)
    fs.writeFileSync(file, raw)
  }
}

function injectProgress() {
  const covered = CONCEPTS.filter(isCovered).length
  const stats = `覆盖进度 <strong>${covered} / ${CONCEPTS.length}</strong> 个核心概念 · 图谱共 <strong>${notes.length}</strong> 篇笔记 · <strong>${edges.length}</strong> 条链接（构建时由脚本自动刷新）`
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { walk(p); continue }
      if (!p.endsWith('.md')) continue
      const raw = fs.readFileSync(p, 'utf8')
      if (!raw.includes('<!-- kb-progress:start -->')) continue
      const next = raw.replace(
        /<!-- kb-progress:start -->[\s\S]*?<!-- kb-progress:end -->/,
        `<!-- kb-progress:start -->${stats}<!-- kb-progress:end -->`,
      )
      if (next !== raw) fs.writeFileSync(p, next)
    }
  }
  walk(DOCS)
}

fs.writeFileSync(path.join(KB_DIR, 'graph.md'), buildGraph())
fs.writeFileSync(path.join(KB_DIR, 'gaps.md'), buildGaps())
fs.writeFileSync(path.join(KB_DIR, 'aliases.md'), buildAliases())

// 同时输出 JSON 数据，供交互式图谱组件（force-graph）消费：
// 图谱页的 Vue 组件 fetch 这份文件即可渲染，无需再解析 mermaid 源码
const graphData = {
  generatedBy: 'scripts/build-kb-graph.mjs',
  nodes: notes.map(n => ({
    id: n.id,
    title: n.title,
    route: n.route,
    domain: n.domain,
    tags: n.tags,
    aliases: n.aliases,
  })),
  links: edges.map(([a, b]) => ({ source: a.id, target: b.id })),
}
fs.writeFileSync(path.join(KB_DIR, 'graph-data.json'), JSON.stringify(graphData, null, 2))

injectRelatedAndBacklinks()
injectProgress()
console.log(`[kb-graph] 全站图谱：${notes.length} 篇笔记 / ${edges.length} 条链接；已生成 graph.md / gaps.md / aliases.md / graph-data.json，并注入相关笔记、反链与进度标记。`)
