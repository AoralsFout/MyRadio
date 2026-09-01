<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player.store'
import { coverUrl } from '@/api/client'

const player = usePlayerStore()

const coverSrc = computed(() => {
  if (!player.currentSong) return ''
  return coverUrl(player.currentSong.id)
})
</script>

<template>
  <div class="now-playing" v-if="player.currentSong">
    <div class="cover-wrap" :class="{ spinning: player.isPlaying }">
      <img
        v-if="player.currentSong.hasCover"
        :src="coverSrc"
        class="cover"
        alt=""
      />
      <svg
        v-else
        class="cover placeholder"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <div class="song-info">
      <div class="now-label"><span /> NOW PLAYING</div>
      <div class="song-title">{{ player.currentSong.title }}</div>
      <div class="song-artist">{{ player.currentSong.artist }}</div>
    </div>
  </div>
  <div class="now-playing empty" v-else>
    <span class="no-song">未选择歌曲</span>
  </div>
</template>

<style scoped>
.now-playing {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cover-wrap {
  position: relative;
  width: 62px;
  height: 62px;
  padding: 5px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: repeating-radial-gradient(circle, #10131a 0 2px, #202531 3px 4px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.38);
}

.cover-wrap::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 7px;
  height: 7px;
  border: 2px solid #0a0c12;
  border-radius: 50%;
  background: var(--color-accent);
  transform: translate(-50%, -50%);
}

.cover-wrap.spinning {
  animation: recordSpin 8s linear infinite;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.cover.placeholder {
  padding: 8px;
  color: var(--color-text-muted);
}

.song-info {
  overflow: hidden;
}

.now-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  color: var(--color-accent);
  font: 600 8px/1 var(--font-mono);
  letter-spacing: 0.13em;
}

.now-label span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-accent);
}

.song-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-song {
  color: var(--color-text-muted);
  font-size: 13px;
}

@media (max-width: 540px) {
  .cover-wrap { width: 48px; height: 48px; padding: 4px; }
  .now-label { display: none; }
  .song-title { font-size: 11px; }
  .song-artist { font-size: 10px; }
}
</style>
