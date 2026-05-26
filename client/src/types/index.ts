export interface SongMetadata {
  id: string
  filePath: string
  fileName: string
  title: string
  artist: string
  album: string
  year: number | null
  track: number | null
  genre: string | null
  duration: number
  bitrate: number | null
  sampleRate: number | null
  hasCover: boolean
  fileSize: number
  fileMtime: string
}

export interface SongsResponse {
  total: number
  songs: SongMetadata[]
}
