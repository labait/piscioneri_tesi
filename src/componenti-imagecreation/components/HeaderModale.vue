<template>
  <div class="sticky top-0 bg-black/20 backdrop-blur-lg border-b border-white/10 p-6 flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
        <svg class="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      <div>
        <h2 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          AI Image Editor
        </h2>
        <p class="text-slate-300 text-sm">Modifica le immagini con Gemini AI</p>
      </div>
    </div>
    
    <button 
      @click="$emit('close')"
      class="w-10 h-10 bg-slate-700/50 hover:bg-red-500/50 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      title="Chiudi editor"
    >
      <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
// Emits
defineEmits(['close'])
</script>

<style scoped>
/* Effetti hover per il bottone di chiusura */
button:hover {
  transform: scale(1.1);
}

button:focus-visible {
  outline: 2px solid rgba(6, 182, 212, 0.5);
  outline-offset: 2px;
}

/* Gradient text per il titolo */
h2 {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animazione icona di chiusura */
.group:hover svg {
  transform: rotate(90deg);
}
</style>