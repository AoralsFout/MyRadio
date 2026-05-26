<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAudioAnalyzer } from '@/composables/useAudioAnalyzer'
import { usePlayerStore } from '@/stores/player.store'

const BAR_COUNT = 96
const HALF = BAR_COUNT / 2

const { frequencyData, init } = useAudioAnalyzer(BAR_COUNT)
const player = usePlayerStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0
let fadeLevel = 0
// Snapshot of last frame data for fade-out
let lastData = new Uint8Array(BAR_COUNT)

function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
}

function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array, level: number) {
  const barW = w / BAR_COUNT
  const centerX = w / 2
  const blurRadius = Math.max(barW * 1.8, 8)

  // Per-frame normalization: tallest bar always reaches near full height
  let maxRaw = 1
  for (let i = 0; i < HALF; i++) {
    if (data[i] > maxRaw) maxRaw = data[i]
  }

  for (let i = 0; i < HALF; i++) {
    const raw = (data[i] / maxRaw) * level
    if (raw < 0.02) continue
    const val = Math.pow(raw, 0.7)
    const barH = Math.max(10, h * 0.92 * val)

    for (const side of [-1, 1]) {
      const x = centerX + side * (i * barW + barW / 2)

      const grad = ctx.createLinearGradient(0, h, 0, h - barH)
      grad.addColorStop(0, 'rgba(224, 231, 255, 1)')
      grad.addColorStop(0.1, 'rgba(165, 180, 252, 0.8)')
      grad.addColorStop(0.4, 'rgba(129, 140, 248, 0.3)')
      grad.addColorStop(0.7, 'rgba(99, 102, 241, 0.06)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.save()
      ctx.shadowColor = 'rgba(129, 140, 248, 0.55)'
      ctx.shadowBlur = blurRadius
      ctx.fillStyle = grad
      const bw = barW * 0.55
      ctx.beginPath()
      ctx.roundRect(x - bw / 2, h - barH, bw, barH, bw / 2)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.shadowColor = 'rgba(224, 231, 255, 0.45)'
      ctx.shadowBlur = blurRadius * 1.6
      const coreGrad = ctx.createLinearGradient(0, h, 0, h - barH)
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      coreGrad.addColorStop(0.3, 'rgba(199, 210, 254, 0.4)')
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.roundRect(x - 0.75, h - barH * 0.7, 1.5, barH * 0.7, 1)
      ctx.fill()
      ctx.restore()
    }
  }
}

function drawLive() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const w = rect.width * dpr
  const h = rect.height * dpr
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }

  clearCanvas(ctx, w, h)

  const data = frequencyData.value
  lastData = new Uint8Array(data)
  fadeLevel = 1
  drawBars(ctx, w, h, data, 1)

  animId = requestAnimationFrame(drawLive)
}

function drawFade() {
  if (fadeLevel <= 0) {
    fadeLevel = 0
    return
  }

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const w = rect.width * dpr
  const h = rect.height * dpr
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }

  clearCanvas(ctx, w, h)
  fadeLevel -= 0.03
  drawBars(ctx, w, h, lastData, Math.max(0, fadeLevel))

  if (fadeLevel > 0) {
    animId = requestAnimationFrame(drawFade)
  }
}

watch(
  () => player.isPlaying,
  (playing) => {
    cancelAnimationFrame(animId)
    if (playing) {
      init()
      drawLive()
    } else if (fadeLevel > 0) {
      drawFade()
    }
  },
)

onMounted(() => {
  if (player.isPlaying) {
    init()
    drawLive()
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<template>
  <canvas ref="canvasRef" class="spectrum-canvas" />
</template>

<style scoped>
.spectrum-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
