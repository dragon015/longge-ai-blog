import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import mermaid from 'mermaid'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
import TutorFrame from './components/TutorFrame.vue'
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

// 访问量计数器：直连 Vercount 公共计数 API（events.vercount.one，CORS 开放、无需注册、首访自动建站）。
// 不依赖第三方脚本的注入/初始化时机，自己在 SPA 的 onMounted / 路由变化时按当前 URL 直接 POST 计数并填充 busuanzi_* 占位。
// 复刻 Vercount 的 UV cookie 逻辑（vercount_uv_<host>），避免把每次访问都算作新访客。
function refreshCounter(path) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  if (refreshCounter._last === path) return
  refreshCounter._last = path

  const host = window.location.host || 'unknown-host'
  // 本地预览不计数，避免污染线上数据
  if (/^(localhost|127\.0\.0\.1|::1)$/.test(host)) return

  const API = 'https://events.vercount.one/api/v2/log'
  const cookieName = 'vercount_uv_' + host.replace(/[^a-zA-Z0-9_-]/g, '_')
  const getCookie = (n) => {
    const m = document.cookie.split('; ').find((c) => c.startsWith(n + '='))
    return m ? m.substring(n.length + 1) : null
  }
  let isNewUv = false
  if (getCookie(cookieName) !== '1') {
    isNewUv = true
    document.cookie = `${cookieName}=1; path=/; max-age=31536000; samesite=lax`
  }

  const url = window.location.href
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, isNewUv }),
  })
    .then((r) => r.json())
    .then((res) => {
      if (!res || res.status !== 'success' || !res.data) return
      const set = (id, val) => {
        const el = document.getElementById(id)
        if (el) el.textContent = val
      }
      set('busuanzi_value_site_pv', res.data.site_pv)
      set('busuanzi_value_site_uv', res.data.site_uv)
      set('busuanzi_value_page_pv', res.data.page_pv)
    })
    .catch(() => {
      /* 计数服务不可达时保留占位，不影响页面渲染 */
    })
}

export default {
  extends: DefaultTheme,
  // 覆盖默认布局，注入访问量计数器（doc-after / layout-bottom）
  Layout,
  // 注册全局组件，供 markdown 页面直接使用 <KnowledgeGraph /> / <TutorFrame />
  enhanceApp({ app }) {
    app.component('KnowledgeGraph', KnowledgeGraph)
    app.component('TutorFrame', TutorFrame)
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
