<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useAudioAnalyzer } from '@/composables/useAudioAnalyzer'
import { usePlayerStore } from '@/stores/player.store'

const POINT_COUNT = 72
const DECAY_EPSILON = 0.002
const SPECTRUM_INSET = 0

const { frequencyData, init } = useAudioAnalyzer(POINT_COUNT)
const player = usePlayerStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const levels = new Float32Array(POINT_COUNT)
let animationId = 0
let resizeObserver: ResizeObserver | null = null
let width = 0
let height = 0
let reducedMotion = false

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = rect.width
  height = rect.height
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  const ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function updateLevels() {
  const data = frequencyData.value
  let hasSignal = false

  for (let i = 0; i < POINT_COUNT; i++) {
    const normalized = Math.max(0, data[i] / 255 - 0.025)
    const shaped = Math.min(1, Math.pow(normalized * 1.85, 0.92))
    const target = player.isPlaying && !reducedMotion ? shaped : 0
    const easing = target > levels[i] ? 0.32 : 0.085
    levels[i] += (target - levels[i]) * easing
    if (levels[i] > DECAY_EPSILON) hasSignal = true
  }

  return hasSignal
}

function traceSpectrum(
  ctx: CanvasRenderingContext2D,
  baseline: number,
  amplitude: number,
) {
  const horizontalPadding = SPECTRUM_INSET
  const usableWidth = Math.max(1, width - horizontalPadding * 2)
  const points: Array<{ x: number; y: number }> = []

  for (let i = 0; i < POINT_COUNT; i++) {
    const x = horizontalPadding + (i / (POINT_COUNT - 1)) * usableWidth
    const edgeFade = 0.1 + 0.9 * Math.pow(
      Math.sin((i / (POINT_COUNT - 1)) * Math.PI),
      0.42,
    )
    const frequencyTilt = 1 - (i / POINT_COUNT) * 0.18
    const y = baseline - levels[i] * amplitude * edgeFade * frequencyTilt
    points.push({ x, y })
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    ctx.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2,
    )
  }
  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
}

function drawTuner(ctx: CanvasRenderingContext2D, baseline: number) {
  const padding = SPECTRUM_INSET
  const usableWidth = width - padding * 2

  ctx.save()
  ctx.strokeStyle = 'rgba(141, 157, 255, 0.13)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, baseline + 0.5)
  ctx.lineTo(width - padding, baseline + 0.5)
  ctx.stroke()

  for (let i = 0; i <= 32; i++) {
    const x = padding + (i / 32) * usableWidth
    const major = i % 4 === 0
    ctx.strokeStyle = major
      ? 'rgba(242, 166, 90, 0.2)'
      : 'rgba(141, 157, 255, 0.11)'
    ctx.beginPath()
    ctx.moveTo(x + 0.5, baseline - (major ? 10 : 8))
    ctx.lineTo(x + 0.5, baseline - (major ? 4 : 6))
    ctx.stroke()
  }
  ctx.restore()
}

function drawFrame() {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx || width <= 0 || height <= 0) return

  ctx.clearRect(0, 0, width, height)
  const baseline = height - 0.5
  const amplitude = Math.max(18, height - 8)
  const hasSignal = updateLevels()

  drawTuner(ctx, baseline)

  traceSpectrum(ctx, baseline, amplitude)
  const fill = ctx.createLinearGradient(0, 4, 0, baseline)
  fill.addColorStop(0, 'rgba(141, 157, 255, 0.02)')
  fill.addColorStop(0.62, 'rgba(141, 157, 255, 0.07)')
  fill.addColorStop(1, 'rgba(242, 166, 90, 0.12)')
  ctx.lineTo(width - SPECTRUM_INSET, baseline)
  ctx.lineTo(SPECTRUM_INSET, baseline)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()

  traceSpectrum(ctx, baseline, amplitude)
  ctx.save()
  ctx.strokeStyle = 'rgba(242, 166, 90, 0.13)'
  ctx.lineWidth = 7
  ctx.shadowColor = 'rgba(242, 166, 90, 0.2)'
  ctx.shadowBlur = 14
  ctx.stroke()
  ctx.restore()

  traceSpectrum(ctx, baseline, amplitude)
  const line = ctx.createLinearGradient(0, 0, width, 0)
  line.addColorStop(0, 'rgba(141, 157, 255, 0.46)')
  line.addColorStop(0.12, 'rgba(141, 157, 255, 0.72)')
  line.addColorStop(0.5, 'rgba(255, 205, 151, 0.96)')
  line.addColorStop(0.88, 'rgba(141, 157, 255, 0.72)')
  line.addColorStop(1, 'rgba(141, 157, 255, 0.46)')
  ctx.strokeStyle = line
  ctx.lineWidth = 1.35
  ctx.stroke()

  if (player.isPlaying || hasSignal) {
    animationId = requestAnimationFrame(drawFrame)
  }
}

function startDrawing() {
  cancelAnimationFrame(animationId)
  if (player.isPlaying) init()
  drawFrame()
}

watch(() => player.isPlaying, startDrawing)

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    startDrawing()
  })
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  resizeCanvas()
  startDrawing()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" class="spectrum-canvas" aria-hidden="true" />
</template>

<style scoped>
.spectrum-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
