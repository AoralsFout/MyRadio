import type { SongMetadata } from './song.js'

export interface CacheManifest {
  version: 1
  createdAt: string
  musicDir: string
  fileCount: number
  songs: SongMetadata[]
}
