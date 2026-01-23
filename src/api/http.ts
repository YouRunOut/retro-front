import type Track from '../types/track'

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Retrowave Night',
    artist: 'Perturbator',
    url: '/tracks/track1.mp3',
    cover: '../../public/test-cover2.jpg',
    duration: 120,
  },
  {
    id: '2',
    title: 'Neon Highway',
    artist: 'Perturbator',
    url: '/tracks/track2.mp3',
    cover: '../../public/test-cover.png',
    duration: 180,
  }
]


export async function fetchTracks(): Promise<Track[]> {
  const res = await fetch('/api/tracks')
  if (!res.ok) throw new Error('Failed to load tracks')

//   const data = await res.json()
  return mockTracks //data.tracks 
}
