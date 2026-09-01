<script setup lang="ts">
import { computed } from 'vue'
import type { SongMetadata } from '@/types'
import { usePlayerStore } from '@/stores/player.store'
import { useLibraryStore } from '@/stores/library.store'
import { coverUrl } from '@/api/client'

const props = defineProps<{
  song: SongMetadata
  index: number
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
  <button
    type="button"
    class="song-card"
    :class="{ active: isActive }"
    @click="onClick"
  >
    <span class="track-number">{{ (index + 1).toString().padStart(2, '0') }}</span>
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
        <svg v-if="!isCurrentlyPlaying" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
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
    </div>
    <span class="card-album" :title="song.album">{{ song.album || '未知专辑' }}</span>
    <span class="card-year">{{ song.year || '—' }}</span>
    <span class="card-duration">{{ formatDuration(song.duration) }}</span>
  </button>
</template>

<style scoped>
.song-card {
  width: 100%;
  display: grid;
  grid-template-columns: 42px 54px minmax(160px, 1.6fr) minmax(120px, 0.9fr) 64px 64px;
  align-items: center;
  gap: 14px;
  min-height: 70px;
  padding: 8px 14px 8px 4px;
  border-bottom: 1px solid var(--color-border-soft);
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, border-color 0.2s;
  animation: fadeIn 0.3s ease;
}

.song-card:hover {
  background: rgba(255, 255, 255, 0.045);
  transform: translateX(4px);
}

.song-card.active {
  background: linear-gradient(90deg, rgba(242, 166, 90, 0.13), rgba(242, 166, 90, 0.025));
  border-color: rgba(242, 166, 90, 0.3);
}

.track-number {
  color: var(--color-text-muted);
  font: 500 11px/1 var(--font-mono);
  text-align: center;
}

.song-card.active .track-number,
.song-card.active .card-title {
  color: var(--color-accent);
}

.card-cover {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 8px;
  background: var(--color-bg);
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-img.placeholder {
  padding: 28%;
  color: var(--color-text-muted);
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 7, 12, 0.58);
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.song-card:hover .card-overlay {
  opacity: 1;
}

.card-overlay.playing {
  opacity: 1;
  background: rgba(242, 166, 90, 0.42);
}

.playing-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 24px;
}

.playing-indicator .bar {
  width: 2px;
  background: #fff;
  border-radius: 2px;
  animation: pulse 1s ease infinite;
}

.playing-indicator .bar:nth-child(1) { height: 9px; }
.playing-indicator .bar:nth-child(2) { height: 17px; animation-delay: 0.2s; }
.playing-indicator .bar:nth-child(3) { height: 12px; animation-delay: 0.4s; }

.card-body {
  min-width: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.card-artist {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-album,
.card-year,
.card-duration {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-year,
.card-duration {
  font-family: var(--font-mono);
  text-align: right;
}

@media (max-width: 760px) {
  .song-card { grid-template-columns: 30px 48px minmax(0, 1fr) 48px; gap: 10px; min-height: 64px; padding-right: 8px; }
  .card-cover { width: 48px; height: 48px; }
  .card-album, .card-year { display: none; }
}

@media (max-width: 420px) {
  .song-card { grid-template-columns: 44px minmax(0, 1fr) 44px; }
  .track-number { display: none; }
}
</style>
