import fs from 'node:fs'
import type { Request, Response } from 'express'
import type { SongMetadata } from '../types/song.js'

export function streamSong(req: Request, res: Response, song: SongMetadata): void {
  const fileSize = song.fileSize
  const range = req.headers.range

  if (!range) {
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': fileSize,
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(song.filePath).pipe(res)
    return
  }

  const parts = range.replace(/bytes=/, '').split('-')
  const start = parseInt(parts[0], 10)
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

  if (start >= fileSize || end >= fileSize || start > end) {
    res.writeHead(416, {
      'Content-Range': `bytes */${fileSize}`,
    })
    res.end()
    return
  }

  const chunkSize = end - start + 1

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'audio/mpeg',
  })

  fs.createReadStream(song.filePath, { start, end }).pipe(res)
}
