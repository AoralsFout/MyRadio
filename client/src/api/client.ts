import axios from 'axios'
import type { SongsResponse, SongMetadata } from '@/types'

const api = axios.create({ baseURL: '/api' })

export async function fetchSongs(
  search?: string,
  sort?: string,
  order?: string,
): Promise<SongsResponse> {
  const { data } = await api.get<SongsResponse>('/songs', {
    params: { search, sort, order },
  })
  return data
}

export async function fetchSong(id: string): Promise<SongMetadata> {
  const { data } = await api.get<SongMetadata>(`/songs/${id}`)
  return data
}

export async function rescanLibrary(): Promise<void> {
  await api.post('/songs/rescan')
}

export function streamUrl(id: string): string {
  return `/api/stream/${id}`
}

export function coverUrl(id: string): string {
  return `/api/stream/${id}/cover`
}
