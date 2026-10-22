import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import mermaid from 'mermaid'
import KnowledgeGraph from './components/KnowledgeGraph.vue'
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

export default {
  extends: DefaultTheme,
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
    onMounted(() => nextTick(() => renderMermaidIn(document)))
    watch(
      () => route.path,
      () => nextTick(() => renderMermaidIn(document)),
    )
  },
}
