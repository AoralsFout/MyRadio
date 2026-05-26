import { ref, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player.store'

export function useAudioAnalyzer(barCount = 64) {
  const frequencyData = ref<Uint8Array>(new Uint8Array(barCount))
  let audioCtx: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaElementAudioSourceNode | null = null
  let animId = 0
  let initialized = false

  function init() {
    if (initialized) return
    const player = usePlayerStore()
    const audio = player.getAudioElement()
    if (!audio) return

    audioCtx = new AudioContext()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.45

    source = audioCtx.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(audioCtx.destination)

    initialized = true
    tick()
  }

  function tick() {
    if (!analyser) return
    const buffer = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(buffer)
    // Take only lower frequencies for visual appeal and down-sample to barCount
    const step = buffer.length / barCount
    const data = new Uint8Array(barCount)
    for (let i = 0; i < barCount; i++) {
      data[i] = buffer[Math.floor(i * step)]
    }
    frequencyData.value = data
    animId = requestAnimationFrame(tick)
  }

  function destroy() {
    cancelAnimationFrame(animId)
    if (source) {
      source.disconnect()
      source = null
    }
    if (analyser) {
      analyser.disconnect()
      analyser = null
    }
    if (audioCtx) {
      audioCtx.close()
      audioCtx = null
    }
    initialized = false
  }

  onUnmounted(destroy)

  return { frequencyData, init, destroy }
}
