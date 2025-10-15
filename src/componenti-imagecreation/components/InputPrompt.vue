<template>
  <div class="space-y-4">
    <label class="block text-sm font-medium text-cyan-300">
      Descrivi come vuoi modificare l'immagine
    </label>
    
    <div class="relative">
      <textarea
        v-model="localPrompt"
        :disabled="disabled"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown.ctrl.enter="$emit('submit')"
        @keydown.meta.enter="$emit('submit')"
        class="w-full h-32 p-4 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
        :class="{
          'opacity-50 cursor-not-allowed': disabled,
          'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50': hasError
        }"
      />
      
      <!-- Contatore caratteri -->
      <div class="absolute bottom-2 right-2 text-xs text-slate-400">
        {{ characterCount }}/{{ maxLength }}
      </div>
      
      <!-- Messaggio di errore -->
      <div v-if="hasError" class="absolute -bottom-6 left-0 text-red-400 text-xs">
        {{ errorMessage }}
      </div>
    </div>
    

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Esempio: "Aggiungi un filtro vintage", "Cambia lo sfondo in blu", "Rendi l\'immagine più luminosa"...'
  },
  maxLength: {
    type: Number,
    default: 1000
  },
  showSuggestions: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit', 'input'])

// Local state
const localPrompt = ref(props.modelValue)

// Computed
const characterCount = computed(() => localPrompt.value.length)
const hasError = computed(() => !!props.errorMessage)

// Methods
const handleInput = () => {
  // Limita la lunghezza del testo
  if (localPrompt.value.length > props.maxLength) {
    localPrompt.value = localPrompt.value.substring(0, props.maxLength)
  }
  
  emit('update:modelValue', localPrompt.value)
  emit('input', localPrompt.value)
}

// Watch per cambiamenti esterni
watch(() => props.modelValue, (newValue) => {
  localPrompt.value = newValue
})
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.5);
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.7);
}

button:focus-visible {
  outline: 2px solid rgba(6, 182, 212, 0.5);
  outline-offset: 2px;
}

textarea:focus {
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

button {
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>