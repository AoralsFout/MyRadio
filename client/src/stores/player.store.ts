import { defineStore } from 'pinia'
import { ref, computed, watch, markRaw } from 'vue'
import type { SongMetadata } from '@/types'
import { streamUrl } from '@/api/client'

export const usePlayerStore = defineStore('player', () => {
  const queue = ref<SongMetadata[]>([])
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref<Array<{ start: number; end: number }>>([])
  const volume = ref(0.8)
  const isMuted = ref(false)
  const isShuffled = ref(false)
  const repeatMode = ref<'off' | 'one' | 'all'>('all')

  let audio: HTMLAudioElement | null = null

  const currentSong = computed<SongMetadata | null>(() => {
    if (currentIndex.value < 0 || currentIndex.value >= queue.value.length)
      return null
    return queue.value[currentIndex.value]
  })

  const progress = computed(() => {
    if (duration.value <= 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() =>
    formatTime(currentTime.value),
  )
  const formattedDuration = computed(() => formatTime(duration.value))

  function initAudio() {
    if (audio) return
    audio = markRaw(new Audio())
    audio.preload = 'auto'
    audio.volume = volume.value

    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio!.currentTime
    })
    audio.addEventListener('progress', () => {
      if (!audio) return
      const dur = audio.duration
      if (!dur || !isFinite(dur)) return
      const ranges: Array<{ start: number; end: number }> = []
      for (let i = 0; i < audio.buffered.length; i++) {
        ranges.push({
          start: (audio.buffered.start(i) / dur) * 100,
          end: (audio.buffered.end(i) / dur) * 100,
        })
      }
      buffered.value = ranges
    })
    audio.addEventListener('loadedmetadata', () => {
      if (audio && isFinite(audio.duration)) {
        duration.value = audio.duration
      }
    })
    audio.addEventListener('play', () => {
      isPlaying.value = true
    })
    audio.addEventListener('pause', () => {
      isPlaying.value = false
    })
    audio.addEventListener('ended', () => {
      handleEnded()
    })
    audio.addEventListener('error', () => {
      console.warn('[player] Audio error, skipping...')
      handleEnded()
    })
  }

  function handleEnded() {
    if (repeatMode.value === 'one') {
      if (audio) {
        audio.currentTime = 0
        audio.play()
      }
      return
    }
    nextTrack()
  }

  function loadAndPlay(song: SongMetadata) {
    if (!audio) initAudio()
    audio!.src = streamUrl(song.id)
    audio!.load()
    audio!.play().catch((e) => console.warn('[player] Play blocked:', e))
  }

  function playSong(song: SongMetadata) {
    const idx = queue.value.findIndex((s) => s.id === song.id)
    if (idx >= 0) {
      currentIndex.value = idx
    } else if (isShuffled.value && queue.value.length > 0) {
      const insertAt = Math.floor(Math.random() * queue.value.length) + 1
      queue.value.splice(insertAt, 0, song)
      currentIndex.value = insertAt
    } else {
      queue.value.push(song)
      currentIndex.value = queue.value.length - 1
    }
    loadAndPlay(song)
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function playQueue(songs: SongMetadata[], startIndex = 0) {
    if (songs.length === 0) return

    if (isShuffled.value) {
      const start = songs[startIndex]
      const rest = shuffleArray(songs.filter((_, i) => i !== startIndex))
      queue.value = [start, ...rest]
      currentIndex.value = 0
    } else {
      queue.value = [...songs]
      currentIndex.value = startIndex
    }

    loadAndPlay(queue.value[currentIndex.value])
  }

  function togglePlay() {
    if (!audio || !currentSong.value) return
    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  function nextTrack() {
    if (queue.value.length === 0) return
    let next = currentIndex.value + 1
    if (next >= queue.value.length) {
      if (repeatMode.value === 'all') {
        next = 0
      } else {
        isPlaying.value = false
        return
      }
    }
    currentIndex.value = next
    loadAndPlay(queue.value[next])
  }

  function prevTrack() {
    if (queue.value.length === 0) return
    // If past 3 seconds, restart current track
    if (currentTime.value > 3) {
      seek(0)
      return
    }
    let prev = currentIndex.value - 1
    if (prev < 0) {
      prev = repeatMode.value === 'all' ? queue.value.length - 1 : 0
    }
    currentIndex.value = prev
    loadAndPlay(queue.value[prev])
  }

  function seek(time: number) {
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(time, duration.value || 0))
    currentTime.value = audio.currentTime
  }

  function setVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol))
    volume.value = v
    if (audio) audio.volume = v
    if (v > 0) isMuted.value = false
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audio) audio.volume = isMuted.value ? 0 : volume.value
  }

  function toggleShuffle() {
    isShuffled.value = !isShuffled.value
    if (isShuffled.value && queue.value.length > 1) {
      const current = currentSong.value
      const rest = queue.value.filter((s) => s.id !== current?.id)
      queue.value = current ? [current, ...shuffleArray(rest)] : shuffleArray(rest)
      currentIndex.value = 0
    } else if (!isShuffled.value && queue.value.length > 1) {
      const current = currentSong.value
      queue.value = [...queue.value].sort((a, b) =>
        a.title.localeCompare(b.title, 'zh-CN'),
      )
      if (current) {
        currentIndex.value = queue.value.findIndex((s) => s.id === current.id)
        if (currentIndex.value < 0) currentIndex.value = 0
      }
    }
  }

  function setRepeatMode() {
    const modes: Array<'off' | 'one' | 'all'> = ['all', 'one', 'off']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
  }

  const STORAGE_KEY = 'myradio_session'

  interface SavedSession {
    queueIds: string[]
    currentIndex: number
    currentTime: number
    volume: number
    isMuted: boolean
    repeatMode: 'off' | 'one' | 'all'
    isShuffled: boolean
  }

  function saveSession() {
    const data: SavedSession = {
      queueIds: queue.value.map((s) => s.id),
      currentIndex: currentIndex.value,
      currentTime: currentTime.value,
      volume: volume.value,
      isMuted: isMuted.value,
      repeatMode: repeatMode.value,
      isShuffled: isShuffled.value,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch { /* storage full or unavailable */ }
  }

  function loadSession(): SavedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SavedSession
    } catch { return null }
  }

  function restoreSession(librarySongs: SongMetadata[]) {
    const saved = loadSession()
    if (!saved || saved.queueIds.length === 0) return

    const songMap = new Map(librarySongs.map((s) => [s.id, s]))
    const restored: SongMetadata[] = []
    for (const id of saved.queueIds) {
      const song = songMap.get(id)
      if (song) restored.push(song)
    }
    if (restored.length === 0) return

    queue.value = restored
    currentIndex.value = Math.min(saved.currentIndex, restored.length - 1)
    volume.value = saved.volume
    isMuted.value = saved.isMuted
    repeatMode.value = saved.repeatMode
    isShuffled.value = saved.isShuffled

    if (audio) audio.volume = isMuted.value ? 0 : volume.value

    const song = queue.value[currentIndex.value]
    if (song && audio) {
      audio.src = streamUrl(song.id)
      audio.load()
      const seekTarget = Math.min(saved.currentTime, song.duration || 0)
      audio.addEventListener(
        'loadedmetadata',
        () => { audio!.currentTime = seekTarget },
        { once: true },
      )
    }
  }

  watch(volume, (v) => {
    if (audio && !isMuted.value) audio.volume = v
    saveSession()
  })

  watch(isMuted, () => saveSession())
  watch(repeatMode, () => saveSession())
  watch(isShuffled, () => saveSession())
  watch([currentIndex, () => queue.value.map((s) => s.id)], () => {
    saveSession()
  }, { deep: true })

  // Throttled time save (every 5s)
  let lastSaveTime = 0
  watch(currentTime, (t) => {
    if (t - lastSaveTime > 5) {
      lastSaveTime = t
      saveSession()
    }
  })

  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return {
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    currentSong,
    progress,
    buffered,
    formattedCurrentTime,
    formattedDuration,
    initAudio,
    playSong,
    playQueue,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
    getAudioElement: () => audio,
    saveSession,
    restoreSession,
  }
})
