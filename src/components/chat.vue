<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
// --- VOCALE ---
const isVoiceModalOpen = ref(false)
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

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'it-IT'

    // Seleziona la prima voce maschile italiana disponibile
    const voices = window.speechSynthesis.getVoices()
    const maleVoice = voices.find(v => v.lang === 'it-IT' && v.name.toLowerCase().includes('male')) 
      || voices.find(v => v.lang === 'it-IT' && v.name.toLowerCase().includes('luciano')) // esempio: voce "Luciano"
    
    if (maleVoice) {
      utterance.voice = maleVoice
    }

    utterance.onstart = () => speaking.value = true
    utterance.onend = () => speaking.value = false
    window.speechSynthesis.speak(utterance)
  }
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
const chats = ref(JSON.parse(localStorage.getItem(chatskey.value) || '[]'))
const currentIndex = ref(null)
const isBotTyping = ref(false)
const isVoiceMode = ref(true)

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
const assistantId = import.meta.env.VITE_OPENAI_ASSISTANT_ID
const airtableKey = import.meta.env.VITE_AIRTABLE_API_KEY
const airtableBase = import.meta.env.VITE_AIRTABLE_BASE_ID
const airtableTable = import.meta.env.VITE_AIRTABLE_TABLE_NAME
let threadId = null

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

async function getAssistantResponse(userText) {
  const commonHeaders = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  }

  if (!threadId) {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: commonHeaders
    })

    if (!threadRes.ok) {
      const error = await threadRes.text()
      console.error('🔴 Errore nella creazione del thread:', error)
      throw new Error('Errore creazione thread')
    }

    const threadData = await threadRes.json()
    threadId = threadData.id
  }

  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      role: 'user',
      content: userText
    })
  })

  const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ assistant_id: assistantId })
  })

  const runData = await runRes.json()
  let status = 'queued'

  while (status !== 'completed' && status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const poll = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
      headers: commonHeaders
    })
    const pollData = await poll.json()
    status = pollData.status
  }

  const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: commonHeaders
  })

  const msgData = await msgRes.json()
  const last = msgData.data.find(m => m.role === 'assistant')
  return last?.content?.[0]?.text?.value || '(nessuna risposta)'
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

  if (currentIndex.value === null) {
    const newChat = {
      id: Date.now(),
      title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      messages: [],
      archived: false
    }
    chats.value.push(newChat)
    currentIndex.value = chats.value.length - 1
    gotoChatUrl()
  }

  const chat = chats.value[currentIndex.value]
  chat.messages.push({ from: 'user', text })
  saveToAirtable(chat.id, 'user', text)
  const placeholderIndex = chat.messages.push({ from: 'bot', text: '⌛ Sta scrivendo...' }) - 1
  inputRef.value.value = ''
  saveChats()

  getAssistantResponse(text)
  .then(botReply => {
    chat.messages[placeholderIndex].text = botReply
    saveToAirtable(chat.id, 'bot', botReply)
if (isVoiceMode.value) {
  speakText(botReply)
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
    chat.messages[placeholderIndex].text = 'Errore nel recupero della risposta 😢'
  })
  .finally(() => {
    saveChats()
  })


}

function archiveChat(chatId) {
  const index = chats.value.findIndex(c => c.id === chatId)
  if (index !== -1) {
    chats.value[index].archived = !chats.value[index].archived
    if (chats.value[currentIndex.value]?.id === chatId) {
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

onMounted(() => {
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
})
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
    
    <div
      :class="[
        'bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/20 text-white border border-gradient shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-lg',
        isFullScreen 
          ? 'w-full h-full flex flex-col lg:flex-row' 
          : 'w-full max-w-6xl h-[85vh] sm:h-[90vh] rounded-xl sm:rounded-3xl p-2 sm:p-4 lg:p-6 flex flex-col shadow-cyan-500/25'
      ]"
      style="border-image: linear-gradient(135deg, #6dd5fa, #2980b9, #6dd5fa) 1;"
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

  <div class="space-y-2 sm:space-y-3">
    <template v-for="chat in activeChats" :key="chat.id">
      <div class="group flex justify-between items-center bg-gradient-to-r from-slate-800/60 to-purple-800/20 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl hover:from-slate-700/80 hover:to-purple-700/40 transition-all duration-300 border border-slate-700/50 hover:border-cyan-400/50 cursor-pointer backdrop-blur-sm">
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click="selectChat(chats.value.findIndex(c => c.id === chat.id))"
          class="cursor-pointer outline-none text-cyan-100 group-hover:text-white transition-colors duration-300 flex-1 mr-2 sm:mr-3 text-xs sm:text-sm truncate"
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

    <hr class="my-3 sm:my-4 border-gradient opacity-30" />
    <div class="text-xs text-cyan-300/60 font-medium tracking-wider uppercase px-1 sm:px-2 flex items-center gap-1.5 sm:gap-2">
      <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6 6-6"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18v2H3z"></path>
      </svg>
      Archiviate
    </div>

    <template v-for="chat in archivedChats" :key="chat.id">
      <div class="group flex justify-between items-center bg-gradient-to-r from-slate-800/40 to-purple-800/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl hover:from-slate-700/60 hover:to-purple-700/30 transition-all duration-300 border border-slate-700/30 hover:border-cyan-400/30 cursor-pointer backdrop-blur-sm opacity-75">
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click="selectChat(chats.value.findIndex(c => c.id === chat.id))"
          class="cursor-pointer outline-none text-cyan-200/80 group-hover:text-cyan-100 transition-colors duration-300 flex-1 mr-2 sm:mr-3 text-xs sm:text-sm truncate"
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
              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h2 class="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              <span class="hidden sm:inline">Ask everything you want</span>
              <span class="sm:hidden">AI Chat</span>
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
              <span class="sm:hidden">{{ isFullScreen ? '🔲' : '⛶' }}</span>
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
            <div
              :class="[
                'px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm relative break-words',
                msg.from === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 ml-2 sm:ml-4 max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]'
                  : 'bg-gradient-to-br from-slate-700 to-slate-600 text-cyan-100 shadow-slate-500/25 mr-2 sm:mr-4 border border-slate-600/50 max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]'
              ]"
            >
              <div class="relative z-10 leading-relaxed">{{ msg.text }}</div>
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
                <span class="text-xs sm:text-sm">Sta scrivendo...</span>
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
              placeholder="Scrivi un messaggio..."
              @keyup.enter="sendMessage"
              class="w-full px-4 sm:px-6 py-3 sm:py-4 pr-16 sm:pr-20 bg-transparent text-cyan-100 rounded-2xl sm:rounded-3xl placeholder-cyan-300/60 focus:outline-none text-sm sm:text-base font-medium resize-none"
            />
            
            <div class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
              <button
                @click="toggleRecognition"
                :disabled="!speechRecognitionSupported"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:from-purple-400 hover:to-pink-400 transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </button>

              <button
                @click="sendMessage"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900 flex items-center justify-center shadow-lg hover:from-cyan-300 hover:to-blue-400 transform hover:scale-110 transition-all duration-300 font-bold"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2">
            <div v-if="recognizing" class="text-xs sm:text-sm text-cyan-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🎤 Sto ascoltando...</span>
              <span class="sm:hidden">🎤 Ascolto...</span>
            </div>
            <div v-if="speaking" class="text-xs sm:text-sm text-cyan-400 flex items-center gap-2 animate-pulse px-1 sm:px-2">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping"></div>
              <span class="hidden sm:inline">🔊 Sto leggendo la risposta...</span>
              <span class="sm:hidden">🔊 Leggo...</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Gradient border animation */
@keyframes gradientBorder {
  0% { border-image-source: linear-gradient(135deg, #6dd5fa, #2980b9, #6dd5fa); }
  25% { border-image-source: linear-gradient(135deg, #2980b9, #6dd5fa, #2980b9); }
  50% { border-image-source: linear-gradient(135deg, #6dd5fa, #2980b9, #6dd5fa); }
  75% { border-image-source: linear-gradient(135deg, #2980b9, #6dd5fa, #2980b9); }
  100% { border-image-source: linear-gradient(135deg, #6dd5fa, #2980b9, #6dd5fa); }
}

.border-gradient {
  border: 2px solid;
  border-image: linear-gradient(135deg, #6dd5fa, #2980b9, #6dd5fa) 1;
  animation: gradientBorder 3s ease-in-out infinite;
}

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
button:focus-visible, input:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, rgb(15 23 42), rgb(30 41 59), rgba(88 28 135, 0.2));
  }
}
</style>