<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import SpectrumVisualizer from '@/components/player/SpectrumVisualizer.vue'
import { useLibraryStore } from '@/stores/library.store'
import { usePlayerStore } from '@/stores/player.store'
import { onMounted } from 'vue'

const library = useLibraryStore()
const player = usePlayerStore()

onMounted(async () => {
  await library.fetchSongs()
  player.initAudio()
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="main-content">
      <RouterView />
      <div class="spectrum-area">
        <SpectrumVisualizer />
      </div>
    </main>
    <PlayerBar />
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: 60px 1fr 80px;
  grid-template-areas:
    'header'
    'main'
    'player';
  height: 100dvh;
  overflow: hidden;
}

.app-layout > :first-child {
  grid-area: header;
}

.main-content {
  grid-area: main;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.spectrum-area {
  position: fixed;
  bottom: var(--player-height);
  left: 0;
  right: 0;
  height: 64px;
  z-index: 50;
  pointer-events: none;
}

.app-layout > :last-child {
  grid-area: player;
}
</style>
