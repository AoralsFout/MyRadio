import { Router } from 'express'
import type { SongMetadata } from '../types/song.js'
import type { CacheService } from '../services/cache.service.js'
import type { ScannerService } from '../services/scanner.service.js'

export function createSongsRouter() {
  const router = Router()

  router.get('/', (req, res) => {
    const songs: Map<string, SongMetadata> = req.app.locals.songs
    let list = Array.from(songs.values())

    const search = req.query.search as string | undefined
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q),
      )
    }

    const sort = (req.query.sort as string) || 'title'
    const order = (req.query.order as string) || 'asc'
    const multiplier = order === 'desc' ? -1 : 1

    list.sort((a, b) => {
      let cmp = 0
      switch (sort) {
        case 'artist':
          cmp = a.artist.localeCompare(b.artist, 'zh-CN')
          break
        case 'duration':
          cmp = a.duration - b.duration
          break
        case 'title':
        default:
          cmp = a.title.localeCompare(b.title, 'zh-CN')
          break
      }
      return cmp * multiplier
    })

    res.json({ total: list.length, songs: list })
  })

  router.get('/:id', (req, res) => {
    const songs: Map<string, SongMetadata> = req.app.locals.songs
    const song = songs.get(req.params.id)
    if (!song) {
      res.status(404).json({ error: 'Not Found', message: 'Song not found' })
      return
    }
    res.json(song)
  })

  router.post('/rescan', async (req, res) => {
    const scanner: ScannerService = req.app.locals.scannerService
    const cache: CacheService = req.app.locals.cacheService
    const songs: Map<string, SongMetadata> = req.app.locals.songs

    try {
      const list = await scanner.scan()
      await cache.write(list)
      songs.clear()
      for (const song of list) {
        songs.set(song.id, song)
      }
      res.json({ total: list.length, message: 'Rescan complete' })
    } catch (err) {
      res
        .status(500)
        .json({ error: 'Rescan Failed', message: (err as Error).message })
    }
  })

  return router
}
