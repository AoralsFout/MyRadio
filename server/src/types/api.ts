import type { SongMetadata } from './song.js'

export interface SongsResponse {
  total: number
  songs: SongMetadata[]
}

export interface StatusResponse {
  status: 'ok'
  cacheAge: number
  songCount: number
  musicDir: string
}

export interface ErrorResponse {
  error: string
  message: string
}
