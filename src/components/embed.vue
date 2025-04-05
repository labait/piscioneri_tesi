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
  debug: true,
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
  console.log(global.value)
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