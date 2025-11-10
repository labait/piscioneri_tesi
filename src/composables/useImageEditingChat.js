import { ref, computed, readonly } from 'vue'

/**
 * Composable per la gestione dell'editing di immagini in-chat con Imagen 4.0 (Vertex AI)
 * Permette di caricare un'immagine, applicare modifiche via prompt, e ricevere l'immagine modificata
 * USA ESCLUSIVAMENTE MODELLI GOOGLE GEMINI - NO GPT, NO DALL-E
 */
export function useImageEditingChat() {
  // State reattivo
  const uploadedImage = ref(null) // { dataUrl, name, size, mimeType }
  const isProcessing = ref(false)
  const errorMessage = ref('')
  const processingStep = ref('')
  
  // Computed
  const hasUploadedImage = computed(() => !!uploadedImage.value)
  const hasError = computed(() => !!errorMessage.value)
  const isIdle = computed(() => !isProcessing.value && !hasError.value)
  
  /**
   * Valida un file immagine
   * @param {File} file - File da validare
   * @returns {object} Risultato della validazione
   */
  const validateImageFile = (file) => {
    // Tipi MIME supportati
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Formato non supportato. Usa JPG, PNG, WEBP o GIF.'
      }
    }
    
    // Max 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Il file è troppo grande. Massimo 10MB.'
      }
    }
    
    return {
      isValid: true,
      error: null
    }
  }
  
  /**
   * Carica un'immagine
   * @param {File} file - File immagine da caricare
   * @returns {Promise<object>} Dati dell'immagine caricata
   */
  const uploadImage = async (file) => {
    try {
      errorMessage.value = ''
      
      // Validazione
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        errorMessage.value = validation.error
        throw new Error(validation.error)
      }
      
      // Leggi il file come data URL
      const dataUrl = await readFileAsDataURL(file)
      
      uploadedImage.value = {
        dataUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type
      }
      
      console.log('✅ Immagine caricata:', file.name)
      return uploadedImage.value
      
    } catch (error) {
      console.error('❌ Errore caricamento immagine:', error)
      errorMessage.value = error.message || 'Errore nel caricamento dell\'immagine'
      throw error
    }
  }
  
  /**
   * Helper per leggere un file come data URL
   * @param {File} file - File da leggere
   * @returns {Promise<string>} Data URL
   */
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(new Error('Errore nella lettura del file'))
      reader.readAsDataURL(file)
    })
  }
  
  /**
   * Modifica un'immagine usando Imagen 4.0 su Vertex AI tramite Netlify Function
   * IMPORTANTE: Usa SOLO modelli Google (Gemini + Imagen) - NO GPT, NO DALL-E
   * 
   * @param {string} imageDataUrl - Data URL dell'immagine da modificare
   * @param {string} prompt - Prompt di modifica
   * @returns {Promise<string>} Data URL dell'immagine modificata
   */
  const editImageWithPrompt = async (imageDataUrl, prompt) => {
    if (isProcessing.value) {
      throw new Error('Elaborazione già in corso')
    }
    
    try {
      isProcessing.value = true
      errorMessage.value = ''
      processingStep.value = 'Preparazione richiesta...'
      
      // Validazione input
      if (!imageDataUrl || !prompt.trim()) {
        throw new Error('Immagine e prompt sono obbligatori')
      }
      
      console.log('🤖 Inizio modifica immagine con Imagen 4.0 (Vertex AI)')
      console.log('📝 Prompt:', prompt)
      
      // Converti l'immagine per l'API
      const imageBase64 = imageDataUrl.replace(/^data:image\/[^;]+;base64,/, '')
      const mimeType = imageDataUrl.match(/^data:(image\/[^;]+);base64,/)?.[1] || 'image/jpeg'
      
      processingStep.value = 'Invio a Imagen 4.0...'
      
      // Chiama la Netlify Function
      const response = await fetch('/.netlify/functions/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          prompt: prompt,
          mimeType: mimeType
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Errore HTTP: ${response.status}`)
      }
      
      processingStep.value = 'Elaborazione risposta...'
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Errore sconosciuto dal server')
      }
      
      if (!data.imageBase64) {
        throw new Error('Nessuna immagine ricevuta dal server')
      }
      
      // Converti i dati base64 in data URL
      const resultMimeType = data.mimeType || 'image/png'
      const modifiedImageDataUrl = `data:${resultMimeType};base64,${data.imageBase64}`
      
      console.log('✅ Immagine modificata ricevuta con successo!')
      processingStep.value = 'Completato!'
      
      return modifiedImageDataUrl
      
    } catch (error) {
      console.error('❌ Errore durante l\'editing dell\'immagine:', error)
      handleError(error)
      throw error
    } finally {
      isProcessing.value = false
      processingStep.value = ''
    }
  }
  
  /**
   * Gestisce gli errori
   * @param {Error} error - Errore da gestire
   */
  const handleError = (error) => {
    console.error('🔴 Gestione errore:', error)
    
    if (error.message.includes('API_KEY') || error.message.includes('API Key')) {
      errorMessage.value = 'Errore di autenticazione. Verifica la chiave API Gemini.'
    } else if (error.message.includes('QUOTA') || error.message.includes('quota')) {
      errorMessage.value = 'Quota API esaurita. Riprova più tardi.'
    } else if (error.message.includes('model') || error.message.includes('Model')) {
      errorMessage.value = 'Modello Gemini non disponibile.'
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMessage.value = 'Errore di connessione. Verifica la tua connessione internet.'
    } else {
      errorMessage.value = error.message || 'Si è verificato un errore imprevisto.'
    }
  }
  
  /**
   * Rimuove l'immagine caricata
   */
  const removeImage = () => {
    uploadedImage.value = null
    errorMessage.value = ''
    console.log('🗑️ Immagine rimossa')
  }
  
  /**
   * Reset completo dello stato
   */
  const reset = () => {
    uploadedImage.value = null
    isProcessing.value = false
    errorMessage.value = ''
    processingStep.value = ''
    console.log('🔄 Reset completato')
  }
  
  // Esponi lo stato e i metodi
  return {
    // State (read-only)
    uploadedImage: readonly(uploadedImage),
    isProcessing: readonly(isProcessing),
    errorMessage: readonly(errorMessage),
    processingStep: readonly(processingStep),
    
    // Computed
    hasUploadedImage,
    hasError,
    isIdle,
    
    // Methods
    uploadImage,
    editImageWithPrompt,
    removeImage,
    reset,
    validateImageFile
  }
}
