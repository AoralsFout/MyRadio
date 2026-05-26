<script setup lang="ts">
import SongGrid from '@/components/library/SongGrid.vue'
import { useLibraryStore } from '@/stores/library.store'

const library = useLibraryStore()
</script>

<template>
  <div class="home-view">
    <div class="home-header">
      <h1 class="home-title">学长音乐精选</h1>
      <span class="home-count">{{ library.songCount }} 首歌曲</span>
    </div>
    <SongGrid />
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
}

.home-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.home-title {
  font-size: 24px;
  font-weight: 700;
}

.home-count {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
