<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { usePlayerStore } from '@/stores/player.store'

const player = usePlayerStore()
const isDragging = ref(false)
const dragProgress = ref(0)
const barRef = useTemplateRef<HTMLElement>('bar')

const displayProgress = computed(() =>
  isDragging.value ? dragProgress.value : player.progress,
)

const displayTime = computed(() => {
  if (isDragging.value) {
    const secs = (dragProgress.value / 100) * player.duration
    return formatTime(secs)
  }
  return player.formattedCurrentTime
})

function ratioFromEvent(e: MouseEvent | TouchEvent): number {
  const bar = barRef.value
  if (!bar) return 0
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
}

function updateDrag(e: MouseEvent | TouchEvent) {
  dragProgress.value = ratioFromEvent(e) * 100
}

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  updateDrag(e)

  const onMove = (ev: MouseEvent) => updateDrag(ev)
  const onUp = () => {
    isDragging.value = false
    player.seek((dragProgress.value / 100) * player.duration)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onClick(e: MouseEvent) {
  updateDrag(e)
  player.seek((dragProgress.value / 100) * player.duration)
}

function onTouchStart(e: TouchEvent) {
  isDragging.value = true
  updateDrag(e)

  const onMove = (ev: TouchEvent) => {
    ev.preventDefault()
    updateDrag(ev)
  }
  const onEnd = () => {
    isDragging.value = false
    player.seek((dragProgress.value / 100) * player.duration)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="progress-wrap">
    <span class="time">{{ displayTime }}</span>
    <div
      ref="bar"
      class="progress-bar"
      @click="onClick"
      @mousedown="onMouseDown"
      @touchstart.prevent="onTouchStart"
    >
      <div class="progress-track">
        <div
          v-for="(r, i) in player.buffered"
          :key="i"
          class="progress-buffered"
          :style="{ left: r.start + '%', width: (r.end - r.start) + '%' }"
        />
        <div
          class="progress-fill"
          :class="{ 'no-transition': isDragging }"
          :style="{ width: displayProgress + '%' }"
        />
        <div
          class="progress-thumb"
          :class="{ active: isDragging }"
          :style="{ left: displayProgress + '%' }"
        />
      </div>
    </div>
    <span class="time">{{ player.formattedDuration }}</span>
  </div>
</template>

<style scoped>
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  min-width: 36px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  cursor: pointer;
  padding: 6px 0;
  touch-action: none;
  user-select: none;
}

.progress-track {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  position: relative;
  transition: height 0.15s;
}

.progress-bar:hover .progress-track {
  height: 6px;
}

.progress-buffered {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-accent);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-fill.no-transition {
  transition: none;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: var(--color-text);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.15s;
}

.progress-bar:hover .progress-thumb,
.progress-thumb.active {
  opacity: 1;
}
</style>
