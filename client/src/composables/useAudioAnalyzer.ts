import { ref, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player.store'

interface SharedAudioGraph {
  audio: HTMLAudioElement
  context: AudioContext
  analyser: AnalyserNode
  source: MediaElementAudioSourceNode
}

let sharedGraph = (import.meta.hot?.data.audioGraph as SharedAudioGraph | undefined) ?? null

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    data.audioGraph = sharedGraph
  })
}

export function useAudioAnalyzer(barCount = 64) {
  const frequencyData = ref<Uint8Array>(new Uint8Array(barCount))
  let audioCtx: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let animId = 0
  let initialized = false

  function init() {
    if (initialized) {
      if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {})
      return
    }
    const player = usePlayerStore()
    const audio = player.getAudioElement()
    if (!audio) return

    if (sharedGraph?.audio === audio) {
      audioCtx = sharedGraph.context
      analyser = sharedGraph.analyser
    } else {
      audioCtx = new AudioContext()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.52

      const source = audioCtx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      sharedGraph = { audio, context: audioCtx, analyser, source }
    }

    initialized = true
    tick()
  }

  function tick() {
    if (!analyser) return
    const buffer = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(buffer)
    // Logarithmic sampling gives bass and vocal frequencies more visual space.
    const maxBin = Math.floor(buffer.length * 0.72)
    const data = new Uint8Array(barCount)
    for (let i = 0; i < barCount; i++) {
      const ratio = i / Math.max(1, barCount - 1)
      const center = Math.floor(1 + Math.pow(ratio, 1.7) * (maxBin - 1))
      const radius = Math.max(1, Math.floor(center * 0.025))
      let sum = 0
      let samples = 0
      for (let bin = Math.max(0, center - radius); bin <= Math.min(buffer.length - 1, center + radius); bin++) {
        sum += buffer[bin]
        samples++
      }
      data[i] = samples > 0 ? Math.round(sum / samples) : 0
    }
    frequencyData.value = data
    animId = requestAnimationFrame(tick)
  }

  function destroy() {
    cancelAnimationFrame(animId)
    analyser = null
    audioCtx = null
    initialized = false
  }

  onUnmounted(destroy)

  return { frequencyData, init, destroy }
}
