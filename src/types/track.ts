export default interface Track {
  id: string
  name: string
  author: string
  duration?: number
  streamUrl: string
  artworkUrl?: string
  rating?: number
  tags?: string[]
}
