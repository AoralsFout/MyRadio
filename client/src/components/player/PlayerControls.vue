<script setup lang="ts">
import { usePlayerStore } from '@/stores/player.store'
import { computed } from 'vue'

const player = usePlayerStore()

const repeatIcon = computed(() => {
  if (player.repeatMode === 'one') return '🔂'
  if (player.repeatMode === 'all') return '🔁'
  return '➡️'
})
</script>

import { computed } from 'vue'

<template>
  <div class="player-controls">
    <button
      class="ctrl-btn"
      :class="{ active: player.isShuffled }"
      @click="player.toggleShuffle()"
      title="随机播放"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <polyline points="16 3 21 3 21 8"/>
        <line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
        <line x1="4" y1="4" x2="9" y2="9"/>
      </svg>
    </button>

    <button class="ctrl-btn" @click="player.prevTrack()" title="上一首">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>

    <button class="play-btn" @click="player.togglePlay()" :title="player.isPlaying ? '暂停' : '播放'">
      <svg v-if="!player.isPlaying" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>

    <button class="ctrl-btn" @click="player.nextTrack()" title="下一首">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>

    <button
      class="ctrl-btn"
      :class="{ active: player.repeatMode !== 'off' }"
      @click="player.setRepeatMode()"
      :title="`循环: ${player.repeatMode}`"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <polyline points="1 4 1 10 7 10"/>
        <polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
      <span v-if="player.repeatMode === 'one'" class="repeat-badge">1</span>
    </button>
  </div>
</template>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: color 0.2s;
  position: relative;
}

.ctrl-btn:hover {
  color: var(--color-text);
}

.ctrl-btn.active {
  color: var(--color-accent);
}

.play-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  transition: background 0.2s, transform 0.1s;
}

.play-btn:hover {
  background: var(--color-accent-hover);
}

.play-btn:active {
  transform: scale(0.95);
}

.repeat-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
