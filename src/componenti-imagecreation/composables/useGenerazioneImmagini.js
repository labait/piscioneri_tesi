import { ref, computed, readonly } from 'vue'

/**
 * Composable per la gestione della generazione di immagini con AI
 * Centralizza tutta la logica di elaborazione e interazione con l'API Gemini
 */
export function useGenerazioneImmagini() {
  // State reattivo
  const isProcessing = ref(false)
  const errorMessage = ref('')
  const aiDescription = ref('')
  const processingStep = ref('')
  
  // Computed
  const hasError = computed(() => !!errorMessage.value)
  const isIdle = computed(() => !isProcessing.value && !hasError.value)
  
  /**
   * Analizza un'immagine e genera una descrizione della modifica richiesta
   * @param {string} imageData - Dati dell'immagine in base64
   * @param {string} prompt - Prompt di modifica dell'utente
   * @returns {Promise<string>} Descrizione generata dall'AI
   */
  const analyzeImage = async (imageData, prompt) => {
    try {
      processingStep.value = 'Analisi immagine con Gemini AI...'
      console.log('Inizio analisi immagine:', { prompt })
      
      // Dinamicamente importa il SDK di Google AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      
      // Verifica che l'API key sia configurata
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('API Key di Gemini non configurata. Verifica il file .env')
      }
      
      // Modello per analisi immagine
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      
      // Converti l'immagine per l'API
      const imageBase64 = imageData.replace(/^data:image\/[^;]+;base64,/, '')
      
      // Prompt ottimizzato per l'analisi con istruzioni specifiche
      const analysisPrompt = `
        Analizza questa immagine e descrivi dettagliatamente come modificarla in base a questa richiesta: "${prompt}".
        
        IMPORTANTE - Istruzioni per la preservazione della struttura:
        L'immagine di partenza deve essere mantenuta identica nella sua struttura e prospettiva.
        Non modificare la disposizione, la scala o le proporzioni degli elementi architettonici presenti, come muri, finestre, porte o colonne.
        Mantieni invariata la geometria complessiva, il punto di vista e l'illuminazione principale.

        L'obiettivo è aggiornare solo l'aspetto estetico e l'arredamento della scena:
        - applica lo stile e i materiali indicati nel prompt aggiuntivo;
        - aggiungi o sostituisci elementi d'arredo, decorazioni e texture;
        - adatta colori, materiali e luce in modo coerente, senza alterare la struttura.

        Il risultato deve apparire realistico e integrato, rispettando la composizione originale.
        
        Fornisci una descrizione precisa e tecnica che includa:
        - Elementi specifici da modificare mantenendo la struttura
        - Colori, materiali e texture da applicare
        - Stile e mood desiderato
        - Dettagli di arredamento e decorazioni
        
        Rispondi in italiano con una descrizione chiara e dettagliata di massimo 300 parole.
      `
      
      const result = await model.generateContent([
        analysisPrompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ])
      
      if (!result || !result.response) {
        throw new Error('Risposta non valida dall\'API Gemini')
      }
      
      const response = await result.response
      const description = response.text()
      
      if (!description || description.trim().length === 0) {
        throw new Error('Nessuna descrizione ricevuta dall\'AI')
      }
      
      console.log('Analisi completata:', description.substring(0, 100) + '...')
      aiDescription.value = description
      
      return description
      
    } catch (error) {
      console.error('Errore durante l\'analisi:', error)
      handleError(error)
      throw error
    }
  }
  
  /**
   * Genera un'immagine basata sulla descrizione AI utilizzando Gemini 2.5 Flash Image
   * @param {string} description - Descrizione per la generazione
   * @returns {Promise<string>} Data URL dell'immagine generata
   */
  const generateImage = async (description) => {
    try {
      processingStep.value = 'Generazione immagine con Gemini 2.5 Flash Image...'
      console.log('Inizio generazione immagine:', description.substring(0, 50) + '...')
      
      // Dinamicamente importa il SDK di Google AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      
      // Prompt ottimizzato per la generazione con Gemini 2.5 Flash Image
      const imagenPrompt = `Create a high-quality, detailed image: ${description}. 
      
      Style requirements:
      - Professional photography style
      - Realistic and well-lit
      - High resolution quality
      - Detailed textures and vibrant colors
      - Professional composition`
      
      // Usa Gemini 2.5 Flash Image per generazione immagini
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" })
      
      console.log('Invio richiesta a Gemini 2.5 Flash Image...')
      
      const result = await model.generateContent([imagenPrompt])
      
      const response = await result.response
      console.log('Risposta Gemini ricevuta:', response)
      
      // Estrai l'immagine dalla risposta
      const candidates = response.candidates
      if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        const parts = candidates[0].content.parts
        
        // Cerca parti che contengono dati immagine
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // Converti i dati base64 in data URL
            const mimeType = part.inlineData.mimeType || 'image/png'
            const imageDataUrl = `data:${mimeType};base64,${part.inlineData.data}`
            
            console.log('Immagine generata con successo!')
            return imageDataUrl
          }
        }
      }
      
      throw new Error('Nessuna immagine trovata nella risposta di Gemini')
      
    } catch (error) {
      console.error('Errore durante la generazione:', error)
      handleError(error)
      throw error
    }
  }
  
  /**
   * Processo completo: modifica direttamente l'immagine con Gemini 2.5 Flash Image
   * @param {string} imageData - Dati dell'immagine in base64
   * @param {string} prompt - Prompt di modifica dell'utente
   * @returns {Promise<string>} Data URL dell'immagine generata
   */
  const processImage = async (imageData, prompt) => {
    if (isProcessing.value) {
      throw new Error('Elaborazione già in corso')
    }
    
    try {
      isProcessing.value = true
      errorMessage.value = ''
      
      // Validazione input
      if (!imageData || !prompt.trim()) {
        throw new Error('Immagine e prompt sono obbligatori')
      }
      
      processingStep.value = 'Modifica immagine con Gemini 2.5 Flash Image...'
      console.log('Inizio modifica diretta immagine con prompt:', prompt.substring(0, 50) + '...')
      
      // Dinamicamente importa il SDK di Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      
      // Verifica che l'API key sia configurata
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('API Key di Gemini non configurata. Verifica il file .env')
      }
      
      // Prompt ottimizzato per modifica diretta con Gemini
      const modificationPrompt = `
        Modifica questa immagine seguendo questa richiesta: "${prompt}".
        
        IMPORTANTE - Istruzioni per la preservazione della struttura:
        L'immagine di partenza deve essere mantenuta identica nella sua struttura e prospettiva.
        Non modificare la disposizione, la scala o le proporzioni degli elementi architettonici presenti, come muri, finestre, porte o colonne.
        Mantieni invariata la geometria complessiva, il punto di vista e l'illuminazione principale.

        L'obiettivo è aggiornare solo l'aspetto estetico e l'arredamento della scena:
        - applica lo stile e i materiali indicati nel prompt;
        - aggiungi o sostituisci elementi d'arredo, decorazioni e texture;
        - adatta colori, materiali e luce in modo coerente, senza alterare la struttura.

        Il risultato deve apparire realistico e integrato, rispettando la composizione originale.
      `
      
      console.log('Invio richiesta a Gemini 2.5 Flash Image per modifica diretta...')
      
      // Converti l'immagine per l'API
      const imageBase64 = imageData.replace(/^data:image\/[^;]+;base64,/, '')
      
      // Usa Gemini 2.5 Flash Image per la modifica dell'immagine
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" })
      
      const result = await model.generateContent([
        modificationPrompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ])
      
      const response = await result.response
      console.log('Risposta Gemini ricevuta:', response)
      
      // Estrai l'immagine dalla risposta
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts
        
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // Converti i dati base64 in data URL
            const mimeType = part.inlineData.mimeType || 'image/png'
            const imageDataUrl = `data:${mimeType};base64,${part.inlineData.data}`
            
            console.log('Immagine modificata con successo!')
            processingStep.value = 'Completato!'
            return imageDataUrl
          }
        }
      }
      
      throw new Error('Nessuna immagine trovata nella risposta di Gemini')
      
      processingStep.value = 'Completato!'
      return modifiedImageData
      
    } catch (error) {
      console.error('Errore nel processo completo:', error)
      throw error
    } finally {
      isProcessing.value = false
      processingStep.value = ''
    }
  }
  
  /**
   * Gestisce gli errori e imposta messaggi user-friendly
   * @param {Error} error - Errore da gestire
   */
  const handleError = (error) => {
    console.error('Gestione errore:', error)
    
    // Reset dello stato
    isProcessing.value = false
    processingStep.value = ''
    
    // Messaggi di errore specifici
    if (error.message.includes('API_KEY') || error.message.includes('API Key')) {
      errorMessage.value = 'Errore di autenticazione. Verifica la chiave API Gemini.'
    } else if (error.message.includes('QUOTA') || error.message.includes('quota')) {
      errorMessage.value = 'Quota API esaurita. Riprova più tardi.'
    } else if (error.message.includes('model') || error.message.includes('Model')) {
      errorMessage.value = 'Modello AI non disponibile. Contatta l\'amministratore.'
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorMessage.value = 'Errore di connessione. Verifica la tua connessione internet.'
    } else if (error.message.includes('CORS')) {
      errorMessage.value = 'Errore di configurazione. Contatta l\'amministratore.'
    } else {
      errorMessage.value = error.message || 'Si è verificato un errore imprevisto durante l\'elaborazione.'
    }
  }
  
  /**
   * Reset dello stato del composable
   */
  const reset = () => {
    isProcessing.value = false
    errorMessage.value = ''
    aiDescription.value = ''
    processingStep.value = ''
  }
  
  /**
   * Genera un nome file per il download
   * @param {string} originalName - Nome originale del file
   * @returns {string} Nome file per il download
   */
  const generateDownloadFilename = (originalName = 'immagine') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const baseName = originalName.replace(/\.[^/.]+$/, '') // rimuove estensione
    return `${baseName}-ai-modificata-${timestamp}.png`
  }
  
  /**
   * Valida un prompt utente
   * @param {string} prompt - Prompt da validare
   * @returns {object} Risultato della validazione
   */
  const validatePrompt = (prompt) => {
    const trimmed = prompt.trim()
    
    if (!trimmed) {
      return {
        isValid: false,
        error: 'Il prompt non può essere vuoto'
      }
    }
    
    if (trimmed.length < 3) {
      return {
        isValid: false,
        error: 'Il prompt deve essere di almeno 3 caratteri'
      }
    }
    
    if (trimmed.length > 1000) {
      return {
        isValid: false,
        error: 'Il prompt non può superare i 1000 caratteri'
      }
    }
    
    return {
      isValid: true,
      error: null
    }
  }
  
  // Esponi lo stato e i metodi
  return {
    // State (read-only)
    isProcessing: readonly(isProcessing),
    errorMessage: readonly(errorMessage),
    aiDescription: readonly(aiDescription),
    processingStep: readonly(processingStep),
    
    // Computed
    hasError,
    isIdle,
    
    // Methods
    processImage,
    analyzeImage,
    generateImage,
    handleError,
    reset,
    generateDownloadFilename,
    validatePrompt
  }
}