import fs from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { CacheManifest } from '../types/cache.js'
import type { SongMetadata } from '../types/song.js'
import type { ScannerService } from './scanner.service.js'

export class CacheService {
  constructor(private cacheFile: string) {}

  read(): SongMetadata[] {
    const raw = readFileSync(this.cacheFile, 'utf-8')
    const manifest: CacheManifest = JSON.parse(raw)
    return manifest.songs
  }

  async write(songs: SongMetadata[]): Promise<void> {
    const manifest: CacheManifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      musicDir: '',
      fileCount: songs.length,
      songs,
    }

    const tmp = this.cacheFile + '.tmp'
    await fs.mkdir(path.dirname(this.cacheFile), { recursive: true })
    await fs.writeFile(tmp, JSON.stringify(manifest, null, 2), 'utf-8')
    await fs.rename(tmp, this.cacheFile)
    console.log(`[cache] Written ${songs.length} songs to cache`)
  }

  async isValid(): Promise<boolean> {
    try {
      await fs.access(this.cacheFile)
      const raw = await fs.readFile(this.cacheFile, 'utf-8')
      const manifest: CacheManifest = JSON.parse(raw)
      return manifest.version === 1 && manifest.songs.length > 0
    } catch {
      return false
    }
  }
}
