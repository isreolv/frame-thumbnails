<script setup lang="ts">
import { Aperture, LayoutGrid, Search, Smartphone, Columns2, Upload, Plus, X, Check, ChevronDown, Monitor, Moon, Sun, Settings2, ArrowUpRight, ImagePlus, Menu, Home, Compass, PlaySquare, Clock, ListVideo, SlidersHorizontal, RotateCcw, Link, LoaderCircle } from '@lucide/vue'
import type { Video, Variant } from '../shared/types'
const mode = ref('home')
const size = ref('comfortable')
const dark = ref(false)
const hideLabels = ref(false)
const hideBorders = ref(false)
const query = ref('acoustic rock covers')
const title = ref('John Lennon — Imagine | Acoustic rock cover')
const channel = ref('Talles Cattarin')
const region = ref('US')
const placement = ref(2)
const variants = ref<Variant[]>([{ id: 'demo-a', name: 'The acoustic session', src: 'demo:1', width: 1280, height: 720 }, { id: 'demo-b', name: 'The rock version', src: 'demo:2', width: 1280, height: 720 }])
const activeId = ref('demo-a')
const selected = computed(() => variants.value.find(v => v.id === activeId.value))
const apiKey = ref('')
const apiKeyDraft = ref('')
const preferencesReady = ref(false)
const storageAvailable = ref(true)
const preferenceKeys = { channel: 'frame.channel', region: 'frame.region', apiKey: 'frame.youtubeApiKey' }
function storePreference(key: string, value: string) {
 try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key) }
 catch { storageAvailable.value = false }
}
watch(channel, value => { if (preferencesReady.value) storePreference(preferenceKeys.channel, value) })
watch(region, value => { if (preferencesReady.value) storePreference(preferenceKeys.region, value) })
function connectYouTube() {
 if (apiKeyDraft.value.trim()) { apiKey.value = apiKeyDraft.value.trim(); storePreference(preferenceKeys.apiKey, apiKey.value) }
 apiKeyDraft.value = ''
 showSettings.value = false
 search()
}
function forgetApiKey() { apiKey.value = ''; apiKeyDraft.value = ''; storePreference(preferenceKeys.apiKey, '') }

const serverConfigured = ref(false)
const showSettings = ref(false)
const modal = ref<HTMLElement>()
let previousFocus: HTMLElement | null = null
watch(showSettings, async open => {
 if (open) { apiKeyDraft.value = ''; previousFocus = document.activeElement as HTMLElement; await nextTick(); modal.value?.querySelector<HTMLInputElement>('input')?.focus() }
 else { previousFocus?.focus() }
})
function trapFocus(event: KeyboardEvent) {
 if (event.key !== 'Tab') return
 const controls = modal.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href]')
 if (!controls?.length) return
 const first = controls[0], last = controls[controls.length - 1]
 if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
 else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
const loading = ref(false)
const uploadBusy = ref(false)
const error = ref('')
const uploadError = ref('')
const live = ref(false)
const lastQuery = ref('')
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const comparisons = ref<string[]>(['demo-a', 'demo-b'])
const demos: Video[] = [
 { id: '1', title: 'The Ramones — The KKK Took My Baby Away | Acoustic cover', channel: 'Unplugged Sessions', thumbnail: '/demo/acoustic.jpg', views: '84K views', published: '3 weeks ago', duration: '3:12' },
 { id: '2', title: 'L’Amour Toujours — reimagined as a rock cover', channel: 'The Cover Room', thumbnail: '/demo/electric.jpg', views: '218K views', published: '1 month ago', duration: '4:04' },
 { id: '3', title: 'A week of making music in my home studio', channel: 'Studio Diaries', thumbnail: '/demo/studio.jpg', views: '42K views', published: '2 weeks ago', duration: '14:06' },
 { id: '4', title: 'Imagine — one guitar, one voice, one take', channel: 'Late Night Acoustic', thumbnail: '/demo/session.jpg', views: '96K views', published: '6 days ago', duration: '3:48' },
 { id: '5', title: 'Turning a pop song into a rock anthem | Behind the cover', channel: 'The Cover Room', thumbnail: '/demo/microphone.jpg', views: '37K views', published: '2 weeks ago', duration: '10:54' },
 { id: '6', title: 'Sunday unplugged — acoustic rock favorites', channel: 'Unplugged Sessions', thumbnail: '/demo/records.jpg', views: '152K views', published: '1 month ago', duration: '18:17' },
]
const results = ref<Video[]>(demos)
function proposed(variant: Variant): Video { return { id: variant.id, title: title.value || 'Your video title', channel: channel.value || 'Your channel', thumbnail: variant.src, views: '12K views', published: '2 days ago', duration: '12:34', proposed: true } }
const feed = computed(() => { const list = [...results.value]; if (selected.value) list.splice(Math.min(placement.value - 1, list.length), 0, proposed(selected.value)); return list })
const compared = computed(() => variants.value.filter(v => comparisons.value.includes(v.id)))
function toggleCompare(id: string) { comparisons.value = comparisons.value.includes(id) ? comparisons.value.filter(v => v !== id) : [...comparisons.value, id] }
async function upload(files: FileList | File[] | null) {
 if (!files) return
 uploadBusy.value = true; uploadError.value = ''
 for (const file of Array.from(files)) {
  if (variants.value.length >= 12) { uploadError.value = 'You can compare up to 12 thumbnails. Remove one to add another.'; break }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { uploadError.value = 'Use JPG, PNG, or WebP images.'; continue }
  if (file.size > 10 * 1024 * 1024) { uploadError.value = 'Each image must be smaller than 10 MB.'; continue }
  const src = URL.createObjectURL(file)
  try {
   const image = new Image(); image.src = src; await image.decode()
   const variant = { id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), src, width: image.naturalWidth, height: image.naturalHeight }
   variants.value.push(variant); activeId.value = variant.id; comparisons.value.push(variant.id)
  } catch { URL.revokeObjectURL(src); uploadError.value = 'One of the images could not be opened.' }
 }
 uploadBusy.value = false
 if (fileInput.value) fileInput.value.value = ''
}
function drop(event: DragEvent) { dragging.value = false; upload(event.dataTransfer?.files || null) }
function remove(id: string) { const variant = variants.value.find(v => v.id === id); if (variant?.src.startsWith('blob:')) URL.revokeObjectURL(variant.src); variants.value = variants.value.filter(v => v.id !== id); comparisons.value = comparisons.value.filter(v => v !== id); if (activeId.value === id) activeId.value = variants.value[0]?.id || '' }
async function search() {
 if (!query.value.trim() || loading.value) return
 if (!apiKey.value.trim() && !serverConfigured.value) { showSettings.value = true; return }
 loading.value = true; error.value = ''
 try { const response = await $fetch<{ videos: Video[] }>('/api/search', { method: 'POST', body: { query: query.value, apiKey: apiKey.value, region: region.value } }); results.value = response.videos; live.value = true; lastQuery.value = query.value }
 catch (e: any) { error.value = e?.data?.statusMessage || 'Search failed. Please try again.' }
 finally { loading.value = false }
}
function resetDemo() { results.value = demos; live.value = false; error.value = '' }
onMounted(async () => {
 try {
  channel.value = localStorage.getItem(preferenceKeys.channel) ?? channel.value
  const savedRegion = localStorage.getItem(preferenceKeys.region)
  if (savedRegion && ['US', 'BR', 'GB', 'CA', 'IN', 'AU'].includes(savedRegion)) region.value = savedRegion
  apiKey.value = localStorage.getItem(preferenceKeys.apiKey) || ''
 } catch { storageAvailable.value = false }
 await nextTick()
 preferencesReady.value = true
 try { serverConfigured.value = (await $fetch('/api/youtube-config')).configured } catch {}
})
onBeforeUnmount(() => variants.value.forEach(v => { if (v.src.startsWith('blob:')) URL.revokeObjectURL(v.src) }))
</script>

<template>
 <div class="studio">
  <header class="app-header"><a class="brand" href="/" aria-label="Frame home"><span class="brand-mark"><Aperture :size="24" /></span>frame<span class="brand-divider"></span><span class="brand-subtitle">Thumbnail studio</span></a><div class="header-right"><span class="local-pill"><span></span> Local workspace</span><button class="button subtle" :disabled="!preferencesReady" @click="showSettings = true"><Link :size="15" />{{ apiKey || serverConfigured ? 'API connected' : 'Connect YouTube' }}<ArrowUpRight :size="14" /></button></div></header>
  <main class="workspace" :inert="!preferencesReady">
   <div class="page-heading"><div><div class="eyebrow">MAKE YOUR FIRST IMPRESSION COUNT</div><h1>A better thumbnail starts here<span>.</span></h1><p>See how your thumbnail stands out. Before you hit publish.</p></div><button class="button primary" @click="fileInput?.click()"><Plus :size="17" />Upload thumbnails</button></div>
   <input ref="fileInput" type="file" multiple accept="image/jpeg,image/png,image/webp" class="visually-hidden" aria-label="Upload thumbnail images" @change="upload(($event.target as HTMLInputElement).files)">
   <div class="studio-layout">
    <aside class="editor">
     <div class="editor-section"><div class="section-label"><Settings2 :size="15" />Video details</div><label for="video-title">Video title</label><textarea id="video-title" :disabled="!preferencesReady" v-model="title" rows="2" maxlength="100"></textarea><label for="channel-name">Channel name</label><input id="channel-name" :disabled="!preferencesReady" v-model="channel" maxlength="70"><div class="split-fields"><div><label for="position">Feed position</label><select id="position" :disabled="!preferencesReady" v-model.number="placement"><option v-for="n in 6" :key="n" :value="n">Position {{ n }}</option></select></div><div><label for="region">Search region</label><select id="region" :disabled="!preferencesReady" v-model="region"><option value="US">United States</option><option value="BR">Brazil</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="IN">India</option><option value="AU">Australia</option></select></div></div></div>
     <div class="panel-heading"><h2>Your thumbnails</h2><span class="count">{{ variants.length }}</span></div><p class="panel-description">Try a few ideas. Find the one that clicks.</p>
     <div class="variant-list"><div v-for="(variant, index) in variants" :key="variant.id" class="variant" :class="{ selected: activeId === variant.id }"><button class="variant-select" @click="activeId = variant.id"><div class="variant-preview"><DemoThumbnail v-if="variant.src.startsWith('demo:')" :variant="Number(variant.src.split(':')[1])" /><img v-else :src="variant.src" :alt="variant.name"><span class="variant-letter">{{ String.fromCharCode(65 + index) }}</span><span v-if="activeId === variant.id" class="selected-check"><Check :size="12" /></span></div><div class="variant-caption"><span>{{ variant.name }}</span><small>{{ variant.width }} × {{ variant.height }}</small></div></button><button class="remove-variant" :aria-label="`Remove ${variant.name}`" @click="remove(variant.id)"><X :size="12" /></button></div></div>
     <button class="upload-zone" :class="{ dragging }" @click="fileInput?.click()" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="drop"><ImagePlus :size="22" /><strong>{{ uploadBusy ? 'Opening images…' : 'Drop your next idea here' }}</strong><span>or <u>browse files</u></span><small>JPG, PNG, WebP · up to 10 MB</small></button><p v-if="uploadError" class="error-message" role="alert">{{ uploadError }}</p>

     <div class="tip"><span>✦</span><p><strong>Small is the real test.</strong> A great thumbnail should still tell its story on a phone.</p></div>
    </aside>
    <section class="preview-section">
     <div class="preview-controls"><div class="mode-tabs" role="tablist" aria-label="Preview layout"><button v-for="tab in [{id:'home',label:'Home feed',icon:LayoutGrid},{id:'search',label:'Search results',icon:Search},{id:'mobile',label:'Mobile',icon:Smartphone},{id:'compare',label:'Compare',icon:Columns2}]" :key="tab.id" :class="{active:mode===tab.id}" role="tab" :aria-selected="mode===tab.id" @click="mode=tab.id"><component :is="tab.icon" :size="15" />{{ tab.label }}</button></div><button class="icon-button theme-button" :aria-label="dark ? 'Use light preview' : 'Use dark preview'" @click="dark=!dark"><Sun v-if="dark" :size="17" /><Moon v-else :size="17" /></button></div>
     <div class="preview-options"><label class="toggle-label"><input v-model="hideLabels" type="checkbox"><span class="toggle-switch"></span>Hide thumbnail labels</label><label class="toggle-label"><input v-model="hideBorders" type="checkbox"><span class="toggle-switch"></span>Hide thumbnail borders</label></div>
     <div class="context-bar"><span><span class="status-dot" :class="{live}"></span>{{ live ? `Live results · ${lastQuery}` : 'Sample music feed' }}<span class="context-note">{{ live ? 'YouTube Data API' : 'Connect YouTube for real search results' }}</span></span><div class="context-actions"><button v-if="live" class="text-button" @click="resetDemo"><RotateCcw :size="12" />Demo</button><label class="size-select"><Monitor :size="13" /><select v-model="size" aria-label="Thumbnail size"><option value="comfortable">Comfortable</option><option value="compact">Compact</option><option value="large">Large</option></select><ChevronDown :size="12" /></label></div></div>
     <div v-if="error" class="error-message search-error" role="alert">{{ error }}</div>
     <div class="youtube-preview" :class="[{dark, mobile:mode==='mobile', 'search-layout':mode==='search', 'compare-layout':mode==='compare'},size]">
      <div class="youtube-header"><div class="youtube-brand"><Menu :size="19" /><span class="youtube-logo"><span><i></i></span>YouTube<sup>{{ region }}</sup></span></div><form class="youtube-search" @submit.prevent="search"><input v-model="query" placeholder="Search YouTube" aria-label="YouTube search query" maxlength="200"><button :disabled="loading" aria-label="Search YouTube"><LoaderCircle v-if="loading" :size="17" class="spin" /><Search v-else :size="18" /></button></form><span class="youtube-user">Y</span></div>
      <div v-if="mode !== 'compare'" class="youtube-body"><nav v-if="mode==='home'" class="youtube-sidebar" aria-label="Preview navigation"><div><Home :size="18" /><span>Home</span></div><div><Compass :size="18" /><span>Explore</span></div><div><PlaySquare :size="18" /><span>Subscriptions</span></div><div><ListVideo :size="18" /><span>Library</span></div></nav><div class="feed-content"><div v-if="mode==='home' || mode==='mobile'" class="category-chips"><span class="chosen">All</span><span>Acoustic covers</span><span>Rock</span><span>Music vlogs</span><span>Home studio</span><span>Recently uploaded</span></div><div v-else class="search-summary"><span>{{ live ? `Results for “${lastQuery}”` : 'Sample search results' }}</span><span><SlidersHorizontal :size="13" />Filters</span></div><div v-if="loading" class="loading-feed"><LoaderCircle :size="24" class="spin" />Searching YouTube…</div><div v-else class="video-grid"><VideoCard v-for="video in feed" :key="video.id" :video="video" :hide-label="hideLabels" :hide-border="hideBorders" /></div><div v-if="live && results.length === 0" class="empty-results">No videos matched this query. Try a different search.</div></div></div>
      <div v-else class="comparison-content"><div class="comparison-header"><div><h2>Every size. Every detail.</h2><p>Choose variants to compare at actual display widths.</p></div></div><div class="comparison-picker"><button v-for="(variant,index) in variants" :key="variant.id" :class="{active:comparisons.includes(variant.id)}" @click="toggleCompare(variant.id)"><Check v-if="comparisons.includes(variant.id)" :size="13" />{{ String.fromCharCode(65+index) }} · {{ variant.name }}</button></div><div v-if="!compared.length" class="empty-results">Select a thumbnail above to begin comparing.</div><div class="comparison-scroll"><div v-for="width in [360,240,168]" :key="width" class="comparison-row"><div class="comparison-size">{{ width }} px <span>{{ width===360 ? 'Desktop feed' : width===240 ? 'Compact feed' : 'Suggested video' }}</span></div><div class="comparison-cards"><div v-for="variant in compared" :key="variant.id" :style="{width:width+'px',flex:'0 0 '+width+'px'}"><VideoCard :video="proposed(variant)" :hide-label="hideLabels" :hide-border="hideBorders" /><span class="comparison-name">{{ variant.name }}</span></div></div></div></div></div>
     </div>
     <div class="preview-footer"><span><span class="status-dot"></span>{{ mode==='compare' ? 'Actual pixel widths' : 'YouTube-style preview' }}<span class="footer-divider">·</span>Images crop to 16:9</span></div>
     <div class="below-preview"><span class="tiny-mark"><Aperture :size="16" /></span><span>Good thumbnails earn attention. Great ones set the right expectation.</span></div>
    </section>
   </div>
  </main>
  <div v-if="showSettings" class="modal-backdrop" @click.self="showSettings=false" @keydown.esc="showSettings=false"><section ref="modal" class="settings-modal" @keydown="trapFocus" role="dialog" aria-modal="true" aria-labelledby="connection-title"><button class="modal-close icon-button" aria-label="Close connection settings" @click="showSettings=false"><X :size="20" /></button><div class="connection-icon"><Link :size="24" /></div><h2 id="connection-title">Bring the real feed into focus.</h2><p>Connect YouTube to compare your ideas with the videos people see when they search.</p><form @submit.prevent="connectYouTube"><label for="api-key">YouTube Data API key</label><input id="api-key" v-model="apiKeyDraft" type="password" autocomplete="off" :placeholder="apiKey ? 'Saved key •••••••• — enter to replace' : 'Paste your Google Cloud API key'"><p class="key-note">{{ !storageAvailable ? 'Browser storage is unavailable. Your key works for this session only.' : apiKey ? 'A key is saved in this browser. Leave this field blank to keep using it.' : serverConfigured ? 'A server key is configured. Enter a key only to override it.' : 'Your key will be saved in this browser and sent through this app’s server.' }}</p><button v-if="apiKey" type="button" class="forget-key text-button" @click="forgetApiKey">Forget saved key</button><label class="setup-step">1. Enable <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer">YouTube Data API v3 <ArrowUpRight :size="12" /></a></label><label class="setup-step">2. Create an API key in Google Cloud Credentials.</label><label class="setup-step">3. Restrict it to YouTube Data API v3.</label><div class="modal-note">Search results may differ from your personalized YouTube feed. Each search uses your Google Cloud quota.</div><button class="button primary full-width" :disabled="!apiKeyDraft.trim() && !apiKey && !serverConfigured">Connect & search <ArrowUpRight :size="15" /></button></form></section></div>
 </div>
</template>
