import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import mermaid from 'mermaid'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
import Layout from './components/Layout.vue'
import './style.css'

// 深海军蓝底 + 霓虹青蓝，呼应全站视觉
const themeVariables = {
  background: 'transparent',
  primaryColor: '#12203f',
  primaryTextColor: '#e2e8f0',
  primaryBorderColor: '#38bdf8',
  lineColor: '#38bdf8',
  secondaryColor: '#0e1a36',
  tertiaryColor: '#12203f',
  fontFamily: 'inherit',
}

let initialized = false
let seq = 0

function renderMermaidIn(el = document) {
  if (!el) return
  const blocks = el.querySelectorAll('div.language-mermaid')
  blocks.forEach((block) => {
    if (block.dataset.mermaidDone) return
    block.dataset.mermaidDone = '1'
    const code = block.querySelector('code') || block
    const text = (code.textContent || '').trim()
    if (!text) return
    const id = `mmd-${Date.now()}-${seq++}`
    mermaid
      .render(id, text)
      .then((result) => {
        const svg = result?.svg
        if (!svg) throw new Error('empty svg from mermaid.render')
        const wrap = document.createElement('div')
        wrap.className = 'mermaid-svg'
        wrap.innerHTML = svg
        block.replaceWith(wrap)
        if (typeof result.bindFunctions === 'function') {
          result.bindFunctions(wrap)
        }
      })
      .catch((e) => {
        console.error('[mermaid] render failed:', e)
        block.dataset.mermaidDone = ''
        block.style.outline = '1px dashed rgba(226, 75, 74, 0.6)'
        block.style.outlineOffset = '4px'
        block.title = 'Mermaid 图渲染失败，请查看控制台错误'
      })
  })
}

// 访问量计数器：Vercount（不蒜子兼容实现，busuanzi.ibruce.info 官方长期不稳，
// 改用社区维护的兼容版；沿用 busuanzi_* 的 DOM ID，无需改标签结构）。
// VitePress 是 SPA，路由切换不会重载脚本，故在 path 变化时重新注入脚本按新 URL 计数。
function refreshCounter(path) {
  if (typeof document === 'undefined') return
  if (refreshCounter._last === path) return
  refreshCounter._last = path
  const id = 'vercount-counter'
  const old = document.getElementById(id)
  if (old) old.remove()
  const s = document.createElement('script')
  s.id = id
  s.async = true
  s.src = 'https://cn.vercount.one/js' // 中国加速；海外用 https://vercount.one/js
  document.body.appendChild(s)
}

export default {
  extends: DefaultTheme,
  // 覆盖默认布局，注入访问量计数器（doc-after / layout-bottom）
  Layout,
  // 注册全局组件，供 markdown 页面直接使用 <KnowledgeGraph />
  enhanceApp({ app }) {
    app.component('KnowledgeGraph', KnowledgeGraph)
  },
  setup() {
    const route = useRoute()
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables,
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
      })
      initialized = true
    }
    onMounted(() =>
      nextTick(() => {
        renderMermaidIn(document)
        refreshCounter(route.path)
      }),
    )
    watch(
      () => route.path,
      (p) =>
        nextTick(() => {
          renderMermaidIn(document)
          refreshCounter(p)
        }),
    )
  },
}
