<script setup>
import { ref, inject } from 'vue'

const global = inject('global')

const clickLink = () => {
  global.value.toggleChat()
}

</script>

<template>
  <a href="#" @click="clickLink" class="cursor-pointer fixed bottom-4 right-4">
    <div class="">
      <img src="/images/embed/lum.png" alt="Lumyn Icon" class="w-12 h-12 md:w-16 md:h-16">
    </div>
  </a>
</template>
