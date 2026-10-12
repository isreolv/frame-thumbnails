export interface Video {
  id: string
  title: string
  channel: string
  thumbnail: string
  views: string
  published: string
  duration: string
  proposed?: boolean
}
export interface Variant { id: string; name: string; src: string; width: number; height: number }
