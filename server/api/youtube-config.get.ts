export default defineEventHandler(event => ({ configured: Boolean(useRuntimeConfig(event).youtubeApiKey) }))
