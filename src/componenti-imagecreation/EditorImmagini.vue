<template>
  <!-- Overlay modale -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
    @click="closeModal"
  >
    <!-- Contenitore modale -->
    <div 
      class="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/20 text-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-cyan-400/50 backdrop-blur-lg animate-fade-in-up"
      @click.stop
    >
      <!-- Header della modale -->
      <HeaderModale @close="closeModal" />

      <!-- Contenuto della modale -->
      <div class="p-6 space-y-8">
        <!-- Area di upload o preview immagini -->
        <AreaUpload 
          v-if="!originalImage"
          @image-selected="handleImageSelected"
          @error="handleUploadError"
        />
        
        <AnteprimaImmagini 
          v-else
          :original-image="originalImage"
          :original-image-name="originalImageName"
          :original-image-size="originalImageSize"
          :modified-image="modifiedImage"
          :ai-description="aiDescription"
          :is-processing="isProcessing"
          :processing-message="processingStep"
          @remove-image="resetEditor"
        />

        <!-- Input prompt e azioni -->
        <div v-if="originalImage" class="space-y-6">
          <InputPrompt
            v-model="userPrompt"
            :disabled="isProcessing"
            :error-message="promptError"
            @submit="handleProcessImage"
          />
          
          <PulsantiAzione
            :is-processing="isProcessing"
            :processing-text="processingStep"
            :can-process="canProcess"
            :can-download="canDownload"
            :show-download="!!modifiedImage"
            :show-reset="true"
            :status-message="errorMessage"
            :status-type="errorMessage ? 'error' : 'info'"
            @process="handleProcessImage"
            @download="downloadImage"
            @reset="resetEditor"
          />
        </div>

        <!-- Messaggi di errore globali -->
        <div v-if="errorMessage" class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h4 class="text-red-300 font-medium">Errore</h4>
              <p class="text-red-200 text-sm mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AreaUpload from './components/AreaUpload.vue'
import AnteprimaImmagini from './components/AnteprimaImmagini.vue'
import InputPrompt from './components/InputPrompt.vue'
import PulsantiAzione from './components/PulsantiAzione.vue'
import HeaderModale from './components/HeaderModale.vue'
import { useGenerazioneImmagini } from './composables/useGenerazioneImmagini.js'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Composable per la gestione dell'AI
const {
  isProcessing,
  errorMessage,
  aiDescription,
  processingStep,
  hasError,
  isIdle,
  processImage,
  reset: resetImageGeneration,
  validatePrompt,
  generateDownloadFilename
} = useGenerazioneImmagini()

// State locale del componente
const originalImage = ref(null)
const originalImageName = ref('')
const originalImageSize = ref(0)
const modifiedImage = ref(null)
const userPrompt = ref('')
const promptError = ref('')

// Computed
const canProcess = computed(() => {
  return originalImage.value && 
         userPrompt.value.trim().length >= 3 && 
         !isProcessing.value
})

const canDownload = computed(() => {
  return modifiedImage.value && !isProcessing.value
})

// Methods
const closeModal = () => {
  if (!isProcessing.value) {
    emit('close')
  }
}

const handleImageSelected = (imageData) => {
  originalImage.value = imageData.dataUrl
  originalImageName.value = imageData.name
  originalImageSize.value = imageData.size
  
  // Reset stato precedente
  modifiedImage.value = null
  resetImageGeneration()
  promptError.value = ''
  
  console.log('Immagine selezionata:', imageData.name)
}

const handleUploadError = (error) => {
  console.error('Errore upload:', error)
}

const handleProcessImage = async () => {
  // Validazione prompt
  const validation = validatePrompt(userPrompt.value)
  if (!validation.isValid) {
    promptError.value = validation.error
    return
  }
  
  promptError.value = ''
  
  try {
    console.log('Inizio elaborazione immagine...')
    
    const result = await processImage(originalImage.value, userPrompt.value)
    modifiedImage.value = result
    
    console.log('Elaborazione completata con successo!')
    
  } catch (error) {
    console.error('Errore durante l\'elaborazione:', error)
  }
}

const downloadImage = () => {
  if (!modifiedImage.value) return
  
  const link = document.createElement('a')
  link.href = modifiedImage.value
  link.download = generateDownloadFilename(originalImageName.value)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  console.log('Download immagine avviato')
}

const resetEditor = () => {
  originalImage.value = null
  originalImageName.value = ''
  originalImageSize.value = 0
  modifiedImage.value = null
  userPrompt.value = ''
  promptError.value = ''
  resetImageGeneration()
  
  console.log('Editor resettato')
}

// Watch per reset automatico quando si chiude la modale
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    setTimeout(resetEditor, 300)
  }
})
</script>

<style scoped>
/* Animazione di entrata */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}

/* Scrollbar personalizzata */
div::-webkit-scrollbar {
  width: 8px;
}

div::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 4px;
}

div::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.5);
  border-radius: 4px;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.7);
}
</style>