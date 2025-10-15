<template>
  <div class="grid md:grid-cols-2 gap-8">
    <!-- Immagine Originale -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-cyan-300 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Immagine Originale
        </h3>
        <button
          v-if="originalImage"
          @click="$emit('remove-image')"
          class="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
        >
          Rimuovi
        </button>
      </div>
      
      <div class="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
        <img 
          v-if="originalImage"
          :src="originalImage" 
          :alt="originalImageName || 'Immagine originale'"
          class="w-full h-64 object-cover transition-transform hover:scale-105"
        />
        <div v-else class="w-full h-64 flex items-center justify-center text-slate-400">
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p>Nessuna immagine caricata</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Risultato AI -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-cyan-300 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Risultato AI
        </h3>
        <button
          v-if="modifiedImage && !isProcessing"
          @click="downloadImage"
          class="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Scarica
        </button>
      </div>
      
      <div class="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden relative">
        <!-- Stato di caricamento -->
        <div 
          v-if="isProcessing"
          class="w-full h-64 flex items-center justify-center"
        >
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-cyan-300 font-medium">{{ processingMessage }}</p>
            <p class="text-slate-400 text-sm mt-1">Elaborazione in corso...</p>
          </div>
        </div>

        <!-- Immagine risultato -->
        <img 
          v-else-if="modifiedImage"
          :src="modifiedImage" 
          alt="Immagine modificata"
          class="w-full h-64 object-cover transition-transform hover:scale-105"
        />

        <!-- Stato vuoto -->
        <div v-else class="w-full h-64 flex items-center justify-center text-slate-400">
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <p>Il risultato apparirà qui</p>
          </div>
        </div>

        <!-- Badge stato -->
        <div 
          v-if="modifiedImage && !isProcessing"
          class="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs rounded-full"
        >
          Completato
        </div>
      </div>

      <!-- Descrizione AI -->
      <div 
        v-if="aiDescription && !isProcessing"
        class="p-4 bg-slate-700/30 rounded-lg border border-cyan-400/30"
      >
        <h4 class="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Descrizione AI della Modifica
        </h4>
        <p class="text-slate-300 text-sm leading-relaxed">
          {{ aiDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  originalImage: {
    type: String,
    default: null
  },
  originalImageName: {
    type: String,
    default: null
  },
  originalImageSize: {
    type: Number,
    default: null
  },
  modifiedImage: {
    type: String,
    default: null
  },
  aiDescription: {
    type: String,
    default: null
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  processingMessage: {
    type: String,
    default: 'Elaborazione in corso...'
  }
})

// Emits
defineEmits(['remove-image'])

// Methods
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = modifiedImage
  link.download = `immagine-modificata-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

img {
  transition: transform 0.3s ease;
}
</style>