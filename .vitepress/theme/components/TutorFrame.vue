<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

// 客户端作为 docs/public 静态资源原样发布，用 withBase 兼容 GitHub Pages 子路径 /longge-ai-blog/
const SRC = withBase('/tutor/index.html')

const tall = ref(false)        // 沉浸高度开关（由 CSS 类控制，保证 media query 可覆盖）
const loaded = ref(false)      // iframe 加载态

function toggleTall() { tall.value = !tall.value }
function openFull() { window.open(SRC, '_blank', 'noopener,noreferrer') }

onMounted(() => {
  // iframe 可能在 hydration 前就已完成加载，@load 事件会丢失。
  // 双保险：@load 正常触发即撤态；否则 1.2s 后无条件撤掉加载遮罩，避免永久遮挡。
  setTimeout(() => { loaded.value = true }, 1200)
})
</script>

<template>
  <div class="tutor-frame" :class="{ 'is-tall': tall }">
    <!-- 工具条：主次动作分离，右对齐主 CTA -->
    <div class="tf-bar">
      <div class="tf-id">
        <span class="tf-dot" aria-hidden="true"></span>
        <span class="tf-name">GPT &amp; RAG · 实战闯关 Dojo</span>
        <span class="tf-meta">13 关线性解锁 · 进度自动保存</span>
      </div>
      <div class="tf-actions">
        <button class="tf-btn tf-ghost" type="button" @click="toggleTall">
          {{ tall ? '还原高度' : '沉浸高度' }}
        </button>
        <button class="tf-btn tf-primary" type="button" @click="openFull">
          全屏打开 ↗
        </button>
      </div>
    </div>

    <!-- 舞台：iframe 独立文档，天然隔离客户端 CSS / JS / :root 变量 -->
    <div class="tf-stage">
      <div v-if="!loaded" class="tf-loading" role="status">
        <span class="tf-spinner" aria-hidden="true"></span>
        <span>正在装载 13 关实验台…</span>
      </div>
      <iframe
        :src="SRC"
        title="GPT 与 RAG 引导学习客户端（13 关闯关）"
        aria-label="GPT 与 RAG 引导学习客户端"
        loading="lazy"
        allow="clipboard-write"
        @load="loaded = true"
      ></iframe>
    </div>

    <div class="tf-foot">
      <span>💡 嵌入版与「全屏打开」<strong>同源共享进度</strong>（localStorage），两边接着学不断档。</span>
      <a :href="SRC" target="_blank" rel="noopener noreferrer">独立窗口打开 ↗</a>
    </div>
  </div>
</template>

<style scoped>
/* ===== 设计令牌（8pt 栅格） ===== */
.tutor-frame {
  --tf-radius: 14px;
  --tf-border: 1px solid var(--vp-c-divider);
  --tf-gap: 12px;
  margin: 20px 0 8px;
  border: var(--tf-border);
  border-radius: var(--tf-radius);
  background: var(--vp-c-bg-alt);
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(7, 11, 26, .18);
}

/* 工具条 48px 高，信息在左、动作在右 */
.tf-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tf-gap);
  min-height: 48px;
  padding: 8px 16px;
  border-bottom: var(--tf-border);
  background: var(--vp-c-bg-soft);
}
.tf-id { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tf-dot {
  width: 8px; height: 8px; flex: none;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 10px rgba(34, 211, 238, .8);
}
.tf-name {
  font-size: 13px; font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}
.tf-meta {
  font-size: 11.5px; color: var(--vp-c-text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tf-actions { display: flex; align-items: center; gap: 8px; flex: none; }

.tf-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  border: 1px solid var(--vp-c-border);
  transition: transform .15s, box-shadow .15s, border-color .15s;
  white-space: nowrap;
}
.tf-btn:hover { transform: translateY(-1px); }
.tf-btn:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }
.tf-ghost { background: transparent; color: var(--vp-c-text-2); }
.tf-ghost:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.tf-primary {
  border: none;
  color: #070b1a; /* 对 #38bdf8 对比度 ≈ 10:1，远超 4.5:1 */
  background: linear-gradient(120deg, #38bdf8, #818cf8 45%, #22d3ee);
  box-shadow: 0 4px 14px rgba(56, 189, 248, .28);
}
.tf-primary:hover { box-shadow: 0 6px 20px rgba(56, 189, 248, .42); }

/* 舞台：iframe 填满，深色底避免加载白闪（客户端本身为 #070b1a 深海军蓝）。
   高度用类控制而非内联 style，确保窄屏 media query 能覆盖（内联优先级更高会锁死）。 */
.tf-stage { position: relative; width: 100%; height: 720px; background: #070b1a; transition: height .25s ease; }
.tutor-frame.is-tall .tf-stage { height: 88vh; }
.tf-stage iframe {
  display: block;
  width: 100%; height: 100%;
  border: 0;
  color-scheme: dark;
}
.tf-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  color: #a7b4d4; font-size: 13px;
  background: #070b1a;
}
.tf-spinner {
  width: 22px; height: 22px;
  border: 2px solid rgba(56, 189, 248, .25);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: tf-spin .8s linear infinite;
}
@keyframes tf-spin { to { transform: rotate(360deg); } }

.tf-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--tf-gap); flex-wrap: wrap;
  padding: 10px 16px;
  border-top: var(--tf-border);
  font-size: 11.5px; line-height: 1.6;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}
.tf-foot strong { color: var(--vp-c-brand-1); }
.tf-foot a { color: var(--vp-c-brand-1); font-weight: 600; white-space: nowrap; }

/* 响应式：<820px 客户端自身切单列布局，工具条换行、高度收敛 */
@media (max-width: 820px) {
  .tf-bar { flex-wrap: wrap; gap: 8px; }
  .tf-id { width: 100%; }
  .tf-meta { display: none; }
  .tf-actions { width: 100%; }
  .tf-btn { flex: 1; }
  .tf-foot { flex-direction: column; align-items: flex-start; }
  .tf-stage { height: 64vh; min-height: 480px; }
  .tutor-frame.is-tall .tf-stage { height: 86vh; }
}
</style>
