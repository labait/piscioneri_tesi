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
  <div class="chat  bg-gray-200 w-100 p-4 fixed bottom-0 right-0 mb-4 mr-4 rounded-lg">
    <div class="chat-header font-bold flex justify-between items-center">
      <h1>chat</h1>
      <button class="chat-close cursor-pointer" @click="toggleChat">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="chat-body min-h-96 bg-gray-100 rounded-lg mt-4" v-if="chatOpen">
      <div class="chat-body-content">
        <div class="chat-body-content-message p-4">
          <p>Hello</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.chat {
  transition: all 0.3s ease-in-out;
}
</style>
