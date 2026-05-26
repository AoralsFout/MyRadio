<script setup lang="ts">
import NowPlaying from '@/components/player/NowPlaying.vue'
import PlayerControls from '@/components/player/PlayerControls.vue'
import ProgressBar from '@/components/player/ProgressBar.vue'
import VolumeControl from '@/components/player/VolumeControl.vue'
import { usePlayerStore } from '@/stores/player.store'

const player = usePlayerStore()
</script>

<template>
  <footer class="player-bar" :class="{ inactive: !player.currentSong }">
    <div class="player-bar-inner">
      <div class="player-left">
        <NowPlaying />
      </div>

      <div class="player-center">
        <PlayerControls />
        <ProgressBar />
      </div>

      <div class="player-right">
        <VolumeControl />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player-bar {
  height: var(--player-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 100;
  display: flex;
  align-items: center;
}

.player-bar.inactive {
  opacity: 0.5;
  pointer-events: none;
}

.player-bar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
  gap: 16px;
}

.player-left {
  width: 240px;
  flex-shrink: 0;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 600px;
  margin: 0 auto;
}

.player-right {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .player-bar-inner {
    padding: 0 12px;
    gap: 8px;
  }
  .player-left {
    width: 140px;
  }
  .player-right {
    width: auto;
  }
}

@media (max-width: 480px) {
  .player-left {
    display: none;
  }
}
</style>
