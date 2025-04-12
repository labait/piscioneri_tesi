<script setup>
import { inject, computed } from 'vue'

const global = inject('global')

const isChatOpen = computed(() => global.value.chatOpen)
const isFullScreen = computed(() => global.value.chatFullScreen)

const clickLink = () => {
  global.value.toggleChat()
}
</script>

<template>
  <a
    v-if="!isChatOpen || (isChatOpen && !isFullScreen)"
    href="#"
    @click="clickLink"
    class="cursor-pointer fixed bottom-4 right-4"
  >
    <div>
      <img src="/images/embed/lum.png" alt="Lumyn Icon" class="w-12 h-12 md:w-14 md:h-14">
    </div>
  </a>
</template>
