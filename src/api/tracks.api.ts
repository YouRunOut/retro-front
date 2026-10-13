import type Track from '../types/track'
import { request } from './http'
import { useErrorModal } from '../composables/useErrorModal'

interface TracksResponse {
  tracks: Track[]
}

export async function fetchTracks(sessionId: string, limit = 10): Promise<Track[]> {
  const { showError } = useErrorModal()

  try {
    const data = await request<TracksResponse>(`/api/v1/tracks/shuffled?limit=${limit}&sessionId=${sessionId}`)

    // на всякий случай проверяем, что tracks — массив
    if (!Array.isArray(data)) {
      showError({
        title: 'Error receiving tracks',
        message: 'Tracks is not an array, fallback to empty array',
        details: '!Array.isArray(data)',
      })
      return []
    }
    return data

  } catch (err: any) {
    showError({
      title: 'Error receiving tracks',
      message: 'Failed to load tracks list.',
      details: err?.message || String(err),
    })
    return []
  }
}
