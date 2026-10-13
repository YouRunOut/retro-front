import type Track from '../types/track'
import { request } from './http'
import { useState } from '../core/store'

export interface TagInfo {
  id: number
  name: string
  trackCount?: number
  color?: string
}

export async function fetchTags(): Promise<TagInfo[]> {
  try {
    const data = await request<TagInfo[]>('/api/v1/tags')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function fetchTracksByTag(tags: string[], limit = 10): Promise<Track[]> {
  try {
    const sessionId = useState.sessionId
    const tagsParam = tags.map(t => encodeURIComponent(t)).join(',')
    const data = await request<Track[]>(
      `/api/v1/tracks/by-tag?tags=${tagsParam}&limit=${limit}&sessionId=${sessionId}`
    )
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
