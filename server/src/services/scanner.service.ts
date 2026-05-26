import fs from 'node:fs/promises'
import path from 'node:path'
import { v5 as uuidv5 } from 'uuid'
import { parseFile } from 'music-metadata'
import type { SongMetadata } from '../types/song.js'

const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
const BATCH_SIZE = 10

export class ScannerService {
  constructor(private musicDir: string) {}

  async scan(): Promise<SongMetadata[]> {
    const entries = await fs.readdir(this.musicDir, { withFileTypes: true })
    const files = entries
      .filter((e) => e.isFile() && /\.mp3$/i.test(e.name))
      .map((e) => path.join(this.musicDir, e.name))

    console.log(`[scanner] Found ${files.length} MP3 files`)

    const songs: SongMetadata[] = []

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((fp) => this.parseOne(fp)),
      )
      for (const song of results) {
        if (song) songs.push(song)
      }
      console.log(
        `[scanner] Progress: ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}`,
      )
    }

    songs.sort((a, b) => {
      if (a.track != null && b.track != null && a.track !== b.track)
        return a.track - b.track
      return a.title.localeCompare(b.title, 'zh-CN')
    })

    console.log(`[scanner] Scan complete: ${songs.length} valid songs`)
    return songs
  }

  private async parseOne(filePath: string): Promise<SongMetadata | null> {
    try {
      const meta = await parseFile(filePath, {
        duration: true,
        skipCovers: false,
      })
      const common = meta.common
      const format = meta.format
      const stat = await fs.stat(filePath)
      const fileName = path.basename(filePath)
      const id = uuidv5(fileName, UUID_NAMESPACE)

      const title =
        common.title ||
        this.cleanFilename(fileName.replace(/\.mp3$/i, '')) ||
        'Unknown'
      const artist = common.artist || this.extractArtistFromFilename(fileName) || 'Unknown Artist'
      const album = common.album || ''
      const year = common.year ?? null
      const track = common.track?.no ?? null
      const genre = common.genre?.[0] ?? null
      const duration = format.duration ?? 0
      const bitrate = format.bitrate ?? null
      const sampleRate = format.sampleRate ?? null
      const hasCover = !!(common.picture && common.picture.length > 0)
      const fileSize = stat.size
      const fileMtime = stat.mtime.toISOString()

      return {
        id,
        filePath,
        fileName,
        title,
        artist,
        album,
        year,
        track,
        genre,
        duration,
        bitrate,
        sampleRate,
        hasCover,
        fileSize,
        fileMtime,
      }
    } catch (err) {
      console.warn(
        `[scanner] Skipping corrupted file: ${path.basename(filePath)} — ${(err as Error).message}`,
      )
      return null
    }
  }

  private cleanFilename(name: string): string {
    return name.replace(/#[a-zA-Z0-9]{6,}.*$/, '').trim()
  }

  private extractArtistFromFilename(fileName: string): string | null {
    const name = fileName.replace(/\.mp3$/i, '')
    const match = name.match(/[-–—](.+?)(?:[#.].*)?$/)
    if (match && match[1] && match[1].length < 50) {
      return match[1].trim()
    }
    return null
  }

  async getSongCount(): Promise<number> {
    const entries = await fs.readdir(this.musicDir, { withFileTypes: true })
    return entries.filter((e) => e.isFile() && /\.mp3$/i.test(e.name)).length
  }
}
