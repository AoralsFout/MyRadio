import { onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player.store'

export function useKeyboard() {
  const player = usePlayerStore()

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    switch (e.code) {
      case 'Space':
        e.preventDefault()
        player.togglePlay()
        break
      case 'ArrowLeft':
        e.preventDefault()
        player.seek(player.currentTime - 5)
        break
      case 'ArrowRight':
        e.preventDefault()
        player.seek(player.currentTime + 5)
        break
      case 'ArrowUp':
        e.preventDefault()
        player.setVolume(player.volume + 0.05)
        break
      case 'ArrowDown':
        e.preventDefault()
        player.setVolume(player.volume - 0.05)
        break
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onUnmounted(() => document.removeEventListener('keydown', onKeydown))
}
