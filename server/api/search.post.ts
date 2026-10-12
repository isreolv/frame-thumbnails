import type { Video } from '../../shared/types'
interface SearchItem { id: { videoId: string }; snippet: { title: string; channelTitle: string; publishedAt: string; thumbnails: Record<string, { url: string }> } }
interface Detail { id: string; statistics?: { viewCount?: string }; contentDetails?: { duration?: string } }
export default defineEventHandler(async event => {
  const origin = getHeader(event, 'origin')
  if (origin && origin !== getRequestURL(event).origin) throw createError({ statusCode: 403, statusMessage: 'Cross-origin requests are not allowed.' })
  const body = await readBody(event)
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  if (!query || query.length > 200) throw createError({ statusCode: 400, statusMessage: 'Enter a search query between 1 and 200 characters.' })
  const key = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : useRuntimeConfig(event).youtubeApiKey
  if (!key) throw createError({ statusCode: 400, statusMessage: 'Connect a YouTube API key to search live results.' })
  if (key.length > 256) throw createError({ statusCode: 400, statusMessage: 'Invalid API key.' })
  const region = typeof body.region === 'string' && /^[A-Z]{2}$/.test(body.region) ? body.region : 'US'
  try {
    const search = await $fetch<{ items: SearchItem[] }>('https://www.googleapis.com/youtube/v3/search', { query: { key, q: query, part: 'snippet', type: 'video', maxResults: 12, regionCode: region, safeSearch: 'moderate' }, timeout: 15000 })
    const items = search.items || []
    let details: Detail[] = []
    if (items.length) {
      const response = await $fetch<{ items: Detail[] }>('https://www.googleapis.com/youtube/v3/videos', { query: { key, id: items.map(i => i.id.videoId).join(','), part: 'statistics,contentDetails' }, timeout: 15000 })
      details = response.items || []
    }
    const videos: Video[] = items.map(item => {
      const detail = details.find(d => d.id === item.id.videoId)
      const duration = detail?.contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      const seconds = duration ? Number(duration[1] || 0) * 3600 + Number(duration[2] || 0) * 60 + Number(duration[3] || 0) : 0
      const time = seconds ? (seconds >= 3600 ? `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}` : String(Math.floor(seconds / 60))) + ':' + String(seconds % 60).padStart(2, '0') : ''
      return { id: item.id.videoId, title: item.snippet.title, channel: item.snippet.channelTitle, thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '', views: detail?.statistics?.viewCount ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(detail.statistics.viewCount)) + ' views' : '', published: item.snippet.publishedAt.slice(0, 10), duration: time }
    })
    setHeader(event, 'Cache-Control', 'no-store')
    return { videos }
  } catch (error: any) {
    const reason = error?.data?.error?.errors?.[0]?.reason
    const message = ['quotaExceeded', 'dailyLimitExceeded'].includes(reason) ? 'YouTube quota reached. Try again after the quota resets.' : ['keyInvalid', 'accessNotConfigured', 'ipRefererBlocked', 'forbidden'].includes(reason) || error?.status === 403 || error?.status === 400 ? 'The key was rejected. Enable YouTube Data API v3 and check the key’s restrictions.' : 'YouTube could not be reached. Please try again.'
    // Never forward provider errors: they can include the credential-bearing URL.
    throw createError({ statusCode: 502, statusMessage: message })
  }
})
