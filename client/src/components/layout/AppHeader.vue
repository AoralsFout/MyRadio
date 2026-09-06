<script setup lang="ts">
import SearchBar from '@/components/library/SearchBar.vue'
import { usePlayerStore } from '@/stores/player.store'
import { onUnmounted, ref, watch } from 'vue'

const player = usePlayerStore()
const isBreathing = ref(player.isPlaying)
let breathingStopTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => player.isPlaying,
  (playing) => {
    if (breathingStopTimer) {
      clearTimeout(breathingStopTimer)
      breathingStopTimer = null
    }

    if (playing) {
      isBreathing.value = true
      return
    }

    breathingStopTimer = setTimeout(() => {
      isBreathing.value = false
      breathingStopTimer = null
    }, 1200)
  },
)

onUnmounted(() => {
  if (breathingStopTimer) clearTimeout(breathingStopTimer)
})
</script>

<template>
  <header class="app-header">
    <div class="header-brand">
      <span
        class="logo"
        :class="{ playing: player.isPlaying, breathing: isBreathing }"
        aria-hidden="true"
      ><i /></span>
      <div>
        <span class="header-title">MYRADIO</span>
        <span class="header-subtitle">私藏音乐电台</span>
      </div>
    </div>
    <div class="header-search">
      <SearchBar />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(20px, 4vw, 64px);
  height: var(--header-height);
  background: rgba(8, 11, 19, 0.78);
  border-bottom: 1px solid var(--color-border-soft);
  backdrop-filter: blur(18px);
  z-index: 100;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo {
  position: relative;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  transition: border-color 1.15s ease, box-shadow 1.15s ease;
}

.logo::before,
.logo::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.logo::before {
  width: 16px;
  height: 16px;
  border: 1px solid rgba(242, 166, 90, 0.55);
}

.logo::after {
  width: 5px;
  height: 5px;
  background: var(--color-accent);
}

.logo i {
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1.15s ease;
}

.logo.playing {
  border-color: var(--color-accent-hover);
  box-shadow: 0 0 13px 1px rgba(242, 166, 90, 0.18);
}

.logo.playing i {
  opacity: 1;
}

.logo i::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(242, 166, 90, 0.28);
  border-radius: 50%;
}

.logo.breathing i::before {
  animation: logoBreatheRing 2.4s ease-in-out infinite;
}

@keyframes logoBreatheRing {
  0%, 100% {
    transform: scale(1);
    border-color: rgba(242, 166, 90, 0.18);
    box-shadow: 0 0 5px rgba(242, 166, 90, 0.08);
  }
  50% {
    transform: scale(1.18);
    border-color: rgba(242, 166, 90, 0.55);
    box-shadow: 0 0 18px 2px rgba(242, 166, 90, 0.26);
  }
}

.header-title {
  display: block;
  font: 800 14px/1 var(--font-display);
  letter-spacing: 0.14em;
  color: var(--color-text);
}

.header-subtitle {
  display: block;
  margin-top: 5px;
  font: 500 9px/1 var(--font-mono);
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
}

.header-search {
  flex: 1;
  max-width: 390px;
}

@media (max-width: 640px) {
  .app-header {
    padding: 0 16px;
    gap: 14px;
  }
  .header-search {
    max-width: none;
  }
}

@media (max-width: 460px) {
  .header-brand > div { display: none; }
}
</style>
