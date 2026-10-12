<script setup lang="ts">
import { MoreVertical, CheckCircle2 } from '@lucide/vue'
import type { Video } from '../../shared/types'
defineProps<{ video: Video; hideLabel?: boolean; hideBorder?: boolean }>()
</script>
<template>
  <article class="video-card" :class="{ proposed: video.proposed, 'hide-border': hideBorder }">
    <div class="video-image"><DemoThumbnail v-if="video.thumbnail.startsWith('demo:')" :variant="Number(video.thumbnail.split(':')[1])" /><img v-else :src="video.thumbnail" :alt="video.title" loading="lazy"><span v-if="video.proposed && !hideLabel" class="proposal-tag">YOUR THUMBNAIL</span><span v-if="video.duration" class="duration">{{ video.duration }}</span></div>
    <div class="video-info"><div class="channel-avatar" :class="{ yours: video.proposed }">{{ video.channel.slice(0, 1) }}</div><div class="video-copy"><h3>{{ video.title }}</h3><p>{{ video.channel }} <CheckCircle2 v-if="!video.proposed" :size="11" /></p><p>{{ video.views }}<span v-if="video.views && video.published"> · </span>{{ video.published }}</p></div><MoreVertical :size="17" class="video-menu" /></div>
  </article>
</template>
