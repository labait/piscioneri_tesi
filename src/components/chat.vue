<script setup>
import { ref, inject, computed } from 'vue'

// it has 2 modes, small and full screen
const global = inject('global')

const showModal = computed(() => global.value.chatOpen)
const toggleChatFullScreen = () => {
  global.value.chatFullScreen = !global.value.chatFullScreen
}

</script>

<template>



  <div
    id="modal"
    :class="[
      'fixed inset-0 bg-black/70 items-center justify-center z-[9999]',
      showModal ? 'flex' : 'hidden'
    ]"
  >
    <div 
      :class="[
        'bg-[#1a1a1a] border border-[#6dd5fa]  p-8  mx-auto animate-fade-in-up',
        global.chatFullScreen ? 'h-full' : 'h-auto',
        global.chatFullScreen ? 'w-full ' : 'w-full max-w-3xl rounded-3xl',
      ]"
      >

      <div class="flex flex-row h-full">  
        <h2 class="text-center text-[#6dd5fa] text-3xl font-title mb-6">
          Ask everything you want
        </h2>
        <!-- add toggle chat full screen -->
        <button
          @click="toggleChatFullScreen"
          class="text-sm text-white/60 hover:text-white transition"
        >
          Toggle chat full screen
        </button>
      </div>

      <!-- Input + Bottone invio -->
      <div class="relative">
        <input
          id="user-input"
          type="text"
          placeholder="Write to Lumyn"
          @keyup.enter.prevent="sendMessage"
          class="w-full px-6 py-3 bg-transparent border border-[#6dd5fa] text-[#6dd5fa] rounded-full placeholder-[#6dd5fa] focus:outline-none"
        />
        <button
          @click="sendMessage"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6dd5fa] text-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12 6 6 0 010-12zm1 9.59L8.41 10 11 7.41l1.41 1.42-1.58 1.58L12.41 12 11 13.41z"
            />
          </svg>
        </button>
      </div>

      <!-- Pulsante chiudi -->
      <div class="text-center mt-6">
        <button
          @click="toggleModal"
          class="text-sm text-white/60 hover:text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
   
</template>
