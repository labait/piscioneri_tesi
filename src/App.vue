<script setup>
import { ref } from 'vue';
console.log(import.meta.env.VITE_OPENAI_API_KEY);

const chatOpen = ref(true);

const toggleChat = () => {
  chatOpen.value = !chatOpen.value;
  console.log(chatOpen.value);
}
</script>

<template>
  <div class="chat fixed bottom-0 right-0 mb-6 mr-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-br from-[#1a0033] to-[#2c0066] text-white w-80 z-50">
    <div class="chat-header font-bold flex justify-between items-center p-4 border-b border-white/10">
      <h1 class="text-lg">Chat</h1>
      <button class="chat-close cursor-pointer" @click="toggleChat">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="chat-body max-h-96 overflow-y-auto p-4" v-if="chatOpen">
      <div class="chat-body-content">
        <div class="chat-body-content-message bg-[#330066] p-3 rounded-xl shadow text-sm">
          <p>Hello</p>
          <p>Hello</p>
          <p>Hello</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat {
  transition: all 0.3s ease-in-out;
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>