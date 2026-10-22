<script setup>
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vitepress'
// 图谱数据由 scripts/build-kb-graph.mjs 在构建期（prebuild）生成。
// 这里静态内联进 bundle：避免运行时 fetch（dist 中不存在该 JSON 文件）与 base 路径问题，
// 新增笔记后重新构建即可刷新图谱。
import graphData from '../../../docs/knowledge/graph-data.json'

const router = useRouter()
const container = ref(null)
const loadError = ref('')
const stats = ref({ nodes: 0, links: 0, domains: 0 })
const legend = ref([])
const activeDomain = ref(null)

// 深海军蓝 + 霓虹：领域配色与全站主题呼应
const DOMAIN_COLORS = {
  '地基': '#22d3ee',
  '核心骨架': '#38bdf8',
  '训练': '#a78bfa',
  '模型与应用': '#f472b6',
  '模型笔记': '#818cf8',
  '后训练专题': '#c084fc',
  'Agent 专题': '#2dd4bf',
  '模型架构专题': '#60a5fa',
  '训练系统专题': '#fbbf24',
  '推理模型专题': '#f87171',
  '推理优化专题': '#34d399',
  '评测专题': '#fb923c',
}
const FALLBACK = '#94a3b8'
const DIM = 'rgba(100,116,139,0.25)'

const alpha = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}
const colorOf = (n) => DOMAIN_COLORS[n.domain] || FALLBACK

let graph = null
let adjacency = {}
let neighborSet = null
let hoverNode = null
let onResize = null

function prepare(data) {
  const clone = JSON.parse(JSON.stringify(data))
  clone.nodes.forEach((n) => { adjacency[n.id] = new Set([n.id]) })
  clone.links.forEach((l) => {
    if (!adjacency[l.source]) adjacency[l.source] = new Set([l.source])
    if (!adjacency[l.target]) adjacency[l.target] = new Set([l.target])
    adjacency[l.source].add(l.target)
    adjacency[l.target].add(l.source)
  })
  clone.nodes.forEach((n) => {
    // 节点半径随连接数增长：hub 笔记一眼可见
    n.r = Math.min(16, 5 + Math.sqrt(Math.max(0, adjacency[n.id].size - 1)) * 2.6)
    n.val = n.r
  })
  return clone
}

onMounted(async () => {
  let data
  try {
    data = prepare(graphData)
  } catch (e) {
    loadError.value = `图谱数据解析失败：${e.message}`
    return
  }
  try {
    await nextTick()
    const mod = await import('../lib/force-graph.min.js')
    const ForceGraph = mod.default || mod.ForceGraph || mod
    if (typeof ForceGraph !== 'function') throw new Error('force-graph 模块加载异常')

    const el = container.value
    const w = Math.max(320, el.clientWidth || 640)
    const h = Math.max(360, el.clientHeight || 640)

    const g = ForceGraph()(el)
      .graphData(data)
      .backgroundColor('rgba(0,0,0,0)')
      .width(w)
      .height(h)
      .nodeRelSize(1)

    g.d3Force('charge').strength(-420).distanceMax(620)
    const center = g.d3Force('center')
    if (center) center.strength(0.05)
    const collide = g.d3Force('collide')
    if (collide) collide.radius((d) => d.r + 8).strength(0.9)
    // 注意：force-graph v1.x 没有 linkDistance/linkStrength，
    // 链接距离与强度由 d3-force 的 link force 驱动
    const linkForce = g.d3Force('link')
    if (linkForce) {
      linkForce.distance((l) => 66 + (l.source.r || 6) + (l.target.r || 6))
      linkForce.strength(0.32)
    }

    g.linkColor((l) => {
        const lit = hoverNode
          ? hoverNode.id === l.source.id || hoverNode.id === l.target.id
          : true
        return lit ? alpha(colorOf(l.source), 0.42) : 'rgba(148,163,184,0.05)'
      })
      .linkWidth((l) => (hoverNode && (hoverNode.id === l.source.id || hoverNode.id === l.target.id)) ? 1.8 : 0.9)
      .linkDirectionalParticles((l) => (hoverNode && (hoverNode.id === l.source.id || hoverNode.id === l.target.id)) ? 2 : 0)
      .linkDirectionalParticleWidth(1.8)
      .linkDirectionalParticleSpeed(0.004)
      .linkDirectionalParticleColor((l) => colorOf(l.source))
      .nodeCanvasObjectMode('replace')
      .nodeCanvasObject((node, ctx, scale) => {
        const lit = hoverNode
          ? neighborSet && neighborSet.has(node.id)
          : activeDomain.value ? node.domain === activeDomain.value : true
        const r = node.r
        if (lit) { ctx.shadowColor = colorOf(node); ctx.shadowBlur = 16 }
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2, false)
        ctx.fillStyle = lit ? colorOf(node) : DIM
        ctx.fill()
        ctx.shadowBlur = 0
        // 内核
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 0.42, 0, Math.PI * 2, false)
        ctx.fillStyle = lit ? 'rgba(241,249,255,0.92)' : 'rgba(148,163,184,0.35)'
        ctx.fill()
        // 外环
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2, false)
        ctx.strokeStyle = lit ? 'rgba(226,232,240,0.75)' : 'rgba(100,116,139,0.3)'
        ctx.lineWidth = 1 / scale
        ctx.stroke()
        // 标签
        ctx.font = `600 ${11 / scale}px "PingFang SC","Microsoft YaHei",sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = lit ? 'rgba(226,232,240,0.95)' : 'rgba(148,163,184,0.35)'
        ctx.fillText(node.title, node.x, node.y + r + 3 / scale)
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + 6, 0, Math.PI * 2, false)
        ctx.fill()
      })
      .nodeLabel((node) => {
        const nb = adjacency[node.id].size - 1
        return `<div style="font-family:inherit;background:rgba(10,16,34,.92);border:1px solid ${alpha(colorOf(node), 0.5)};border-radius:8px;padding:6px 10px;font-size:12px;color:#e2e8f0;box-shadow:0 0 16px ${alpha(colorOf(node), 0.3)}">
          <b style="color:${colorOf(node)}">${node.title}</b><br>
          <span style="color:#8ea3c0;font-size:11px">${node.domain} · ${nb} 个邻居 · 点击前往</span>
        </div>`
      })
      .onNodeHover((node) => {
        hoverNode = node || null
        neighborSet = node ? adjacency[node.id] : null
        if (el) el.style.cursor = node ? 'pointer' : 'default'
      })
      .onNodeClick((node) => {
        // 与 demo 的区别：集成版点击节点直接跳转到对应笔记
        if (node && node.route) router.push(node.route)
      })
      .onBackgroundClick(() => {})

    g.onEngineStop(() => g.zoomToFit(1400, 80))
    graph = g

    // 统计 + 图例
    const domainCount = {}
    data.nodes.forEach((n) => { domainCount[n.domain] = (domainCount[n.domain] || 0) + 1 })
    stats.value = {
      nodes: data.nodes.length,
      links: data.links.length,
      domains: Object.keys(domainCount).length,
    }
    legend.value = Object.entries(domainCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, color: DOMAIN_COLORS[name] || FALLBACK }))

    onResize = () => {
      g.width(Math.max(320, el.clientWidth))
      g.height(Math.max(360, el.clientHeight))
    }
    window.addEventListener('resize', onResize)
  } catch (e) {
    loadError.value = `图谱渲染失败：${e.message}`
  }
})

onBeforeUnmount(() => {
  if (onResize) window.removeEventListener('resize', onResize)
  onResize = null
  if (graph && typeof graph._destructor === 'function') graph._destructor()
  graph = null
})

function fitView() { if (graph) graph.zoomToFit(800, 80) }
function reheat() {
  if (!graph) return
  graph.d3ReheatSimulation()
  graph.zoomToFit(1400, 80)
}
function enterDomain(name) { activeDomain.value = name; if (graph) graph.refresh() }
function leaveDomain() { activeDomain.value = null; if (graph) graph.refresh() }
</script>

<template>
  <div class="kg">
    <div class="kg-hud kg-top">
      <div class="kg-heading">
        <h3>知识图谱 · 交互版</h3>
        <p class="kg-sub">悬停高亮邻居 · 拖拽节点 · 滚轮缩放 · <b>点击直达笔记</b></p>
      </div>
      <div class="kg-stats">
        <div class="kg-stat"><b>{{ stats.nodes }}</b><span>笔记</span></div>
        <div class="kg-stat"><b>{{ stats.links }}</b><span>链接</span></div>
        <div class="kg-stat"><b>{{ stats.domains }}</b><span>领域</span></div>
      </div>
    </div>
    <aside v-if="legend.length" class="kg-hud kg-legend">
      <h2>领域（悬停筛选）</h2>
      <div
        v-for="d in legend"
        :key="d.name"
        class="kg-legend-item"
        @mouseenter="enterDomain(d.name)"
        @mouseleave="leaveDomain"
      >
        <span class="kg-dot" :style="{ background: d.color, color: d.color }"></span>
        {{ d.name }}<span class="kg-cnt">{{ d.count }}</span>
      </div>
    </aside>
    <div class="kg-hud kg-actions">
      <button type="button" @click="fitView">重置视图</button>
      <button type="button" @click="reheat">重新布局</button>
    </div>
    <div ref="container" class="kg-canvas"></div>
    <div v-if="loadError" class="kg-error">{{ loadError }}</div>
  </div>
</template>

<style scoped>
.kg {
  position: relative;
  height: 640px;
  margin: 16px 0 24px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.22);
  background:
    radial-gradient(rgba(56, 189, 248, 0.06) 1px, transparent 1px),
    radial-gradient(ellipse at 50% 35%, #111d3d 0%, #070b1f 55%, #04070f 100%);
  background-size: 26px 26px, 100% 100%;
  box-shadow: 0 0 24px rgba(2, 8, 23, 0.55), inset 0 0 18px rgba(56, 189, 248, 0.04);
}
.kg-canvas { position: absolute; inset: 0; }
.kg-canvas :deep(canvas) { display: block; }

.kg-hud {
  position: absolute;
  z-index: 10;
  background: rgba(10, 16, 34, 0.74);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 0 24px rgba(2, 8, 23, 0.55), inset 0 0 18px rgba(56, 189, 248, 0.04);
}
.kg-top {
  top: 14px; left: 14px; right: 14px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px; gap: 14px; flex-wrap: wrap;
}
.kg-heading h3 {
  font-size: 17px; letter-spacing: 0.5px; font-weight: 700;
  background: linear-gradient(90deg, #22d3ee, #818cf8, #e879f9);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.kg-sub { font-size: 12px; color: #8ea3c0; margin-top: 3px; }
.kg-sub b { color: #22d3ee; font-weight: 600; }
.kg-stats { display: flex; gap: 8px; }
.kg-stat {
  text-align: center; padding: 5px 12px; border-radius: 10px;
  background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.18);
}
.kg-stat b { display: block; font-size: 17px; color: #38bdf8; font-variant-numeric: tabular-nums; }
.kg-stat span { font-size: 11px; color: #8ea3c0; }

.kg-legend { top: 88px; right: 14px; padding: 10px 12px; max-width: 180px; }
.kg-legend h2 { font-size: 12px; color: #8ea3c0; font-weight: 600; margin-bottom: 6px; letter-spacing: 1px; }
.kg-legend-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #cbd5e1; padding: 3px 6px; border-radius: 6px; cursor: default;
  transition: background 0.15s;
}
.kg-legend-item:hover { background: rgba(56, 189, 248, 0.1); }
.kg-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; box-shadow: 0 0 8px currentColor; }
.kg-cnt { margin-left: auto; color: #64748b; font-size: 11px; font-variant-numeric: tabular-nums; }

.kg-actions { left: 14px; bottom: 14px; padding: 8px; display: flex; gap: 8px; }
.kg-actions button {
  font: inherit; font-size: 12px; color: #cbe4ff; cursor: pointer;
  background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 8px; padding: 5px 12px; transition: all 0.15s;
}
.kg-actions button:hover { background: rgba(56, 189, 248, 0.22); box-shadow: 0 0 12px rgba(56, 189, 248, 0.35); }

.kg-error {
  position: absolute; inset: 0; z-index: 20;
  display: flex; align-items: center; justify-content: center;
  color: #f87171; font-size: 13px; text-align: center; padding: 24px;
  background: rgba(4, 7, 15, 0.8);
}

@media (max-width: 760px) {
  .kg { height: 480px; }
  .kg-legend { display: none; }
  .kg-top { padding: 10px 12px; }
}
</style>
