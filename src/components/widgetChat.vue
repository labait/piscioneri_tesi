<script setup>
import { inject } from 'vue'

const global = inject('global')


</script>

<template>
  <!-- CHAT LAUNCH BUTTON -->
  <div class="fixed bottom-28 right-6 z-50 flex items-center space-x-2">
    <button
      @click="toggleChat"
      class="bg-[#6dd5fa] hover:bg-[#aee8fd] text-black font-bold px-4 py-2 rounded-full shadow-md transition"
    >
      your chat
    </button>
    <img src="./assets/lum.png" alt="Chatbot Icon" class="w-10 h-10" />
  </div>
      <!-- CHAT WIDGET -->
    <div class="chat fixed bottom-0 right-0 mb-6 mr-6 rounded-2xl shadow-xl backdrop-blur-md bg-gradient-to-br from-[#1a0033] to-[#2c0066] text-white w-80 z-50" v-if="chatOpen">
      <div class="chat-header font-bold flex justify-between items-center p-4 border-b border-white/10">
        <h1 class="text-lg font-title">Chat</h1>
        <button class="chat-close cursor-pointer" @click="toggleChat">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div v-if="currentView === 'chat'">
    <Chat />
  </div>
  <div v-else>
    <!-- CHAT WIDGET (modifica il pulsante qui sotto) -->
    <div class="chat-body-content-message bg-[#330066] p-3 rounded-xl shadow text-sm">
      <a
          href="/public/Chat.html"
          target="_blank"
          class="text-[#6dd5fa] hover:underline transition"
        >
          Your chat
        </a>
    </div>
  </div>

 </div>
</template>