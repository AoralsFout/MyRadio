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
    <div class="cover-wrap">
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
  gap: 12px;
}

.cover-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg);
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover.placeholder {
  padding: 8px;
  color: var(--color-text-muted);
}

.song-info {
  overflow: hidden;
}

.song-title {
  font-size: 14px;
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
</style>
