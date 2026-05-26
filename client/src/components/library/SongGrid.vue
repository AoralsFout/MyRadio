<script setup lang="ts">
import { computed } from 'vue'
import { useLibraryStore } from '@/stores/library.store'
import SongCard from './SongCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Spinner from '@/components/common/Spinner.vue'

const library = useLibraryStore()

const songs = computed(() => library.displaySongs)
</script>

<template>
  <div class="song-grid-wrap">
    <Spinner v-if="library.isLoading" />
    <EmptyState
      v-else-if="songs.length === 0"
      :message="library.searchQuery ? '没有找到匹配的歌曲' : '歌曲库为空'"
    />
    <div v-else class="song-grid">
      <SongCard
        v-for="song in songs"
        :key="song.id"
        :song="song"
      />
    </div>
  </div>
</template>

<style scoped>
.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

@media (max-width: 640px) {
  .song-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
}
</style>
