<template>
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <!-- Bottone principale - Analizza e Modifica -->
    <button
      @click="$emit('process')"
      :disabled="!canProcess"
      class="pulsante-principale group relative overflow-hidden"
      :class="buttonClasses.primary"
    >
      <!-- Background animato -->
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <!-- Contenuto del bottone -->
      <div class="relative flex items-center justify-center gap-3">
        <!-- Spinner di caricamento -->
        <div 
          v-if="isProcessing"
          class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></div>

        
        <span class="font-semibold text-white">
          {{ isProcessing ? processingText : 'Analizza e Modifica' }}
        </span>
      </div>
      
      <!-- Effetto glow -->
      <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
    </button>
    
    <!-- Bottoni secondari -->
    <div class="flex gap-2">
      <!-- Scarica Risultato -->
      <button
        v-if="showDownload"
        @click="$emit('download')"
        :disabled="!canDownload"
        class="pulsante-secondario group"
        :class="buttonClasses.secondary"
        title="Scarica immagine modificata"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span class="hidden sm:inline">Scarica</span>
      </button>
      
      <!-- Nuova Immagine -->
      <button
        v-if="showReset"
        @click="$emit('reset')"
        :disabled="isProcessing"
        class="pulsante-secondario group"
        :class="buttonClasses.secondary"
        title="Carica nuova immagine"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span class="hidden sm:inline">Nuova</span>
      </button>
      
      <!-- Condividi -->
      <button
        v-if="showShare"
        @click="$emit('share')"
        :disabled="!canShare"
        class="pulsante-secondario group"
        :class="buttonClasses.secondary"
        title="Condividi risultato"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
        <span class="hidden sm:inline">Condividi</span>
      </button>
    </div>
  </div>
  
  <!-- Barra di progresso -->
  <div 
    v-if="isProcessing && showProgress"
    class="mt-4 w-full bg-slate-700 rounded-full h-2 overflow-hidden"
  >
    <div 
      class="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500 animate-pulse"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
  
  <!-- Messaggio di stato -->
  <div v-if="statusMessage" class="mt-3 text-center">
    <p class="text-sm" :class="statusMessageClass">
      {{ statusMessage }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  isProcessing: {
    type: Boolean,
    default: false
  },
  processingText: {
    type: String,
    default: 'Elaborazione in corso...'
  },
  canProcess: {
    type: Boolean,
    default: false
  },
  canDownload: {
    type: Boolean,
    default: false
  },
  canShare: {
    type: Boolean,
    default: false
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showShare: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  statusMessage: {
    type: String,
    default: ''
  },
  statusType: {
    type: String,
    default: 'info', // info, success, error, warning
    validator: (value) => ['info', 'success', 'error', 'warning'].includes(value)
  }
})

// Emits
defineEmits(['process', 'download', 'reset', 'share'])

// Computed
const buttonClasses = computed(() => ({
  primary: {
    'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25': props.canProcess && !props.isProcessing,
    'hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105': props.canProcess && !props.isProcessing,
    'bg-slate-600 text-slate-400 cursor-not-allowed': !props.canProcess || props.isProcessing,
    'opacity-90': props.isProcessing
  },
  secondary: {
    'bg-slate-700/50 text-slate-300 border border-slate-600': true,
    'hover:bg-slate-600/70 hover:text-white hover:border-slate-500': !props.isProcessing,
    'opacity-50 cursor-not-allowed': props.isProcessing
  }
}))

const statusMessageClass = computed(() => {
  const baseClasses = 'transition-colors duration-300'
  
  switch (props.statusType) {
    case 'success':
      return `${baseClasses} text-green-400`
    case 'error':
      return `${baseClasses} text-red-400`
    case 'warning':
      return `${baseClasses} text-yellow-400`
    default:
      return `${baseClasses} text-cyan-300`
  }
})
</script>

<style scoped>
.pulsante-principale {
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  transform: translateY(0);
  position: relative;
  min-width: 200px;
}

.pulsante-secondario {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  transform: translateY(0);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Effetti hover */
.pulsante-principale:not(:disabled):hover {
  transform: translateY(-2px);
}

.pulsante-secondario:not(:disabled):hover {
  transform: translateY(-1px);
}

/* Focus states */
button:focus-visible {
  outline: 2px solid rgba(6, 182, 212, 0.5);
  outline-offset: 2px;
}

/* Animazioni di caricamento */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>