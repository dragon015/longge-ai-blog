#!/usr/bin/env node
/**
 * scripts/fetch-ai-news.mjs — 每日 AI 动态抓取（飞轮组件）
 *
 * 数据源：AI HOT 公开 API（匿名只读，无需 Key）
 *   https://aihot.news/api/v1/items?mode=selected&window=24h&limit=12
 *
 * 产出：
 *   docs/ai-news/YYYY-MM-DD.md  当日动态（独立永久页，可被索引/反链）
 *   docs/ai-news/index.md       动态首页 = 最新一日全文 + 往期列表（近 14 天）
 *
 * 设计约定（与 build-kb-graph.mjs 一致）：
 *   - 页面由脚本生成，请勿手动编辑（会被下次运行覆盖）
 *   - 24h 窗口为空时降级到 7d 窗口，并在页面上如实标注口径
 *   - 完全无数据时不写文件、不产生空提交（exit 0 + 提示）
 *
 * 用法：node scripts/fetch-ai-news.mjs
 */

import {
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NEWS_DIR = path.join(ROOT, 'docs', 'ai-news')
const API_BASE = 'https://aihot.news/api/v1'
const USER_AGENT = 'aihot-skill/2.0.0 (+https://aihot.news/aihot-skill/)'
const LIMIT = 12
const ARCHIVE_DAYS = 14 // 索引页展示的往期天数（文件全部保留，仅列表截断）

// ---------- 分类字典（ slug → 中文标签 + 霓虹色，slug 来自 AI HOT API 实测） ----------
const CATEGORIES = {
  industry: { label: '行业', color: '#38bdf8' },
  'ai-models': { label: '模型', color: '#a78bfa' },
  'ai-products': { label: '产品', color: '#34d399' },
  paper: { label: '论文', color: '#fbbf24' },
  tip: { label: '技巧', color: '#f472b6' },
  opinion: { label: '观点', color: '#22d3ee' },
  default: { label: '动态', color: '#94a3b8' },
}

// ---------- 工具 ----------
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** 上海时区的日期键 YYYY-MM-DD 与人类可读时间 */
function shanghaiParts(iso) {
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(d)
  const get = (t) => parts.find((p) => p.type === t)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

const todayKey = () => shanghaiParts(new Date().toISOString()).date

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

// ---------- 抓取（24h 优先，空则降级 7d） ----------
async function fetchNews() {
  try {
    const data = await getJson(
      `${API_BASE}/items?mode=selected&window=24h&limit=${LIMIT}`,
    )
    if (data.items?.length) {
      return { items: data.items, window: '过去 24 小时', windowKey: '24h' }
    }
  } catch (e) {
    console.warn('24h 查询失败，尝试 7d：', e.message)
  }
  const data = await getJson(
    `${API_BASE}/items?mode=selected&window=7d&limit=${LIMIT}`,
  )
  return { items: data.items ?? [], window: '过去 7 天', windowKey: '7d' }
}

// ---------- 渲染 ----------
function newsCard(item, index) {
  const cat = CATEGORIES[item.category] ?? CATEGORIES.default
  // 时间口径：publishedAt 为空回退 discoveredAt（标注收录时间），与 AI HOT 时间轴一致
  const iso = item.publishedAt ?? item.discoveredAt
  const t = iso ? shanghaiParts(iso) : null
  const isDiscovered = !item.publishedAt && !!item.discoveredAt
  const aihotLink = item.links?.aihot ?? ''
  const originalLink = item.links?.original ?? ''
  const source = item.source?.name ?? '未知来源'

  return `<div class="news-card">
  <div class="news-card-head">
    <span class="news-cat" style="--cat:${cat.color}">${esc(cat.label)}</span>
    <a class="news-title" href="${esc(aihotLink)}" target="_blank" rel="noopener">${index + 1}. ${esc(item.title)}</a>
  </div>
  <p class="news-summary">${esc(item.summary)}</p>
  <div class="news-meta">
    <span class="news-source">${esc(source)}</span>
    ${t ? `<span class="news-time">${esc(t.date)} ${esc(t.time)}${isDiscovered ? '（收录）' : ''}</span>` : ''}
    ${originalLink ? `<a class="news-original" href="${esc(originalLink)}" target="_blank" rel="noopener">原文 ↗</a>` : ''}
  </div>
</div>`
}

function renderDaySection(dateKey, items, windowLabel, isLatest) {
  const [y, m, d] = dateKey.split('-')
  const dateCN = `${Number(m)}月${Number(d)}日`
  const cards = items.map(newsCard).join('\n')
  return `## ${isLatest ? '今天' : dateCN}（${dateKey}）<span class="news-count">${items.length} 条 · ${windowLabel}</span>

<div class="news-list">
${cards}
</div>`
}

const NOTICE = `<!-- 本文件由 scripts/fetch-ai-news.mjs 自动生成，请勿手动编辑 -->`

function dayPage(dateKey, items, windowLabel) {
  return `---
title: AI 动态 · ${dateKey}
---

${NOTICE}

# AI 动态 · ${dateKey}

> 本页由飞轮脚本自动抓取生成，共 ${items.length} 条（口径：${windowLabel}）。标题链接指向 AI HOT 精选详情，「原文」为第三方出处。

${renderDaySection(dateKey, items, windowLabel, true)}

---

资讯来源：[AI HOT](https://aihot.news)（aihot.news）公开 API 精选，摘要与标题版权归原作者所有；本页仅作学习索引，重要数字与政策请回第三方原文核对。
`
}

function indexPage(dateKey, items, windowLabel, archive) {
  const archiveLines = archive.length
    ? archive
        .map(
          (a) =>
            `- [${a.date} · ${a.count} 条](/ai-news/${a.date}) <span class="news-archive-window">${a.window}</span>`,
        )
        .join('\n')
    : '- 暂无往期（明天开始积累）'
  return `---
title: AI 最新动态
---

${NOTICE}

# AI 最新动态

<div class="news-banner">
  <p class="news-banner-lead">AI 圈每天发生什么，这里用<strong>人话</strong>告诉你——每天早 9 点由飞轮脚本自动抓取 <a href="https://aihot.news" target="_blank" rel="noopener">AI HOT</a> 精选更新，已接入「层级为干、链接为脉、地图为门」的知识库查找体系。</p>
  <p class="news-banner-meta">今日更新：${dateKey} · 共 ${items.length} 条 · 口径：${windowLabel}</p>
</div>

${renderDaySection(dateKey, items, windowLabel, true)}

## 往期动态

${archiveLines}

---

资讯来源：[AI HOT](https://aihot.news)（aihot.news）公开 API 精选，摘要与标题版权归原作者所有；本页仅作学习索引，重要数字与政策请回第三方原文核对。
`
}

// ---------- 主流程 ----------
function listArchive(currentDate) {
  if (!existsSync(NEWS_DIR)) return []
  const files = readdirSync(NEWS_DIR).filter(
    (f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f) && f !== `${currentDate}.md`,
  )
  return files
    .map((f) => {
      const date = f.replace('.md', '')
      const file = path.join(NEWS_DIR, f)
      const content = existsSync(file) ? readFileSync(file, 'utf8') : ''
      const count = Number(content.match(/共 (\d+) 条/)?.[1] ?? 0)
      const window = content.match(/口径：(过去 \d+ 小时|过去 \d+ 天)/)?.[1] ?? ''
      return { date, count, window }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, ARCHIVE_DAYS)
}

async function main() {
  const { items, window } = await fetchNews()
  if (!items.length) {
    console.log('NO-NEWS: 24h 与 7d 窗口均无数据，跳过本次更新（不生成空页面）')
    return
  }

  mkdirSync(NEWS_DIR, { recursive: true })
  const dateKey = todayKey()

  // 当日独立页（同一天重复运行则覆盖刷新）
  writeFileSync(
    path.join(NEWS_DIR, `${dateKey}.md`),
    dayPage(dateKey, items, window),
    'utf8',
  )

  // 索引页 = 最新一日 + 往期列表
  const archive = listArchive(dateKey)
  writeFileSync(
    path.join(NEWS_DIR, 'index.md'),
    indexPage(dateKey, items, window, archive),
    'utf8',
  )

  console.log(
    `NEWS-OK: ${dateKey} · ${items.length} 条 · 口径「${window}」 · 往期 ${archive.length} 天`,
  )
}

main().catch((e) => {
  console.error('NEWS-FAIL:', e.message)
  process.exit(1)
})
