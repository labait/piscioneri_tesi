<script setup>
import { ref, onMounted } from 'vue'
import Embed from './components/embed.vue'

const chatOpen = ref(true)
const showModal = ref(false)

const toggleChat = () => {
  chatOpen.value = !chatOpen.value
}

const toggleModal = () => {
  showModal.value = !showModal.value
}

const sendMessage = () => {
  const input = document.getElementById('user-input')
  if (!input) return

  const message = input.value.trim()
  if (!message) return

  // Recupera le chat salvate o inizializza vuoto
  const existingChats = JSON.parse(localStorage.getItem('lumynChats') || '[]')

  // Nuova chat con ID univoco
  const newChat = {
    id: Date.now(),
    title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
    messages: [message]
  }

  existingChats.push(newChat)
  localStorage.setItem('lumynChats', JSON.stringify(existingChats))

  // Apri pagina chat
  window.open('/public/Chat.html', '_blank') 

  // Pulisce input
  input.value = ''

  // Chiude modale
  toggleModal()
}

onMounted(() => {
  const input = document.getElementById('user-input')
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        sendMessage()
      }
    })
  }
})

const activeIndex = ref(0)
const toggleAccordion = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const items = [
  {
    title: 'Lorem',
    description: 'Durante la consulenza analizzeremo...'
  },
  { title: 'Lorem' },
  { title: 'Lorem' },
  { title: 'Lorem' },
  { title: 'Lorem' },
  { title: 'Lorem' }
]
</script>



<template>

  <!-- NAVBAR -->
  <header :class="['w-full', 'bg-gradient-to-r', 'from-[#0b001a]', 'to-[#0f0025]', 'px-6', 'py-4', 'shadow-md', 'z-50', 'font-text']">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <img src="/images/L.png" alt="Lumyn Logo" class="h-10 w-auto" />
      <nav class="flex flex-wrap gap-4 text-sm md:text-base">
        <a href="#service" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">service</a>
        <a href="#case-studies" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">case studies</a>
        <a href="#thinking" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">thinking</a>
        <a href="#pricing" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">pricing</a>
        <a href="#about-us" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">about us</a>
        <a href="#contact" class="px-4 py-2 border border-cyan-400 rounded-full  text-white hover:bg-cyan-400 hover:text-black transition">become our client</a>
      </nav>
    </div>
  </header>
  
  
  
  <main class="bg-gradient-to-b from-[#0b001a] to-[#0f0025] min-h-screen text-white font-text">
    <!-- HERO SECTION -->
    <section class="relative py-32 px-6 md:px-20 overflow-hidden">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div class="z-10 text-center md:text-left">
          <h3 class="text-lg md:text-xl text-white mb-2 font-medium">Chatbot</h3>
          <h1 class="text-6xl md:text-9xl font-extrabold mb-6 tracking-tight font-title">Lumyn</h1>
          <div class="flex flex-col md:flex-row items-center md:items-start gap-4 mt-8">
            <a href="#contact" class="px-6 py-3 bg-[#8a00ff] hover:bg-[#b066ff] text-white rounded-full text-sm shadow-md transition">
              your chat
            </a>
          </div>
        </div>
        <div class="relative">
          <img src="/images/hero.png" alt="Hero" class="w-full max-w-lg mx-auto md:mx-0 animate-float" />
        </div>
      </div>
      <div class="absolute left-6 bottom-6 text-white text-sm opacity-70 flex items-center gap-2">
        <span>scroll down</span>
        <span class="w-16 h-px bg-white block"></span>
        <span class="rotate-90 text-xl">➤</span>
      </div>
    </section>
    
    <!-- SEZIONE LANDING -->
    <section id="landing" class="min-h-screen py-20 px-6 md:px-20">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-8">Benvenuto su Lumyn</h2>
        <p class="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          Il nostro obiettivo è semplificare il tuo business grazie all'intelligenza artificiale. Scopri come possiamo supportare la tua crescita digitale.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">Automazione</h3>
            <p class="text-gray-400">Riduci i tempi e migliora l'efficienza automatizzando le operazioni ripetitive con i nostri chatbot intelligenti.</p>
          </div>
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">Supporto 24/7</h3>
            <p class="text-gray-400">Offri assistenza continua ai tuoi clienti grazie a soluzioni AI sempre attive e personalizzabili.</p>
          </div>
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">Integrazione facile</h3>
            <p class="text-gray-400">Implementa la nostra tecnologia su qualsiasi piattaforma digitale, in pochi semplici passaggi.</p>
          </div>
        </div>
        <div class="mt-16">
          <a href="#contact" class="inline-block px-8 py-4 bg-[#8a00ff] hover:bg-[#b066ff] text-white font-semibold rounded-full shadow-md transition-colors">
            Contattaci ora
          </a>
        </div>
      </div>
    </section>
    
    <!-- SEZIONE SERVICE -->
    <section id="service" class="py-20 px-6 md:px-20 text-white font-text">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-3xl md:text-4xl font-title px-6 py-2 rounded-md shadow">
            Service
          </div>
          <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base">
            Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
          v-for="n in 4"
          :key="n"
          class="bg-black rounded-2xl border border-cyan-400 p-6 flex items-center justify-between hover:scale-105 transition-transform"
          >
          <div class="flex flex-col items-start">
            <div class="bg-white text-black font-bold inline-block px-2 py-1 rounded mb-4 font-title text-xl">
              Plus One
            </div>
            <div class="flex flex-col items-center text-white/80 text-sm mt-4">
              <div class="w-10 h-10 flex items-center justify-center rounded-full border border-[#6dd5fa] bg-[#1a1a2e] mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#6dd5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span>3 parole chiave</span>
            </div>
          </div>
          <img src="/images/service-img.png" alt="Service Visual" class="w-36 object-contain" />
        </div>
      </div>
    </div>
  </section>
  
  <!-- SEZIONE CALL TO ACTION -->
  <section class="px-4 sm:px-6 md:px-10 lg:px-16 py-16">
    <div class="max-w-7xl mx-auto bg-black border border-[#6dd5fa] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
      <!-- Testo -->
      <div>
        <h2 class="text-2xl md:text-3xl font-title mb-4">Let’s make things happen</h2>
        <p class="text-sm md:text-base text-white/80 mb-6 max-w-md">
          Chat right now to become a professional e-commerce creator
        </p>
        <button
        onclick="window.lumyn.toggleChat()"
        class="bg-[#6dd5fa] hover:bg-[#aee8fd] text-black font-bold px-6 py-3 rounded-md shadow-md transition"
        >
        Chat now
      </button>
    </div>
  </div>
</section>

<!-- SEZIONE CASE STUDIES -->
<section id="case-studies" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto">
    <!-- Intestazione -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
      <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-3xl md:text-4xl font-title px-6 py-2 rounded-md shadow">
        Case Studies
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base leading-snug">
        s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unkno
      </p>
    </div>
    
    <!-- Blocco nero con bordo azzurro -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-8">
      <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20 text-sm text-white">
        <!-- Card 1 -->
        <div class="pb-6 md:pb-0 md:pr-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">Caso studio</h4>
          <p>
            For a local restaurant, we implemented a targeted PPC campaign that resulted in a 50% increase in website traffic and a 25% increase in sales.
          </p>
        </div>
        
        <!-- Card 2 -->
        <div class="py-6 md:py-0 md:px-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">Caso studio</h4>
          <p>
            For a local restaurant, we implemented a targeted PPC campaign that resulted in a 50% increase in website traffic and a 25% increase in sales.
          </p>
        </div>
        
        <!-- Card 3 -->
        <div class="pt-6 md:pt-0 md:pl-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">Caso studio</h4>
          <p>
            For a local restaurant, we implemented a targeted PPC campaign that resulted in a 50% increase in website traffic and a 25% increase in sales.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SEZIONE THINKING -->
<section id="thinking" class="py-20 px-6 md:px-20 font-text text-white">
  <div class="max-w-6xl mx-auto">
    <!-- Titolo -->
    <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-2xl md:text-3xl font-title px-6 py-2 rounded-md shadow mb-10">
      Our thinking about accessibility
    </div>
    
    <!-- Accordion -->
    <div class="space-y-4">
      <div
      v-for="(item, index) in items"
      :key="index"
      class="rounded-2xl border border-[#6dd5fa] transition-all overflow-hidden"
      :class="activeIndex === index ? 'bg-[#6dd5fa] text-black' : 'bg-black text-white'"
      >
      <div
      class="flex items-center justify-between px-6 py-4 cursor-pointer font-bold text-lg"
      @click="toggleAccordion(index)"
      >
      <span>{{ `0${index + 1}` }} {{ item.title }}</span>
      <span class="text-xl">{{ activeIndex === index ? '−' : '+' }}</span>
    </div>
    
    <!-- Contenuto -->
    <div v-if="activeIndex === index" class="px-6 pb-6 text-sm border-t border-black/30">
      {{ item.description }}
    </div>
  </div>
</div>
</div>
</section>

<!-- SEZIONE PRICING -->
<section id="pricing" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto text-center">
    <!-- Intestazione -->
    <div class="mb-12">
      <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-3xl md:text-4xl font-title px-6 py-2 rounded-md shadow">
        Pricing
      </div>
    </div>
    
    <!-- Box prezzi -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-10">
      <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#6dd5fa] text-white text-center gap-8">
        <!-- Piano 1 -->
        <div class="space-y-3">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Base</h4>
          <p class="text-white/80 text-sm">Lorem ipsum</p>
          <div class="text-3xl font-bold text-[#6dd5fa]">
            10.99<span class="text-base align-top">€</span><span class="text-sm font-normal ml-1">month</span>
          </div>
        </div>
        
        <!-- Piano 2 -->
        <div class="space-y-3 pt-6 md:pt-0">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Professional</h4>
          <p class="text-white/80 text-sm">Lorem ipsum</p>
          <div class="text-3xl font-bold text-[#6dd5fa]">
            20.99<span class="text-base align-top">€</span><span class="text-sm font-normal ml-1">month</span>
          </div>
        </div>
        
        <!-- Piano 3 -->
        <div class="space-y-3 pt-6 md:pt-0">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Advanced</h4>
          <p class="text-white/80 text-sm">Lorem ipsum</p>
          <div class="text-3xl font-bold text-[#6dd5fa]">
            30.99<span class="text-base align-top">€</span><span class="text-sm font-normal ml-1">month</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SEZIONE ABOUT US -->
<section id="about-us" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto">
    <!-- Intestazione -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
      <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-3xl md:text-4xl font-title px-6 py-2 rounded-md shadow">
        About us
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base leading-snug">
        Meet the skilled and experienced team behind our successful digital marketing strategies
      </p>
    </div>
    
    <!-- Card membri team -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
      v-for="n in 2"
      :key="n"
      class="bg-black border border-[#6dd5fa] rounded-3xl p-6 text-center space-y-4"
      >
      <div class="flex justify-center">
        <img src="/images/profile.png" alt="Andrea Piscioneri" class="w-24 h-24 rounded-full object-cover" />
      </div>
      <div>
        <h3 class="font-semibold text-white">Andrea Piscioneri</h3>
        <p class="text-white/70 text-sm">CEO and Founder</p>
      </div>
      <hr class="border-white/20 my-2" />
      <p class="text-sm text-white/80">
        10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy
      </p>
      <div class="flex justify-center gap-3">
        <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
          <span class="text-sm font-bold">in</span>
        </a>
        <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
          <span class="text-sm font-bold">in</span>
        </a>
        <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
          <span class="text-sm font-bold">in</span>
        </a>
      </div>
    </div>
  </div>
</div>
</section>

<!-- SEZIONE BECOME OUR CLIENT -->
<section id="contact" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto">
    <!-- Intestazione -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
      <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-2xl md:text-3xl font-title px-6 py-2 rounded-md shadow">
        Becoming client - Contact US!
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base leading-snug">
        Connect with Us: Let’s Discuss Your Digital Marketing Needs
      </p>
    </div>
    
    <!-- Form e immagine -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
      <!-- Form -->
      <div>
        <!-- Radio -->
        <div class="flex items-center space-x-6 mb-6">
          <label class="flex items-center space-x-2">
            <input type="radio" name="type" checked class="text-[#6dd5fa] focus:ring-[#6dd5fa]" />
            <span class="text-[#6dd5fa]">More information</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="radio" name="type" class="text-[#6dd5fa] focus:ring-[#6dd5fa]" />
            <span class="text-[#6dd5fa]">Buy a plan</span>
          </label>
        </div>
        
        <!-- Campi -->
        <form class="space-y-4">
          <div>
            <label class="block mb-1">Name</label>
            <input type="text" placeholder="Name" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" />
          </div>
          <div>
            <label class="block mb-1">Email*</label>
            <input type="email" placeholder="Email" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" />
          </div>
          <div>
            <label class="block mb-1">Message*</label>
            <textarea rows="4" placeholder="Message" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none"></textarea>
          </div>
          <button type="submit" class="w-full bg-[#6dd5fa] text-black font-semibold py-2 rounded-md hover:bg-[#aee8fd] transition">
            Send Message
          </button>
        </form>
      </div>
      
      <!-- Immagine -->
      <div class="hidden md:block">
        <img src="/images/lumyinback.png" alt="Bot Mascot" class="w-full h-auto" />
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-[#1a1a1a] text-white py-12 px-6 md:px-20 font-text rounded-t-3xl">
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
    <!-- Info contatto -->
    <div class="space-y-4">
      <h2 class="text-3xl font-title">Lumyn</h2>
      <div>
        <span class="inline-block bg-[#6dd5fa] text-[#0b001a] text-sm font-title px-4 py-1 rounded-md mb-2">Contact us:</span>
        <p>Email: andrypiscioneri@gmail.com</p>
        <p>Phone: 3755286241</p>
        <p>Address: Via Tribulina 22/a Bergamo (BG)</p>
      </div>
    </div>
    
    <!-- Form + Social -->
    <div class="space-y-6">
      <!-- Form -->
      <div class="bg-[#2c2c2c] p-4 rounded-xl flex items-center justify-between space-x-4">
        <input type="email" placeholder="Email" class="flex-1 bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" />
        <button class="bg-[#6dd5fa] hover:bg-[#aee8fd] text-black font-bold px-6 py-2 rounded-md transition font-title">
          Contact us!
        </button>
      </div>
      
      <!-- Social -->
      <div class="flex space-x-4">
        <a href="#" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] font-bold">in</a>
        <a href="#" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] font-bold">f</a>
        <a href="#" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] font-bold">@</a>
      </div>
    </div>
  </div>
  
  <hr class="my-8 border-white/20" />
  
  <div class="flex flex-col md:flex-row md:justify-between text-sm text-white/70">
    <p>© 2023 Lumyn. All Rights Reserved.</p>
    <div class="flex space-x-4">
      <a href="#" class="hover:text-white">Privacy Policy</a>
      <a href="#" class="hover:text-white">Cookies Policy</a>
    </div>
  </div>
</footer>
</main>

<Embed />
</template>


<style>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out both;
}

/* tutto il resto rimane scoped */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.font-text {
  font-family: 'Montserrat', sans-serif;
}

.font-title {
  font-family: 'Taygiacs', serif;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  transition: text-shadow 0.3s ease;
}

.font-title:hover {
  text-shadow: 0 0 10px #8a00ff, 0 0 20px #b066ff;
}

.chat {
  transition: all 0.3s ease-in-out;
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.nav-link {
  transition: all 0.3s ease-in-out;
}

.nav-link:hover {
  transform: translateY(-1px);
  text-shadow: 0 0 6px #6dd5fa;
}
</style>
