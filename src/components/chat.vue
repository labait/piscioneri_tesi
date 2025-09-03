<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
// --- VOCALE ---
const isVoiceModalOpen = ref(false)
const isVoiceConversationModalOpen = ref(false)
const recognizing = ref(false)
const speaking = ref(false)
const speechRecognitionSupported = 'webkitSpeechRecognition' in window
let recognition
function openVoiceModal() {
  isVoiceModalOpen.value = true
}

function closeVoiceModal() {
  isVoiceModalOpen.value = false
}

function openVoiceConversationModal() {
  isVoiceConversationModalOpen.value = true
}

function closeVoiceConversationModal() {
  isVoiceConversationModalOpen.value = false
}
if (speechRecognitionSupported) {
  recognition = new webkitSpeechRecognition()
  recognition.lang = 'it-IT'
  recognition.continuous = false
  recognition.interimResults = false

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  inputRef.value.value = transcript
  sendMessage()
  closeVoiceModal()
}

  recognition.onend = () => recognizing.value = false
}

function toggleRecognition() {
  if (!recognition) return
  recognizing.value ? recognition.stop() : recognition.start()
  recognizing.value = !recognizing.value
}

function cleanResponseText(text) {
  if (!text || typeof text !== 'string') return text

  return text
    // Rimuove i pattern di riferimento come 【4:7†source】
    .replace(/【[^】]*】/g, '')
    // Rimuove le sezioni "Documenti di riferimento:" e tutto quello che segue
    .replace(/\*\*Documenti di riferimento:\*\*[\s\S]*$/i, '')
    .replace(/Documenti di riferimento:[\s\S]*$/i, '')
    // Rimuove i titoli in formato Markdown (### titolo)
    .replace(/^#{1,6}\s+.*/gm, '')
    // Rimuove le doppie asterischi per il grassetto (**testo**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Rimuove i singoli asterischi per il corsivo (*testo*)
    .replace(/\*(.*?)\*/g, '$1')
    // Rimuove le linee che iniziano con "**" (titoli formattati)
    .replace(/^\*\*.*?\*\*:?\s*$/gm, '')
    // Rimuove le linee vuote multiple
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Rimuove spazi eccessivi
    .replace(/\s{3,}/g, ' ')
    // Rimuove linee che contengono solo spazi o simboli
    .replace(/^\s*[-*_=]{3,}\s*$/gm, '')
    // Trim generale
    .trim()
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    // Pulisce il testo prima di pronunciarlo
    const cleanText = cleanResponseText(text)
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'it-IT'

    // Seleziona la prima voce maschile italiana disponibile
    const voices = window.speechSynthesis.getVoices()
    const maleVoice = voices.find(v => v.lang === 'it-IT' && v.name.toLowerCase().includes('male')) 
      || voices.find(v => v.lang === 'it-IT' && v.name.toLowerCase().includes('luciano')) // esempio: voce "Luciano"
    
    if (maleVoice) {
      utterance.voice = maleVoice
    }

    utterance.onstart = () => speaking.value = true
    utterance.onend = () => {
      speaking.value = false
      // Se è attiva la modalità conversazione vocale, inizia ad ascoltare automaticamente
      if (isVoiceConversationMode.value) {
        setTimeout(() => {
          startConversationListening()
        }, 500) // Piccolo delay per evitare conflitti
      }
    }
    window.speechSynthesis.speak(utterance)
  }
}

// Funzioni per la conversazione vocale
function toggleVoiceConversation() {
  if (!isVoiceConversationMode.value) {
    // Apri la modale invece di attivare direttamente
    openVoiceConversationModal()
  } else {
    // Disattiva la modalità conversazione
    isVoiceConversationMode.value = false
    stopConversationListening()
  }
}

function startVoiceConversation() {
  console.log('🎙️ Avvio conversazione vocale...')
  isVoiceConversationMode.value = true
  closeVoiceConversationModal()
  
  // Attiva la modalità conversazione
  initializeConversationRecognition()
  setTimeout(() => {
    console.log('🎤 Inizio ascolto...')
    startConversationListening()
  }, 500)
}

function initializeConversationRecognition() {
  if (!speechRecognitionSupported) return
  
  conversationRecognition.value = new webkitSpeechRecognition()
  conversationRecognition.value.lang = 'it-IT'
  conversationRecognition.value.continuous = false
  conversationRecognition.value.interimResults = false

  conversationRecognition.value.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    console.log('🗣️ Riconosciuto:', transcript)
    if (transcript.trim()) {
      inputRef.value.value = '[VOICE]' + transcript
      sendMessage()
    }
  }

  conversationRecognition.value.onend = () => {
    isListening.value = false
    // Se la modalità conversazione è ancora attiva e non sta parlando, riprendi ad ascoltare
    if (isVoiceConversationMode.value && !speaking.value) {
      setTimeout(() => {
        startConversationListening()
      }, 1000)
    }
  }

  conversationRecognition.value.onerror = (event) => {
    console.warn('Errore riconoscimento vocale:', event.error)
    isListening.value = false
    if (isVoiceConversationMode.value && !speaking.value) {
      setTimeout(() => {
        startConversationListening()
      }, 2000)
    }
  }
}

function startConversationListening() {
  if (!conversationRecognition.value || !isVoiceConversationMode.value || speaking.value) {
    console.log('❌ Non posso iniziare ascolto:', {
      hasRecognition: !!conversationRecognition.value,
      isVoiceMode: isVoiceConversationMode.value,
      isSpeaking: speaking.value
    })
    return
  }
  
  try {
    console.log('✅ Avvio riconoscimento vocale...')
    isListening.value = true
    conversationRecognition.value.start()
  } catch (error) {
    console.warn('Errore avvio riconoscimento:', error)
    isListening.value = false
  }
}

function stopConversationListening() {
  if (conversationRecognition.value) {
    try {
      conversationRecognition.value.stop()
    } catch (error) {
      console.warn('Errore stop riconoscimento:', error)
    }
  }
  isListening.value = false
}


const global = inject('global')
const showModal = computed(() => global.value.chatOpen)
const isFullScreen = computed(() => global.value.chatFullScreen)

const toggleChatFullScreen = () => {
  global.value.chatFullScreen = !global.value.chatFullScreen
}
const toggleModal = () => {
  global.value.chatOpen = false
}

const inputRef = ref(null)
const searchTerm = ref('')
const chatskey = computed(() => `${global.value.appName}-chats`)
const threadKey = computed(() => `${global.value.appName}-thread`)
const chats = ref(JSON.parse(localStorage.getItem(chatskey.value) || '[]'))
const currentIndex = ref(null)
const isBotTyping = ref(false)
const botTypingStatus = ref('') // Nuovo: stato dettagliato
const isVoiceMode = ref(true)
const isVoiceConversationMode = ref(false)
const isListening = ref(false)
const conversationRecognition = ref(null)
const editingMessageIndex = ref(null) // Nuovo: indice del messaggio in modifica
const editingText = ref('') // Nuovo: testo del messaggio in modifica

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
const assistantId = import.meta.env.VITE_OPENAI_ASSISTANT_ID
const airtableKey = import.meta.env.VITE_AIRTABLE_API_KEY
const airtableBase = import.meta.env.VITE_AIRTABLE_BASE_ID
const airtableTable = import.meta.env.VITE_AIRTABLE_TABLE_NAME

// Verifica che tutte le variabili d'ambiente necessarie siano presenti
const configurationError = ref('')

onMounted(() => {
  const missingVars = []
  if (!apiKey) missingVars.push('VITE_OPENAI_API_KEY')
  if (!assistantId) missingVars.push('VITE_OPENAI_ASSISTANT_ID')
  if (!airtableKey) missingVars.push('VITE_AIRTABLE_API_KEY')
  if (!airtableBase) missingVars.push('VITE_AIRTABLE_BASE_ID')
  if (!airtableTable) missingVars.push('VITE_AIRTABLE_TABLE_NAME')
  
  if (missingVars.length > 0) {
    configurationError.value = `Configurazione mancante: ${missingVars.join(', ')}`
    console.error('❌ Variabili d\'ambiente mancanti:', missingVars)
  }
})

// Caricamento thread ID dal localStorage con cache
let threadId = localStorage.getItem('openai-thread-id')

// Funzione per inizializzare o recuperare il thread
async function ensureThread() {
  if (configurationError.value) {
    throw new Error(`Configurazione mancante: ${configurationError.value}`)
  }
  
  if (threadId) return threadId
  
  const commonHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  }

  try {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: commonHeaders
    })

    if (!threadRes.ok) {
      const error = await threadRes.text()
      console.error('🔴 Errore nella creazione del thread:', error)
      if (threadRes.status === 401) {
        throw new Error('API Key OpenAI non valida o mancante')
      }
      throw new Error(`Errore creazione thread: ${threadRes.status}`)
    }

    const threadData = await threadRes.json()
    threadId = threadData.id
    localStorage.setItem('openai-thread-id', threadId)
    console.log('✅ Thread creato e salvato:', threadId)
    return threadId
  } catch (error) {
    console.error('❌ Errore creazione thread:', error)
    throw error
  }
}

async function saveToAirtable(chatId, from, text) {
  try {
    await fetch(`https://api.airtable.com/v0/${airtableBase}/${airtableTable}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${airtableKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          ChatID: String(chatId),
          From: from,
          Message: text,
          Timestamp: new Date().toISOString()
        }
      })
    })
  } catch (err) {
    console.error('❌ Errore salvataggio su Airtable:', err)
  }
}

// Funzione helper per retry automatico
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      console.warn(`⚠️ Tentativo ${attempt} fallito, retry tra ${delay}ms:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

async function getAssistantResponse(userText, statusCallback = null) {
  return await retryWithBackoff(async () => {
    const commonHeaders = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    }

    // Assicuriamoci di avere un thread attivo
    statusCallback?.('Preparazione thread...')
    await ensureThread()

    // Invio del messaggio utente
    statusCallback?.('Invio messaggio...')
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({
        role: 'user',
        content: userText
      })
    })

    if (!messageResponse.ok) {
      throw new Error(`Errore invio messaggio: ${messageResponse.status}`)
    }

    // Avvio del run
    statusCallback?.('Sto pensando...')
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({ assistant_id: assistantId })
    })

    if (!runRes.ok) {
      throw new Error(`Errore avvio run: ${runRes.status}`)
    }

    const runData = await runRes.json()
    let status = 'queued'
    let pollAttempts = 0

    while (status !== 'completed' && status !== 'failed') {
      // Aggiornamento status per l'utente
      const statusMap = {
        'queued': 'Caricamento risposta...',
        'in_progress': 'Sta scrivendo...',
        'requires_action': 'Azione richiesta...'
      }
      statusCallback?.(statusMap[status] || `Elaborazione... (${status})`)
      
      // Polling adattivo: inizia veloce poi rallenta
      const delay = pollAttempts < 5 ? 200 : pollAttempts < 15 ? 500 : 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      const poll = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: commonHeaders
      })
      
      if (!poll.ok) {
        throw new Error(`Errore polling: ${poll.status}`)
      }
      
      const pollData = await poll.json()
      status = pollData.status
      pollAttempts++
      
      // Timeout di sicurezza dopo 60 secondi
      if (pollAttempts > 60) {
        console.warn('⚠️ Timeout: risposta OpenAI troppo lenta')
        throw new Error('Timeout: risposta troppo lenta')
      }
    }

    if (status === 'failed') {
      throw new Error('Run fallito')
    }

    statusCallback?.('Risposta...')
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: commonHeaders
    })

    if (!msgRes.ok) {
      throw new Error(`Errore recupero messaggi: ${msgRes.status}`)
    }

    const msgData = await msgRes.json()
    const last = msgData.data.find(m => m.role === 'assistant')
    return last?.content?.[0]?.text?.value || '(nessuna risposta)'
  }, 2) // Massimo 2 retry
}

const activeChats = computed(() =>
  chats.value.filter(chat => !chat.archived && chat.title.toLowerCase().includes(searchTerm.value.toLowerCase()))
)
const archivedChats = computed(() =>
  chats.value.filter(chat => chat.archived && chat.title.toLowerCase().includes(searchTerm.value.toLowerCase()))
)

function saveChats() {
  localStorage.setItem(chatskey.value, JSON.stringify(chats.value))
}

function createChat() {
  const newChat = {
    id: Date.now(),
    title: 'Nuova chat',
    messages: [],
    archived: false
  }
  chats.value.push(newChat)
  currentIndex.value = chats.value.length - 1
  saveChats()
}

function selectChat(index) {
  currentIndex.value = index
  // Scroll to ensure selected chat is visible
  if (isFullScreen.value) {
    const selectedElement = document.querySelector('.scale-\\[1\\.02\\]')
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

// Keyboard navigation for fullscreen mode
function handleKeydown(event) {
  if (!isFullScreen.value || !activeChats.value.length) return
  
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    
    if (currentIndex.value === null) {
      currentIndex.value = 0
      return
    }
    
    const allChats = [...activeChats.value, ...archivedChats.value]
    const currentChatId = chats.value[currentIndex.value]?.id
    const currentChatIndex = allChats.findIndex(chat => chat.id === currentChatId)
    
    let newIndex
    if (event.key === 'ArrowUp') {
      newIndex = currentChatIndex > 0 ? currentChatIndex - 1 : allChats.length - 1
    } else {
      newIndex = currentChatIndex < allChats.length - 1 ? currentChatIndex + 1 : 0
    }
    
    const newChatId = allChats[newIndex].id
    const newCurrentIndex = chats.value.findIndex(chat => chat.id === newChatId)
    selectChat(newCurrentIndex)
  }
}

// Handle escape key for modals
function handleGlobalKeydown(event) {
  if (event.key === 'Escape') {
    if (isVoiceConversationModalOpen.value) {
      closeVoiceConversationModal()
    } else if (isVoiceModalOpen.value) {
      closeVoiceModal()
    }
  }
}

const gotoChatUrl = (chatId = null) => {
  if (!chatId) chatId = chats.value[currentIndex.value].id
  const url = new URL(window.location.href)
  if (!url.searchParams.get('chat_id')) url.searchParams.set('chat_id', chatId)
  window.location.href = url.toString()
}

function sendMessage() {
  const text = inputRef.value?.value?.trim()
  if (!text) return

  // Se è attiva la modalità conversazione vocale e il messaggio non proviene dalla voce, blocca l'invio
  if (isVoiceConversationMode.value && !text.includes('[VOICE]')) {
    return
  }

  // Rimuovi il marker [VOICE] se presente
  const cleanText = text.replace('[VOICE]', '').trim()
  if (!cleanText) return

  if (currentIndex.value === null) {
    const newChat = {
      id: Date.now(),
      title: cleanText.slice(0, 30) + (cleanText.length > 30 ? '...' : ''),
      messages: [],
      archived: false
    }
    chats.value.push(newChat)
    currentIndex.value = chats.value.length - 1
    gotoChatUrl()
  }

  const chat = chats.value[currentIndex.value]
  chat.messages.push({ from: 'user', text: cleanText })
  saveToAirtable(chat.id, 'user', cleanText)
  isBotTyping.value = true
  botTypingStatus.value = 'Invio messaggio...'
  inputRef.value.value = ''
  saveChats()

  // Funzione helper per aggiornare lo stato
  const updateStatus = (status) => {
    botTypingStatus.value = status
    console.log('🤖 Stato:', status)
  }

  getAssistantResponse(cleanText, updateStatus)
  .then(botReply => {
    updateStatus('Elaborando risposta...')
    const cleanedReply = cleanResponseText(botReply)
    chat.messages.push({ from: 'bot', text: cleanedReply })
    saveToAirtable(chat.id, 'bot', cleanedReply)
    if (isVoiceConversationMode.value) {
      speakText(cleanedReply)
    }
  })
  .catch(async err => {
    let errorText = ''
    if (err instanceof Response) {
      errorText = await err.text()
    } else {
      errorText = err?.message || JSON.stringify(err)
    }
    console.error('🔴 Assistant error dettagliato:', errorText)
    chat.messages.push({ from: 'bot', text: 'Errore nel recupero della risposta 😢' })
  })
  .finally(() => {
    isBotTyping.value = false
    botTypingStatus.value = ''
    saveChats()
  })


}

function archiveChat(chatId) {
  const index = chats.value.findIndex(c => c.id === chatId)
  if (index !== -1) {
    const wasArchived = chats.value[index].archived
    chats.value[index].archived = !chats.value[index].archived
    
    // Se la chat viene dearchiviata, selezionala automaticamente
    if (wasArchived && !chats.value[index].archived) {
      currentIndex.value = index
    }
    
    // Se la chat attualmente selezionata viene archiviata, deselezionala
    if (chats.value[currentIndex.value]?.id === chatId && !wasArchived) {
      currentIndex.value = null
    }
    saveChats()
  }
}

function deleteChat(chatId) {
  const index = chats.value.findIndex(c => c.id === chatId)
  if (index !== -1 && confirm('Vuoi eliminare questa chat?')) {
    chats.value.splice(index, 1)
    if (currentIndex.value === index) {
      currentIndex.value = null
    } else if (currentIndex.value > index) {
      currentIndex.value--
    }
    saveChats()
  }
}

function renameChat(event, chatId) {
  const newTitle = event.target.innerText.trim()
  const chat = chats.value.find(c => c.id === chatId)
  if (chat && newTitle !== '') {
    chat.title = newTitle
    saveChats()
  }
}

// Nuove funzioni per la modifica dei messaggi
function startEditingMessage(messageIndex) {
  if (currentIndex.value === null) return
  
  const message = chats.value[currentIndex.value].messages[messageIndex]
  if (message.from !== 'user') return // Solo messaggi utente possono essere modificati
  
  editingMessageIndex.value = messageIndex
  editingText.value = message.text
}

function cancelEditingMessage() {
  editingMessageIndex.value = null
  editingText.value = ''
}

async function saveEditedMessage() {
  if (currentIndex.value === null || editingMessageIndex.value === null) return
  
  const chat = chats.value[currentIndex.value]
  const messageIndex = editingMessageIndex.value
  const newText = editingText.value.trim()
  
  if (!newText) {
    cancelEditingMessage()
    return
  }
  
  // Aggiorna il messaggio dell'utente
  chat.messages[messageIndex].text = newText
  
  // Rimuovi tutti i messaggi successivi (incluse le risposte del bot)
  chat.messages = chat.messages.slice(0, messageIndex + 1)
  
  // Salva le modifiche
  saveChats()
  
  // Reset dello stato di editing
  cancelEditingMessage()
  
  // Invia il nuovo messaggio e genera una nuova risposta
  isBotTyping.value = true
  botTypingStatus.value = 'Invio messaggio modificato...'
  
  // Salva su Airtable il messaggio modificato
  saveToAirtable(chat.id, 'user', newText)
  
  // Funzione helper per aggiornare lo stato
  const updateStatus = (status) => {
    botTypingStatus.value = status
    console.log('🤖 Stato:', status)
  }

  try {
    const botReply = await getAssistantResponse(newText, updateStatus)
    updateStatus('Elaborando risposta...')
    const cleanedReply = cleanResponseText(botReply)
    chat.messages.push({ from: 'bot', text: cleanedReply })
    saveToAirtable(chat.id, 'bot', cleanedReply)
    
    if (isVoiceConversationMode.value) {
      speakText(cleanedReply)
    }
  } catch (err) {
    let errorText = ''
    if (err instanceof Response) {
      errorText = await err.text()
    } else {
      errorText = err?.message || JSON.stringify(err)
    }
    console.error('🔴 Assistant error dettagliato:', errorText)
    chat.messages.push({ from: 'bot', text: 'Errore nel recupero della risposta 😢' })
  } finally {
    isBotTyping.value = false
    botTypingStatus.value = ''
    saveChats()
  }
}

onMounted(async () => {
  if (chats.value.length === 0) {
    createChat()
    chats.value[0].messages.push({
      from: 'bot',
      text: '👋 Ciao! Come posso aiutarti oggi?'
    })
    saveChats()
  } else {
    currentIndex.value = chats.value.length - 1
  }
  
  // Pre-caricamento del thread per migliorare la velocità della prima risposta
  if (apiKey && assistantId) {
    try {
      await ensureThread()
      console.log('✅ Thread pre-caricato con successo')
    } catch (error) {
      console.warn('⚠️ Errore pre-caricamento thread:', error)
    }
  }
  
  // Add keyboard event listener for navigation
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keydown', handleGlobalKeydown)
  
  // Cleanup voice conversation
  if (isVoiceConversationMode.value) {
    stopConversationListening()
  }
})
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
    
    <div
      :class="[
        'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/20 text-white border border-cyan-400/50 shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-lg',
        isFullScreen 
          ? 'w-full h-full flex flex-col lg:flex-row' 
          : 'w-full max-w-6xl h-[85vh] sm:h-[90vh] rounded-xl sm:rounded-3xl p-2 sm:p-4 lg:p-6 flex flex-col shadow-cyan-500/25'
      ]"
    >
<!-- Sidebar (solo fullscreen) -->
<aside
  v-if="isFullScreen"
  class="w-full lg:w-1/3 xl:w-1/4 bg-gradient-to-b from-slate-900/90 to-purple-900/30 p-3 sm:p-4 lg:p-6 border-r border-cyan-400/30 overflow-y-auto backdrop-blur-sm max-h-[40vh] lg:max-h-full"
>
  <button
    @click="createChat"
    class="w-full mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-cyan-300 hover:to-blue-400 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/25"
  >
    <span class="flex items-center justify-center gap-1.5 sm:gap-2">
      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span class="hidden sm:inline">Nuova chat</span>
      <span class="sm:hidden">Nuova</span>
    </span>
  </button>
  <div class="relative mb-4 sm:mb-6">
    <input
      v-model="searchTerm"
      placeholder="Cerca chat..."
      class="w-full px-4 sm:px-6 py-2.5 sm:py-3 pl-9 sm:pl-12 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-cyan-400/30 text-cyan-100 text-xs sm:text-sm placeholder-cyan-300/60 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
    />
    <svg class="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-cyan-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  </div>
  
  <!-- Keyboard navigation hint -->
  <div class="mb-3 sm:mb-4 px-2 text-xs text-cyan-300/50 flex items-center gap-1.5">
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>Usa ↑↓ per navigare tra le chat</span>
  </div>

  <div class="space-y-2 sm:space-y-3">
    <template v-for="chat in activeChats" :key="chat.id">
      <div 
        @click="selectChat(chats.findIndex(c => c.id === chat.id))"
        :class="[
          'group flex justify-between items-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-sm',
          currentIndex !== null && chats[currentIndex]?.id === chat.id
            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/25 transform scale-[1.02]'
            : 'bg-gradient-to-r from-slate-800/60 to-purple-800/20 border border-slate-700/50 hover:from-slate-700/80 hover:to-purple-700/40 hover:border-cyan-400/50'
        ]"
      >
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click.stop
          :class="[
            'cursor-pointer outline-none transition-colors duration-300 flex-1 mr-2 sm:mr-3 text-xs sm:text-sm truncate',
            currentIndex !== null && chats[currentIndex]?.id === chat.id
              ? 'text-white font-medium'
              : 'text-cyan-100 group-hover:text-white'
          ]"
        >{{ chat.title }}</span>
        <div class="flex gap-2 sm:gap-3 text-base sm:text-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
          <span @click.stop="archiveChat(chat.id)" class="hover:text-yellow-400 transition-colors duration-200 cursor-pointer">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6 6-6"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18v2H3z"></path>
            </svg>
          </span>
          <span @click.stop="deleteChat(chat.id)" class="hover:text-red-400 transition-colors duration-200 cursor-pointer">
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </span>
        </div>
      </div>
    </template>

    <hr class="my-3 sm:my-4 border-cyan-400/30 opacity-30" />
    <div class="text-xs text-cyan-300/60 font-medium tracking-wider uppercase px-1 sm:px-2 flex items-center gap-1.5 sm:gap-2">
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6 6-6"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18v2H3z"></path>
      </svg>
      Archiviate
    </div>

    <template v-for="chat in archivedChats" :key="chat.id">
      <div 
        @click="selectChat(chats.findIndex(c => c.id === chat.id))"
        :class="[
          'group flex justify-between items-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-sm opacity-75',
          currentIndex !== null && chats[currentIndex]?.id === chat.id
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/15 transform scale-[1.02] opacity-90'
            : 'bg-gradient-to-r from-slate-800/40 to-purple-800/10 border border-slate-700/30 hover:from-slate-700/60 hover:to-purple-700/30 hover:border-cyan-400/30'
        ]"
      >
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click.stop
          :class="[
            'cursor-pointer outline-none transition-colors duration-300 flex-1 mr-2 sm:mr-3 text-xs sm:text-sm truncate',
            currentIndex !== null && chats[currentIndex]?.id === chat.id
              ? 'text-cyan-100 font-medium'
              : 'text-cyan-200/80 group-hover:text-cyan-100'
          ]"
        >{{ chat.title }}</span>
        <div class="flex gap-2 sm:gap-3 text-base sm:text-lg opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex-shrink-0">
          <span @click.stop="archiveChat(chat.id)" class="hover:text-cyan-400 transition-colors duration-200 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l3-3 3 3"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 20h18v-2H3z"></path>
            </svg>
          </span>
          <span @click.stop="deleteChat(chat.id)" class="hover:text-red-400 transition-colors duration-200 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </span>
        </div>
      </div>
    </template>
  </div>
</aside>

      <!-- Chat Area -->
      <section :class="[isFullScreen ? 'w-full lg:w-2/3 xl:w-3/4 p-2 sm:p-4 lg:p-6' : 'w-full']" class="flex flex-col flex-1 min-h-0">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-slate-800/30 to-purple-800/20 rounded-xl sm:rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h2 class="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              <span class="hidden sm:inline">
                {{ isFullScreen && currentIndex !== null && chats[currentIndex] ? chats[currentIndex].title : 'Ask everything you want' }}
              </span>
              <span class="sm:hidden">
                {{ isFullScreen && currentIndex !== null && chats[currentIndex] ? 
                   (chats[currentIndex].title.length > 20 ? chats[currentIndex].title.slice(0, 20) + '...' : chats[currentIndex].title) : 
                   'AI Chat' }}
              </span>
            </h2>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button
              @click="toggleChatFullScreen"
              class="text-xs sm:text-sm px-3 sm:px-4 lg:px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-xl sm:rounded-2xl font-bold shadow-lg hover:from-cyan-300 hover:to-blue-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-1 sm:gap-2"
            >
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="isFullScreen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5M15 15l5.5 5.5"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.5 3.5l17 17M21 12h-8m8 0l-3 3m3-3l-3-3"></path>
              </svg>
              <span class="hidden sm:inline">{{ isFullScreen ? 'Riduci' : 'Fullscreen' }}</span>
              <span class="sm:hidden">{{ isFullScreen ? 'Fullscreen' : 'Riduci' }}</span>
            </button>
            
            <!-- Pulsante Disattiva Chat Vocale -->
            <button
              v-if="isVoiceConversationMode"
              @click="toggleVoiceConversation"
              class="text-xs sm:text-sm px-3 sm:px-4 lg:px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:from-purple-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 flex items-center gap-1 sm:gap-2 border border-purple-400/30"
            >
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              <span class="hidden sm:inline">Stop Vocale</span>
              <span class="sm:hidden">Stop</span>
            </button>
            
            <button
              @click="toggleModal"
              class="text-xs sm:text-sm px-3 sm:px-4 lg:px-6 py-2 bg-slate-700/50 text-cyan-100 rounded-xl sm:rounded-2xl hover:bg-slate-600/60 hover:text-white transition-all duration-300 border border-slate-600/50 flex items-center gap-1 sm:gap-2"
            >
              <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="hidden sm:inline">Chiudi</span>
            </button>
          </div>
        </div>

        <!-- Errore di configurazione -->
        <div v-if="configurationError" class="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-sm">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="font-semibold text-red-300 mb-2">Errore di Configurazione</p>
              <p class="text-sm text-red-200 mb-3">{{ configurationError }}</p>
              <p class="text-xs text-red-300/80">
                Le variabili d'ambiente necessarie non sono configurate correttamente. 
                Verifica la configurazione su Netlify nelle impostazioni del sito > Environment variables.
              </p>
            </div>
          </div>
        </div>

        <!-- Messaggi -->
        <div class="flex-1 overflow-y-auto mb-4 sm:mb-6 space-y-3 sm:space-y-4 px-1 sm:px-2 min-h-0" 
             :class="isFullScreen ? 'max-h-[50vh] lg:max-h-[60vh]' : 'max-h-[45vh] sm:max-h-[55vh]'" 
             v-if="currentIndex !== null">
          <div
            v-for="(msg, i) in chats[currentIndex].messages"
            :key="i"
            class="text-xs sm:text-sm flex animate-fade-in-up"
            :class="msg.from === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div class="relative group max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]">
              <!-- Messaggio normale -->
              <div
                v-if="editingMessageIndex !== i"
                :class="[
                  'px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm relative break-words',
                  msg.from === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/25'
                    : 'bg-gradient-to-br from-slate-700 to-slate-600 text-cyan-100 shadow-slate-500/25 border border-slate-600/50'
                ]"
              >
                <div class="relative z-10 leading-relaxed">
                  {{ msg.from === 'bot' ? cleanResponseText(msg.text) : msg.text }}
                </div>
                <!-- Piccolo triangolo per la bolla -->
                <div 
                  :class="[
                    'absolute top-2 sm:top-3 w-0 h-0',
                    msg.from === 'user' 
                      ? 'right-[-6px] sm:right-[-8px] border-l-[6px] sm:border-l-[8px] border-l-cyan-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent'
                      : 'left-[-6px] sm:left-[-8px] border-r-[6px] sm:border-r-[8px] border-r-slate-700 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent'
                  ]"
                ></div>
              </div>
              
              <!-- Modalità editing -->
              <div
                v-if="editingMessageIndex === i"
                class="bg-gradient-to-br from-slate-800 to-purple-800/30 border-2 border-cyan-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm"
              >
                <textarea
                  v-model="editingText"
                  @keydown.enter.prevent="saveEditedMessage"
                  @keydown.escape="cancelEditingMessage"
                  class="w-full bg-transparent text-cyan-100 placeholder-cyan-300/60 resize-none outline-none text-sm sm:text-base leading-relaxed min-h-[60px]"
                  placeholder="Modifica il tuo messaggio..."
                  rows="3"
                ></textarea>
                <div class="flex gap-2 mt-3 justify-end">
                  <button
                    @click="cancelEditingMessage"
                    class="px-3 py-1.5 text-xs bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-500/60 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    @click="saveEditedMessage"
                    class="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-colors font-medium"
                  >
                    Salva e Rimanda
                  </button>
                </div>
              </div>
              
              <!-- Pulsante di modifica (solo per messaggi utente) -->
              <button
                v-if="msg.from === 'user' && editingMessageIndex !== i && !isBotTyping"
                @click="startEditingMessage(i)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                title="Modifica messaggio"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Indicator "Sta scrivendo..." SOLO se il bot sta rispondendo -->
          <div v-if="isBotTyping && currentIndex !== null" class="text-xs sm:text-sm flex justify-start animate-fade-in-up">
            <div class="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 text-cyan-100 max-w-[85%] sm:max-w-[75%] lg:max-w-[60%] animate-pulse shadow-lg shadow-slate-500/25 mr-2 sm:mr-4 border border-slate-600/50 relative">
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span class="text-xs sm:text-sm">{{ botTypingStatus || 'Sta scrivendo...' }}</span>
              </div>
              <div class="absolute left-[-6px] sm:left-[-8px] top-2 sm:top-3 w-0 h-0 border-r-[6px] sm:border-r-[8px] border-r-slate-700 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent"></div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="relative mt-auto px-1 sm:px-2 lg:px-4 py-2 sm:py-3 lg:py-4 flex-shrink-0">
          <div class="relative bg-gradient-to-r from-slate-800/50 to-purple-800/30 rounded-2xl sm:rounded-3xl border border-slate-600/50 backdrop-blur-sm shadow-xl p-1.5 sm:p-2">
            <input
              ref="inputRef"
              id="user-input"
              type="text"
              :placeholder="isVoiceConversationMode ? 'Modalità conversazione vocale attiva ' : 'Scrivi un messaggio...'"
              @keyup.enter="sendMessage"
              :disabled="isVoiceConversationMode"
              :class="[
                'w-full px-4 sm:px-6 py-3 sm:py-4 pr-16 sm:pr-20 bg-transparent rounded-2xl sm:rounded-3xl focus:outline-none text-sm sm:text-base font-medium resize-none transition-all duration-300',
                isVoiceConversationMode 
                  ? 'text-green-300 placeholder-green-400/60 cursor-not-allowed opacity-75' 
                  : 'text-cyan-100 placeholder-cyan-300/60'
              ]"
            />
            
            <div class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
              <!-- Pulsante per conversazione vocale -->
              <button
                @click="toggleVoiceConversation"
                :disabled="!speechRecognitionSupported"
                :class="[
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                  isVoiceConversationMode 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500' 
                    : 'bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
                ]"
                :title="isVoiceConversationMode ? 'Disattiva conversazione vocale' : 'Attiva conversazione vocale'"
              >
                <svg v-if="isVoiceConversationMode" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.121-2.121M6 6l2.121 2.121m0 0L5 12l3 3 4-4M18 12l-3-3-4 4"></path>
                </svg>
                <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
                
              </button>

              <!-- Pulsante per singolo messaggio vocale -->
              <button
                @click="toggleRecognition"
                :disabled="!speechRecognitionSupported || isVoiceConversationMode"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:from-purple-400 hover:to-pink-400 transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                :title="isVoiceConversationMode ? 'Modalità conversazione attiva' : 'Registra messaggio vocale'"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </button>

              <!-- Pulsante invio -->
              <button
                @click="sendMessage"
                :disabled="isVoiceConversationMode"
                :class="[
                  'w-16 h-8 sm:w-20 sm:h-10 rounded-xl sm:rounded-2xl text-slate-900 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 font-bold',
                  isVoiceConversationMode 
                    ? 'bg-gradient-to-br from-slate-500 to-slate-600 opacity-50 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400'
                ]"
                :title="isVoiceConversationMode ? 'Usa la voce per inviare messaggi' : 'Invia messaggio'"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2">
            <!-- Indicatore modalità conversazione vocale attiva -->
            <div v-if="isVoiceConversationMode" class="text-xs sm:text-sm text-green-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🎙️ Chat vocale attiva - Parla per inviare messaggi</span>
              <span class="sm:hidden">🎙️ Chat vocale attiva</span>
            </div>
            
            <!-- In ascolto (conversazione vocale) -->
            <div v-if="isListening && isVoiceConversationMode" class="text-xs sm:text-sm text-cyan-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🎤 Ti sto ascoltando...</span>
              <span class="sm:hidden">🎤 Ascolto...</span>
            </div>
            
            <!-- Riconoscimento singolo messaggio -->
            <div v-if="recognizing && !isVoiceConversationMode" class="text-xs sm:text-sm text-cyan-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🎤 Sto ascoltando...</span>
              <span class="sm:hidden">🎤 Ascolto...</span>
            </div>
            
            <!-- Sta parlando -->
            <div v-if="speaking" class="text-xs sm:text-sm text-cyan-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🔊 Sto leggendo la risposta...</span>
              <span class="sm:hidden">🔊 Leggo...</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modale Conversazione Vocale -->
    <div v-if="isVoiceConversationModalOpen" class="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/20 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-cyan-400/50 backdrop-blur-lg animate-fade-in-up">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
            <svg class="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Conversazione Vocale
          </h3>
          <p class="text-slate-300 text-sm leading-relaxed">
            Attiva la modalità conversazione vocale per parlare direttamente con l'AI
          </p>
        </div>

        <!-- Descrizione -->
        <div class="space-y-3 mb-8">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 border border-cyan-400/30">
              <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-white">Conversazione fluida</p>
              <p class="text-xs text-cyan-300/70">Parla e ricevi risposte vocali automaticamente</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 border border-blue-400/30">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-white">Riconoscimento automatico</p>
              <p class="text-xs text-cyan-300/70">L'AI inizia ad ascoltare dopo ogni risposta</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 border border-purple-400/30">
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-white">Risposte vocali</p>
              <p class="text-xs text-cyan-300/70">L'AI leggerà tutte le risposte ad alta voce</p>
            </div>
          </div>
        </div>

        <!-- Avviso -->
        <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-4 mb-8 backdrop-blur-sm">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-cyan-300 text-sm font-medium">Nota Importante</p>
              <p class="text-cyan-100/80 text-xs mt-1">
                In modalità conversazione vocale potrai comunicare SOLO tramite voce. La tastiera sarà disabilitata.
              </p>
            </div>
          </div>
        </div>

        <!-- Pulsanti -->
        <div class="flex gap-3">
          <button
            @click="closeVoiceConversationModal"
            class="flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/60 transition-all duration-300 text-sm font-medium border border-slate-600/50 hover:border-slate-500/70"
          >
            Annulla
          </button>
          <button
            @click="startVoiceConversation"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-xl hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 text-sm font-bold shadow-lg shadow-cyan-500/25 transform hover:scale-105"
          >
            Inizia Chat Vocale
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out both;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}

/* Scrollbar personalizzata */
::-webkit-scrollbar {
  width: 4px;
}

@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 6px;
  }
}

::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0891b2, #2563eb);
}

/* Effetto hover per le chat */
.group:hover {
  transform: translateY(-1px);
}

/* Effetto per la chat selezionata */
.scale-\[1\.02\] {
  animation: selectedChat 0.3s ease-out;
}

@keyframes selectedChat {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(6, 182, 212, 0.25);
  }
}

/* Glass effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .fixed {
    position: fixed !important;
  }
  
  /* Prevent zoom on input focus in iOS */
  input[type="text"] {
    font-size: 16px !important;
  }
  
  /* Better touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Prevent horizontal scroll */
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
}

/* Tablet optimizations */
@media (min-width: 640px) and (max-width: 1024px) {
  .group:hover {
    transform: translateY(-2px);
  }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
  .group:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.15);
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .border-gradient {
    border-width: 1px;
  }
}

/* Prevent text selection on buttons and interactive elements */
button, .cursor-pointer {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Focus styles for accessibility */
button:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

/* Textarea resize handle styling */
textarea {
  resize: vertical;
  min-height: 60px;
}

/* Edit button hover effects */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Animation for edit mode */
@keyframes editModeSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.border-cyan-400\/50 {
  animation: editModeSlideIn 0.3s ease-out;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgba(88 28 135, 0.2));
  }
}
</style>