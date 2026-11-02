<script setup>
import DefaultTheme from 'vitepress/theme'
import PageViews from './PageViews.vue'
import SiteViews from './SiteViews.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- 每篇文章正文之后：本文阅读量 -->
    <template #doc-after>
      <PageViews />
    </template>
    <!-- 每页底部（footer 之后）：全站访问量 + 访客数 -->
    <template #layout-bottom>
      <SiteViews />
    </template>
  </Layout>
</template>
