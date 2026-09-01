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
        v-for="(song, index) in songs"
        :key="song.id"
        :song="song"
        :index="index"
      />
    </div>
  </div>
</template>

<style scoped>
.song-grid {
  display: flex;
  flex-direction: column;
  padding: 8px 0 24px;
}

@media (max-width: 640px) {
  .song-grid {
    padding-top: 6px;
  }
}
</style>
