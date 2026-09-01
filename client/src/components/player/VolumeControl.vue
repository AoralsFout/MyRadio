<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { usePlayerStore } from '@/stores/player.store'

const player = usePlayerStore()
const barRef = useTemplateRef<HTMLElement>('bar')

function ratioFromEvent(e: MouseEvent | TouchEvent): number {
  const bar = barRef.value
  if (!bar) return 0
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
}

function updateVolume(e: MouseEvent | TouchEvent) {
  player.setVolume(ratioFromEvent(e))
}

function onMouseDown(e: MouseEvent) {
  updateVolume(e)

  const onMove = (ev: MouseEvent) => updateVolume(ev)
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onTouchStart(e: TouchEvent) {
  updateVolume(e)

  const onMove = (ev: TouchEvent) => {
    ev.preventDefault()
    updateVolume(ev)
  }
  const onEnd = () => {
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}
</script>

<template>
  <div class="volume-control">
    <button class="volume-btn" @click="player.toggleMute()" :title="player.isMuted ? '取消静音' : '静音'">
      <svg v-if="player.isMuted || player.volume === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
      <svg v-else-if="player.volume < 0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    </button>
    <div
      ref="bar"
      class="volume-bar"
      @click="updateVolume"
      @mousedown="onMouseDown"
      @touchstart.prevent="onTouchStart"
    >
      <div class="volume-track">
        <div
          class="volume-fill"
          :style="{ width: (player.isMuted ? 0 : player.volume * 100) + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.volume-btn:hover {
  color: var(--color-accent);
}

.volume-bar {
  width: 80px;
  cursor: pointer;
  padding: 6px 0;
  touch-action: none;
  user-select: none;
}

.volume-track {
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  position: relative;
}

.volume-bar:hover .volume-track {
  height: 5px;
}

.volume-fill {
  height: 100%;
  background: var(--color-text-secondary);
  border-radius: 999px;
}

.volume-bar:hover .volume-fill {
  background: var(--color-accent);
}
</style>
