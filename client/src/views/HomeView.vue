<script setup lang="ts">
import SongGrid from '@/components/library/SongGrid.vue'
import { useLibraryStore } from '@/stores/library.store'

const library = useLibraryStore()
</script>

<template>
  <div class="home-view">
    <div class="home-header">
      <div>
        <p class="home-kicker">LOCAL RADIO · PERSONAL ARCHIVE</p>
        <h1 class="home-title">把收藏，<span>调到同一频率。</span></h1>
      </div>
      <div class="library-stat" aria-label="曲库歌曲数量">
        <strong>{{ library.songCount.toString().padStart(2, '0') }}</strong>
        <span>TRACKS<br>IN LIBRARY</span>
      </div>
    </div>
    <div class="section-heading">
      <div>
        <span class="live-dot" aria-hidden="true" />
        <h2>学长音乐精选</h2>
      </div>
      <span>{{ library.searchQuery ? `“${library.searchQuery}” 的搜索结果` : '按下任意曲目开始播放' }}</span>
    </div>
    <SongGrid />
  </div>
</template>

<style scoped>
.home-view { max-width: 1500px; margin: 0 auto; }

.home-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 36px;
  padding: 26px 0 48px;
}

.home-kicker { margin-bottom: 14px; color: var(--color-accent); font: 600 11px/1 var(--font-mono); letter-spacing: 0.18em; }
.home-title { max-width: 760px; font-family: var(--font-display); font-size: clamp(42px, 6vw, 78px); font-weight: 800; letter-spacing: -0.055em; line-height: 0.98; }
.home-title span { display: block; color: var(--color-text-secondary); font-weight: 500; }
.library-stat { display: flex; align-items: center; gap: 14px; padding-bottom: 4px; flex-shrink: 0; }
.library-stat strong { color: var(--color-accent); font: 400 clamp(38px, 5vw, 64px)/0.8 var(--font-mono); letter-spacing: -0.08em; }
.library-stat span, .section-heading > span { color: var(--color-text-muted); font: 600 10px/1.45 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; }

.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0 15px; border-top: 1px solid var(--color-border-soft); border-bottom: 1px solid var(--color-border-soft); }
.section-heading > div { display: flex; align-items: center; gap: 10px; }
.section-heading h2 { font-size: 13px; font-weight: 650; letter-spacing: 0.03em; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-accent); box-shadow: 0 0 0 5px var(--color-accent-glow); }

@media (max-width: 680px) {
  .home-header { align-items: flex-start; padding: 16px 0 32px; }
  .library-stat { display: none; }
  .home-title { font-size: clamp(38px, 13vw, 58px); }
  .section-heading > span { max-width: 42%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
