import type Track from '../types/track'
import { request } from './http'
import { useErrorModal } from '../composables/useErrorModal'

interface TracksResponse {
  tracks: Track[]
}

export async function fetchTracks(): Promise<Track[]> {
  const { showError } = useErrorModal()

  try {
    const data = await request<TracksResponse>('/api/v1/tracks')

    // на всякий случай проверяем, что tracks — массив
    if (!Array.isArray(data)) {
      showError({
        title: 'Failed to fetch tracks',
        message: 'Tracks is not an array, fallback to empty array',
        details: '!Array.isArray(data)',
      })
      return []
    }

    return data

  } catch (err: any) {
    showError({
      title: 'Failed to fetch tracks',
      message: 'Не удалось загрузить список треков.',
      details: err?.message || String(err),
    })
    return []
  }
}
