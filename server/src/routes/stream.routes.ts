import { Router } from 'express'
import fs from 'node:fs'
import { parseFile } from 'music-metadata'
import type { SongMetadata } from '../types/song.js'
import { streamSong } from '../services/stream.service.js'

export function createStreamRouter() {
  const router = Router()

  router.get('/:id', (req, res) => {
    const songs: Map<string, SongMetadata> = req.app.locals.songs
    const song = songs.get(req.params.id)
    if (!song) {
      res.status(404).json({ error: 'Not Found', message: 'Song not found' })
      return
    }
    streamSong(req, res, song)
  })

  router.get('/:id/cover', async (req, res) => {
    const songs: Map<string, SongMetadata> = req.app.locals.songs
    const song = songs.get(req.params.id)
    if (!song) {
      res.status(404).json({ error: 'Not Found', message: 'Song not found' })
      return
    }

    try {
      const meta = await parseFile(song.filePath, { skipCovers: false })
      const picture = meta.common.picture?.[0]
      if (!picture) {
        res.status(404).json({ error: 'Not Found', message: 'No cover art' })
        return
      }
      res.setHeader('Content-Type', picture.format || 'image/jpeg')
      res.setHeader('Cache-Control', 'public, max-age=86400')
      res.send(picture.data)
    } catch {
      res
        .status(500)
        .json({ error: 'Error', message: 'Failed to read cover art' })
    }
  })

  return router
}
