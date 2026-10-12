<script setup lang="ts">
defineProps<{ variant?: number }>()
</script>
<template><div class="demo-thumb" :class="`demo-thumb-${variant || 1}`"><img src="/demo/acoustic.jpg" alt="Acoustic guitar session"><div class="demo-shade"></div><div class="demo-words"><small>ONE GUITAR. ONE VOICE.</small><strong>IMAGINE<br>{{ variant === 2 ? 'ROCK SESSION' : 'UNPLUGGED' }}<span>{{ variant === 2 ? 'ROCK COVER' : 'ACOUSTIC COVER' }}</span></strong></div></div></template>
