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
  background: rgba(12, 16, 26, 0.9);
  border-top: 1px solid rgba(154, 169, 203, 0.14);
  box-shadow: 0 -18px 42px rgba(5, 7, 12, 0.12);
  backdrop-filter: blur(24px);
  z-index: 100;
  display: flex;
  align-items: center;
}

.player-bar.inactive {
  opacity: 0.65;
  pointer-events: none;
}

.player-bar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 clamp(20px, 4vw, 64px);
  gap: clamp(16px, 3vw, 40px);
}

.player-left {
  width: min(27vw, 310px);
  flex-shrink: 0;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 680px;
  margin: 0 auto;
}

.player-right {
  width: min(18vw, 190px);
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .player-bar-inner {
    padding: 0 14px;
    gap: 8px;
    align-items: center;
  }
  .player-left {
    width: 145px;
  }
  .player-right {
    display: none;
  }
}

@media (max-width: 540px) {
  .player-left {
    width: 112px;
  }
  .player-center {
    min-width: 0;
  }
}
</style>
