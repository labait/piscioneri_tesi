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
  <div v-if="showModal" class="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
    
    <div
      :class="[
        'bg-[#1a1a1a] text-white border border-[#6dd5fa] shadow-xl transition-all duration-300 overflow-hidden',
        isFullScreen ? 'w-full h-full flex flex-col md:flex-row' : 'max-w-5xl w-full rounded-3xl p-4 sm:p-6 flex flex-col'
      ]"
    >
<!-- Sidebar (solo fullscreen) -->
<aside
  v-if="isFullScreen"
  class="w-full md:w-1/3 bg-[#1a1a1a] md:bg-[#0f0025] p-4 border-r border-[#6dd5fa]/30 overflow-y-auto"
>
  <button
    @click="createChat"
    class="w-full mb-4 bg-[#6dd5fa] text-black font-semibold text-sm py-2 px-4 rounded-full hover:bg-[#aee8fd]"
  >
    + Nuova chat
  </button>
  <input
  v-model="searchTerm"
  placeholder="Cerca chat"
  class="w-full mb-4 px-4 py-2 rounded-full bg-[#1a1a1a] md:bg-[#1a0033] border border-[#6dd5fa] text-[#6dd5fa] text-sm placeholder-[#6dd5fa] focus:outline-none"
/>

  <div class="space-y-2">
    <template v-for="chat in activeChats" :key="chat.id">
      <div class="flex justify-between items-center bg-[#0f0025] p-2 rounded-xl hover:bg-[#1e0042]">
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click="selectChat(chats.value.findIndex(c => c.id === chat.id))"
          class="cursor-pointer outline-none"
        >{{ chat.title }}</span>
        <div class="flex gap-2 text-xl">
          <span @click.stop="archiveChat(chat.id)">📥</span>
          <span @click.stop="deleteChat(chat.id)">🗑️</span>
        </div>
      </div>
    </template>

    <hr class="my-2 border-[#6dd5fa]/30" />
    <div class="text-xs text-[#6dd5fa]/60">Archiviate</div>

    <template v-for="chat in archivedChats" :key="chat.id">
      <div class="flex justify-between items-center bg-[#0f0025] p-2 rounded-xl hover:bg-[#1e0042]">
        <span
          contenteditable
          @blur="renameChat($event, chat.id)"
          @click="selectChat(chats.value.findIndex(c => c.id === chat.id))"
          class="cursor-pointer outline-none"
        >{{ chat.title }}</span>
        <div class="flex gap-2 text-xl">
          <span @click.stop="archiveChat(chat.id)">📤</span>
          <span @click.stop="deleteChat(chat.id)">🗑️</span>
        </div>
      </div>
    </template>
  </div>
</aside>

      <!-- Chat Area -->
      <section :class="[isFullScreen ? 'w-full md:w-2/3 p-4 sm:p-6' : 'w-full']" class="flex flex-col flex-1">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <h2 class="text-lg sm:text-xl md:text-2xl font-title font-semibold text-[#6dd5fa]">Ask everything you want</h2>
          <div class="flex gap-2">
 

            <button
              @click="toggleChatFullScreen"
              class="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-[#6dd5fa] text-black rounded-full font-semibold shadow-md"
            >
              {{ isFullScreen ? '🞭 Riduci' : '⛶ Fullscreen' }}
            </button>
            <button
              @click="toggleModal"
              class="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-[#6dd5fa]/10 text-[#6dd5fa] rounded-full hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Messaggi -->
        <div class="flex-1 overflow-y-auto mb-6 space-y-4 max-h-[70vh] sm:max-h-[80vh]" v-if="currentIndex !== null">
          <div
            v-for="(msg, i) in chats[currentIndex].messages"
            :key="i"
            class="text-sm flex"
            :class="msg.from === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              :class="[
                'px-4 py-2 rounded-xl max-w-[80%] sm:max-w-xs',
                msg.from === 'user'
                  ? 'bg-black border border-[#6dd5fa] text-white'
                  : 'bg-[#6dd5fa] text-black'
              ]"
            >
              {{ msg.text }}
            </div>
<!-- Indicator "Sta scrivendo..." SOLO se il bot sta rispondendo -->
<div v-if="isBotTyping && currentIndex !== null" class="text-sm flex justify-start">
  <div class="px-4 py-2 rounded-xl bg-[#6dd5fa] text-black max-w-[80%] sm:max-w-xs animate-pulse">
    ⌛ Sta scrivendo...
  </div>
</div>
          </div>
        </div>

        <!-- Input -->
        <div class="relative mt-auto px-2 sm:px-4 py-4">
          <input
            ref="inputRef"
            id="user-input"
            type="text"
            placeholder="Scrivi un messaggio..."
            @keyup.enter="sendMessage"
            class="w-full px-5 py-2 sm:px-6 sm:py-3 pr-12 bg-transparent border border-[#6dd5fa] text-[#6dd5fa] rounded-full placeholder-[#6dd5fa] focus:outline-none text-sm sm:text-base"
          />
          
          <button
  @click="toggleRecognition"
  :disabled="!speechRecognitionSupported"
  class="absolute right-12 sm:right-16 top-1/2 -translate-y-1/2 text-[#6dd5fa]"
>
  🎙️
</button>

<div v-if="recognizing" class="text-xs text-[#6dd5fa] mt-2 animate-pulse">🎤 Sto ascoltando...</div>
<div v-if="speaking" class="text-xs text-[#6dd5fa] mt-2 animate-pulse">🔊 Sto leggendo la risposta...</div>

          <button
            @click="sendMessage"
            class="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-[#6dd5fa] h-6 w-6 flex items-center justify-center"
          >
            ➤
          </button>
        </div>
      </section>
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
  animation: fade-in-up 0.5s ease-out both;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

</style>