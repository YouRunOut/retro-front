import { request } from './http'

export function rateTrack(trackId: string, rating: number) {
  return request<void>('/api/v1/tracks/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId, rating })
  })
}