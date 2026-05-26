import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchSongs } from '@/api/client'
import type { SongMetadata } from '@/types'
import { usePlayerStore } from './player.store'

export const useLibraryStore = defineStore('library', () => {
  const songs = ref<SongMetadata[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filteredSongs = computed(() => {
    if (!searchQuery.value) return songs.value
    const q = searchQuery.value.toLowerCase()
    return songs.value.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q),
    )
  })

  const displaySongs = computed(() => {
    const player = usePlayerStore()
    const list = filteredSongs.value
    if (player.queue.length === 0) return list

    const orderMap = new Map(player.queue.map((s, i) => [s.id, i]))
    return [...list].sort((a, b) => {
      const ai = orderMap.get(a.id)
      const bi = orderMap.get(b.id)
      if (ai != null && bi != null) return ai - bi
      if (ai != null) return -1
      if (bi != null) return 1
      return 0
    })
  })

  const songCount = computed(() => songs.value.length)

  function songById(id: string): SongMetadata | undefined {
    return songs.value.find((s) => s.id === id)
  }

  async function loadSongs() {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetchSongs()
      songs.value = res.songs
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      isLoading.value = false
    }
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return {
    songs,
    searchQuery,
    isLoading,
    error,
    filteredSongs,
    displaySongs,
    songCount,
    songById,
    fetchSongs: loadSongs,
    setSearch,
  }
})
