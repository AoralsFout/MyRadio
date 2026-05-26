<script setup lang="ts">
import { computed } from 'vue'
import type { SongMetadata } from '@/types'
import { usePlayerStore } from '@/stores/player.store'
import { useLibraryStore } from '@/stores/library.store'
import { coverUrl } from '@/api/client'

const props = defineProps<{
  song: SongMetadata
}>()

const player = usePlayerStore()
const library = useLibraryStore()

const isActive = computed(() => player.currentSong?.id === props.song.id)
const isCurrentlyPlaying = computed(() => isActive.value && player.isPlaying)

const coverSrc = coverUrl(props.song.id)

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function onClick() {
  if (isActive.value) {
    player.togglePlay()
  } else {
    const songs = library.displaySongs
    const idx = songs.findIndex((s) => s.id === props.song.id)
    player.playQueue(songs, idx >= 0 ? idx : 0)
  }
}
</script>

<template>
  <div
    class="song-card"
    :class="{ active: isActive }"
    @click="onClick"
  >
    <div class="card-cover">
      <img
        v-if="song.hasCover"
        :src="coverSrc"
        class="cover-img"
        loading="lazy"
        alt=""
      />
      <svg
        v-else
        class="cover-img placeholder"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      <div class="card-overlay" :class="{ playing: isCurrentlyPlaying }">
        <svg v-if="!isCurrentlyPlaying" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <div v-else class="playing-indicator">
          <span class="bar"/><span class="bar"/><span class="bar"/>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-title" :title="song.title">{{ song.title }}</div>
      <div class="card-artist" :title="song.artist">{{ song.artist }}</div>
      <span class="card-duration">{{ formatDuration(song.duration) }}</span>
    </div>
  </div>
</template>

<style scoped>
.song-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  animation: fadeIn 0.3s ease;
}

.song-card:hover {
  background: var(--color-surface-hover);
  box-shadow: var(--shadow-md);
}

.song-card.active {
  box-shadow: 0 0 0 2px var(--color-accent);
}

.card-cover {
  position: relative;
  aspect-ratio: 1;
  background: var(--color-bg);
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-img.placeholder {
  padding: 20%;
  color: var(--color-text-muted);
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.song-card:hover .card-overlay {
  opacity: 1;
}

.card-overlay.playing {
  opacity: 1;
  background: rgba(99, 102, 241, 0.3);
}

.playing-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
}

.playing-indicator .bar {
  width: 3px;
  background: #fff;
  border-radius: 2px;
  animation: pulse 1s ease infinite;
}

.playing-indicator .bar:nth-child(1) { height: 12px; }
.playing-indicator .bar:nth-child(2) { height: 24px; animation-delay: 0.2s; }
.playing-indicator .bar:nth-child(3) { height: 16px; animation-delay: 0.4s; }

.card-body {
  padding: 10px 12px;
  position: relative;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.card-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 36px;
}

.card-duration {
  position: absolute;
  bottom: 10px;
  right: 12px;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

@media (max-width: 480px) {
  .card-body {
    padding: 8px 10px;
  }
  .card-title {
    font-size: 12px;
  }
  .card-artist {
    font-size: 11px;
  }
}
</style>
