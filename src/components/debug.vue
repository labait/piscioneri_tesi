<script setup>
import { inject } from 'vue'

const global = inject('global')

</script>

<template>
  <div v-if="global.debug" class="fixed top-0 left-0 w-full bg-white color-black p-4">
    <pre>{{ global }}</pre>
  </div>
</template>
