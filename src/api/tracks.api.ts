import type Track from '../types/track'
import { request } from './http'

interface TracksResponse {
  tracks: Track[]
}

export async function fetchTracks(): Promise<Track[]> {

  try {
    // используем относительный путь, чтобы сработал прокси Vite
    const data = await request<TracksResponse>('/api/v1/tracks')

    // на всякий случай проверяем, что tracks — массив
    if (!Array.isArray(data)) {
      console.warn('Tracks is not an array, fallback to empty array')
      return []
    }

    return data
  } catch (err) {
    console.error('fetchTracks error:', err)
    return [] // возвращаем пустой массив вместо падения
  }
}
