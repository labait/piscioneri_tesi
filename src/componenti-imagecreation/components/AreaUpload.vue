<template>
  <div 
    class="area-upload border-2 border-dashed border-cyan-400/50 rounded-2xl p-12 text-center hover:border-cyan-400 transition-colors bg-slate-800/30"
    :class="{ 'border-cyan-400 bg-cyan-400/10': isDragOver }"
    @drop="handleDrop"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @dragenter.prevent
  >
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      @change="handleFileSelect" 
      class="hidden"
    >
    
    <div @click="openFileDialog" class="cursor-pointer">
      <!-- Icona centrale animata -->
      <div class="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
        <svg class="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      
      <!-- Titolo -->
      <h3 class="text-xl font-semibold text-cyan-300 mb-2">
        Carica la tua immagine
      </h3>
      
      <!-- Descrizione -->
      <p class="text-slate-300 mb-4">
        Trascina un'immagine qui o clicca per selezionarla
      </p>
      
      <!-- Info formati -->
      <div class="text-sm text-slate-400">
        <p>Formati: JPG, PNG, GIF, WebP</p>
        <p>Dimensione massima: 10MB</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['image-selected', 'error'])

// State
const fileInput = ref(null)
const isDragOver = ref(false)

// Methods
const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  // Validazione del file
  if (!isValidImageFile(file)) {
    emit('error', 'File non valido. Seleziona un\'immagine JPG, PNG, GIF o WebP.')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    emit('error', 'File troppo grande. Dimensione massima: 10MB.')
    return
  }
  
  // Leggi il file e converti in base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageData = {
      file,
      dataUrl: e.target?.result,
      name: file.name,
      size: file.size,
      type: file.type
    }
    emit('image-selected', imageData)
  }
  reader.onerror = () => {
    emit('error', 'Errore durante la lettura del file.')
  }
  reader.readAsDataURL(file)
}

const isValidImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(file.type)
}
</script>

<style scoped>
.area-upload {
  transition: all 0.3s ease;
}

.area-upload:hover {
  transform: translateY(-2px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>