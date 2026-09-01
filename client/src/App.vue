<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import SpectrumVisualizer from '@/components/player/SpectrumVisualizer.vue'
import { useLibraryStore } from '@/stores/library.store'
import { usePlayerStore } from '@/stores/player.store'
import { useKeyboard } from '@/composables/useKeyboard'
import { onMounted } from 'vue'

const library = useLibraryStore()
const player = usePlayerStore()
useKeyboard()

onMounted(async () => {
  await library.fetchSongs()
  player.initAudio()
  player.restoreSession(library.songs)
})
</script>

<template>
  <div class="app-layout">
    <div class="ambient-glow" aria-hidden="true" />
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
  grid-template-rows: var(--header-height) 1fr var(--player-height);
  grid-template-areas:
    'header'
    'main'
    'player';
  height: 100dvh;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 76% -12%, rgba(90, 108, 207, 0.14), transparent 32%),
    linear-gradient(155deg, var(--color-bg) 0%, var(--color-bg-deep) 100%);
}

.ambient-glow {
  position: fixed;
  inset: auto 0 var(--player-height);
  height: 180px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(59, 71, 122, 0.08));
  z-index: -1;
}

.app-layout > .app-header {
  grid-area: header;
}

.main-content {
  grid-area: main;
  overflow-y: auto;
  padding: 34px clamp(20px, 4vw, 64px) 72px;
  position: relative;
}

.main-content::after {
  content: '';
  position: fixed;
  right: 0;
  bottom: var(--player-height);
  left: 0;
  height: 96px;
  z-index: 15;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(8, 11, 19, 0) 0%,
    rgba(8, 11, 19, 0.32) 38%,
    rgba(10, 13, 22, 0.76) 72%,
    rgba(12, 16, 26, 0.96) 100%
  );
}

.spectrum-area {
  position: fixed;
  bottom: var(--player-height);
  left: 0;
  right: 0;
  height: 74px;
  z-index: 20;
  opacity: 0.68;
  pointer-events: none;
}

.app-layout > :last-child {
  grid-area: player;
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px 16px 54px;
  }

  .main-content::after {
    height: 76px;
  }

  .spectrum-area {
    height: 44px;
  }
}
</style>
