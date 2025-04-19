<script setup>
import { ref, provide, inject, onMounted } from 'vue'
import Chat from './chat.vue'
import WidgetLink from './widgetLink.vue'
import Debug from './debug.vue'

const toggleChat = () => {
  console.log('toggleChat')
  global.value.chatOpen = !global.value.chatOpen
}


const global = ref({
  appName: import.meta.env.VITE_APP_NAME,
  debug: false,
  chatFullScreen: false,
  chatOpen: false,
  showModal: false,
  toggleChat: toggleChat,
})


window.lumyn = {
  global: global,
  toggleChat: toggleChat,
}

provide('global', global)

onMounted(() => {
  console.log("embed loaded, global", global.value)
  // if chat_id is in url, open chat
  const chatId = new URLSearchParams(window.location.search).get('chat_id')
  if (chatId) {
    global.value.chatOpen = true
  }
})

// this component expose toggleChat to other components as an emit
const emit = defineEmits([
  'toggleChat'
])

</script>

<template>
  <Chat class="chat" />
  <WidgetLink class="widget-link" />
  <Debug class="debug" />
</template>

<style scoped>

.debug {
  z-index: 10001;
}

.widget-link {
  z-index: 10000;
}
</style>