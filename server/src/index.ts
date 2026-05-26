import { createApp } from './app.js'
import { config } from './config.js'
import { CacheService } from './services/cache.service.js'
import { ScannerService } from './services/scanner.service.js'

const songs = new Map<string, import('./types/song.js').SongMetadata>()

async function bootstrap() {
  const cacheService = new CacheService(config.cacheFile)
  const scannerService = new ScannerService(config.musicDir)

  const valid = await cacheService.isValid()
  let songList: import('./types/song.js').SongMetadata[]

  if (valid) {
    console.log('[bootstrap] Cache valid, loading from disk...')
    songList = cacheService.read()
  } else {
    console.log('[bootstrap] Cache stale or missing, scanning...')
    songList = await scannerService.scan()
    cacheService.write(songList)
  }

  for (const song of songList) {
    songs.set(song.id, song)
  }

  console.log(`[bootstrap] ${songs.size} songs loaded`)

  const app = createApp()

  app.locals.songs = songs
  app.locals.cacheService = cacheService
  app.locals.scannerService = scannerService

  app.listen(config.port, () => {
    console.log(`[server] Listening on http://localhost:${config.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('[bootstrap] Fatal error:', err)
  process.exit(1)
})
