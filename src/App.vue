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
    title: 'Initial Accessibility Review',
    description: 'We’ll begin by analyzing your digital product to identify accessibility barriers. You’ll get a clear overview of what can be improved to make your platform more inclusive.'
  },
  {
    title: 'Visual Accessibility',
    description: 'We focus on contrast, text size, visual hierarchy, and color use to ensure content is readable and accessible to users with visual impairments or color blindness.'
  },
  {
    title: 'Keyboard Navigation',
    description: 'We ensure that interfaces are fully operable using only a keyboard, supporting users with motor disabilities and those using screen readers.'
  },
  {
    title: 'User Testing with Real People',
    description: 'We include users with visual, auditory, and cognitive impairments in our testing to uncover real-world issues that automated tools might miss.'
  },
  {
    title: 'Compliance & Guidelines',
    description: 'We help you meet global accessibility standards such as WCAG and ADA, and support your path to accessibility certification.'
  },
  {
    title: 'Inclusive Design Approach',
    description: 'From the first sketch to the final product, we design with inclusivity in mind—creating interfaces that are intuitive, clear, and accessible to everyone.'
  }
]

  const selectedType = ref('more') // default

  const handleRadioChange = (value) => {
    selectedType.value = value
  }

  const isMenuOpen = ref(false)

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

</script>



<template>
  <!-- NAVBAR -->
  <header class="w-full bg-gradient-to-r from-[#0b001a] to-[#0f0025] px-6 py-4 shadow-md z-50 font-text">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <img src="/images/L.png" alt="Lumyn Logo" class="h-10 w-auto z-50" />

      <!-- Desktop NAV (stile originale) -->
      <nav class="hidden lg:flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base">
        <a
          href="#service"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >Service</a>
        <a
          href="#case-studies"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >Case Studies</a>
        <a
          href="#thinking"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >Thinking</a>
        <a
          href="#pricing"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >Pricing</a>
        <a
          href="#about-us"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >About Us</a>
        <a
          href="#contact"
          class="px-3 py-1.5 rounded-full border border-cyan-400 text-white bg-transparent hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow transition duration-300"
        >Book a Consultation</a>
      </nav>

      <!-- Hamburger Button -->
      <button @click="toggleMenu" class="lg:hidden z-50 relative w-8 h-8 flex flex-col justify-between items-center">
        <span :class="['block w-full h-0.5 bg-[#6dd5fa] transition-transform duration-300', isMenuOpen ? 'rotate-45 translate-y-2' : '']"></span>
        <span :class="['block w-full h-0.5 bg-[#6dd5fa] transition-opacity duration-300', isMenuOpen ? 'opacity-0' : '']"></span>
        <span :class="['block w-full h-0.5 bg-[#6dd5fa] transition-transform duration-300', isMenuOpen ? '-rotate-45 -translate-y-2' : '']"></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="fade">
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 bg-[#0f0025]/95 backdrop-blur-md z-40 flex flex-col items-center justify-center space-y-6 px-6"
      >
        <a @click="toggleMenu" href="#service" class="mobile-link">Service</a>
        <a @click="toggleMenu" href="#case-studies" class="mobile-link">Case Studies</a>
        <a @click="toggleMenu" href="#thinking" class="mobile-link">Thinking</a>
        <a @click="toggleMenu" href="#pricing" class="mobile-link">Pricing</a>
        <a @click="toggleMenu" href="#about-us" class="mobile-link">About Us</a>
        <a @click="toggleMenu" href="#contact" class="mobile-link">Book a Consultation</a>
      </div>
    </transition>
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
              Contact us
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
        <h2 class="text-4xl md:text-5xl font-bold mb-8">Welcome on Lumyn</h2>
        <p class="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          Our goal is to simplify your business through artificial intelligence. Discover how we can support your digital growth.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">Automation</h3>
            <p class="text-gray-400">Reduce time and improve efficiency by automating repetitive tasks with our intelligent chatbots.</p>
          </div>
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">24/7 support</h3>
            <p class="text-gray-400">Provide continuous support to your customers with always-on, customizable AI solutions.</p>
          </div>
          <div class="bg-[#1a0033] p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h3 class="text-2xl font-semibold mb-4">Easy integration</h3>
            <p class="text-gray-400">Implement our technology on any digital platform, in just a few simple steps.</p>
          </div>
        </div>
        <div class="mt-16">
          <a href="#contact" class="inline-block px-8 py-4 bg-[#8a00ff] hover:bg-[#b066ff] text-white font-semibold rounded-full shadow-md transition-colors">
            Contact us
          </a>
        </div>
      </div>
    </section>
    
<!-- SEZIONE SERVICE -->
<section id="service" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto">

    <!-- Titolo e Descrizione iniziale -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
      <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-3xl md:text-4xl font-title px-6 py-2 rounded-md shadow">
        Service
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base">
        Discover our customized solutions designed to accompany you in your digital growth. Each service is designed to meet specific needs, with a touch of innovation and simplicity.
      </p>
    </div>

    <!-- Box dei servizi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Box 1 -->
      <div class="bg-black rounded-2xl border border-cyan-400 p-6 flex items-center justify-between hover:scale-105 transition-transform">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-2 bg-white text-black font-bold px-3 py-1 rounded mb-4 font-title text-xl">
            Brand Strategy
            <div class="w-6 h-6 flex items-center justify-center rounded-full border border-[#6dd5fa] bg-[#1a1a2e]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-[#6dd5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div class="text-white/80 text-sm">Positioning, vision, identity</div>
        </div>
        <img src="/images/service-img.png" alt="Service Visual" class="w-36 object-contain" />
      </div>

      <!-- Box 2 -->
      <div class="bg-black rounded-2xl border border-cyan-400 p-6 flex items-center justify-between hover:scale-105 transition-transform">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-2 bg-white text-black font-bold px-3 py-1 rounded mb-4 font-title text-xl">
            UX Design
            <div class="w-6 h-6 flex items-center justify-center rounded-full border border-[#6dd5fa] bg-[#1a1a2e]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-[#6dd5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div class="text-white/80 text-sm">User journey, interface, wireframe</div>
        </div>
        <img src="/images/service-img.png" alt="Service Visual" class="w-36 object-contain" />
      </div>

      <!-- Box 3 -->
      <div class="bg-black rounded-2xl border border-cyan-400 p-6 flex items-center justify-between hover:scale-105 transition-transform">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-2 bg-white text-black font-bold px-3 py-1 rounded mb-4 font-title text-xl">
            Development
            <div class="w-6 h-6 flex items-center justify-center rounded-full border border-[#6dd5fa] bg-[#1a1a2e]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-[#6dd5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div class="text-white/80 text-sm">Web apps, landing pages, integrations</div>
        </div>
        <img src="/images/service-img.png" alt="Service Visual" class="w-36 object-contain" />
      </div>

      <!-- Box 4 -->
      <div class="bg-black rounded-2xl border border-cyan-400 p-6 flex items-center justify-between hover:scale-105 transition-transform">
        <div class="flex flex-col items-start">
          <div class="flex items-center gap-2 bg-white text-black font-bold px-3 py-1 rounded mb-4 font-title text-xl">
            Automation
            <div class="w-6 h-6 flex items-center justify-center rounded-full border border-[#6dd5fa] bg-[#1a1a2e]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-[#6dd5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div class="text-white/80 text-sm">CRM, workflows, marketing automations</div>
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
        A selection of real projects that demonstrate our approach, strategy, and results. Each case study highlights our focus on growth, creativity, and digital innovation.
      </p>
    </div>
    
    <!-- Blocco nero con bordo azzurro -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-8">
      <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20 text-sm text-white">

        <!-- Card 1 -->
        <div class="pb-6 md:pb-0 md:pr-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">E-commerce Revamp</h4>
          <p>
            We redesigned the UX and implemented a tailored SEO strategy for a fashion e-commerce brand. Within 3 months, conversions increased by 38% and bounce rate dropped by 22%.
          </p>
        </div>
        
        <!-- Card 2 -->
        <div class="py-6 md:py-0 md:px-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">SaaS Lead Generation</h4>
          <p>
            For a B2B SaaS startup, we developed an automated lead funnel via LinkedIn and email outreach, resulting in 400+ qualified leads and a 30% booking rate in 2 months.
          </p>
        </div>
        
        <!-- Card 3 -->
        <div class="pt-6 md:pt-0 md:pl-6">
          <h4 class="text-[#6dd5fa] font-semibold mb-3">Local Visibility Boost</h4>
          <p>
            We launched a geotargeted Google Ads campaign for a dental clinic. Appointment bookings grew by 45%, and the client now ranks top 3 in local search results.
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

<!-- SEZIONE PREZZI (modificata con call-to-action al posto dei prezzi) -->
<section id="pricing" class="py-20 px-6 md:px-20 font-text text-white">
  <div class="max-w-7xl mx-auto">
    
    <!-- Titolo -->
    <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-2xl md:text-3xl font-title px-6 py-2 rounded-md shadow mb-10">
      Tailored Plans for Your Needs
    </div>

    <!-- Box piani -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-10">
      <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#6dd5fa] text-white text-center gap-8">
        
        <!-- Piano 1 -->
        <div class="space-y-3">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Base</h4>
          <p class="text-white/80 text-sm">Ideal for individuals and small businesses looking to get started.</p>
          <a href="#contact" class="inline-block mt-2 bg-[#6dd5fa] text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#aee8fd] transition">
            Request a free consultation
          </a>
        </div>

        <!-- Piano 2 -->
        <div class="space-y-3 pt-6 md:pt-0">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Professional</h4>
          <p class="text-white/80 text-sm">Perfect for growing businesses that need custom strategies.</p>
          <a href="#contact" class="inline-block mt-2 bg-[#6dd5fa] text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#aee8fd] transition">
            Contact us for a quote
          </a>
        </div>

        <!-- Piano 3 -->
        <div class="space-y-3 pt-6 md:pt-0">
          <h4 class="text-[#6dd5fa] font-semibold capitalize">Advanced</h4>
          <p class="text-white/80 text-sm">Tailored for large companies with complex digital needs.</p>
          <a href="#contact" class="inline-block mt-2 bg-[#6dd5fa] text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#aee8fd] transition">
            Schedule a strategy call
          </a>
        </div>

      </div>
    </div>
  </div>
</section>


<!-- SEZIONE TEAM -->
<section id="team" class="py-20 px-6 md:px-20 font-text text-white">
  <div class="max-w-7xl mx-auto">
    <!-- Titolo -->
    <div class="inline-block bg-[#6dd5fa] text-[#0b001a] text-2xl md:text-3xl font-title px-6 py-2 rounded-md shadow mb-10">
      Meet Our Team
    </div>

    <!-- Card membri team -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- Membro 1 -->
      <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 text-center space-y-4">
        <div class="flex justify-center">
          <img src="/images/profile.png" alt="Andrea Piscioneri" class="w-24 h-24 rounded-full object-cover" />
        </div>
        <div>
          <h3 class="font-semibold text-white">Andrea Piscioneri</h3>
          <p class="text-white/70 text-sm">CEO and Founder</p>
        </div>
        <hr class="border-white/20 my-2" />
        <p class="text-sm text-white/80">
          10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy.
        </p>
        <div class="flex justify-center gap-3">
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">in</span>
          </a>
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">tw</span>
          </a>
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">gh</span>
          </a>
        </div>
      </div>

      <!-- Membro 2 -->
      <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 text-center space-y-4">
        <div class="flex justify-center">
          <img src="/public/images/DENANI-LOGO-WHITE.png" alt="Sofia Rinaldi" class="w-24 h-24 rounded-full object-cover" />
        </div>
        <div>
          <h3 class="font-semibold text-white">Denani S.R.L</h3>
          <p class="text-white/70 text-sm">Artigiani del digitale</p>
        </div>
        <hr class="border-white/20 my-2" />
        <p class="text-sm text-white/80">
          Enhance your company by making it visible, recognized and competitive even online
        </p>
        <div class="flex justify-center gap-3">
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">in</span>
          </a>
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">dr</span>
          </a>
          <a href="#" class="w-8 h-8 flex items-center justify-center border border-[#6dd5fa] rounded-full text-[#6dd5fa] hover:bg-[#6dd5fa] hover:text-black transition">
            <span class="text-sm font-bold">ig</span>
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
        {{ selectedType === 'more' ? 'Becoming client - Contact US!' : 'Book a Consultation' }}
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base leading-snug">
        {{ selectedType === 'more'
          ? "Connect with Us: Let’s Discuss Your Digital Marketing Needs"
          : "Choose your preferred date and book a call with us" }}
      </p>
    </div>

    <!-- Form e immagine -->
    <div class="bg-black border border-[#6dd5fa] rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
      <!-- FORM -->
      <div>
        <!-- Radio -->
        <div class="flex items-center space-x-6 mb-6">
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="more"
              class="text-[#6dd5fa] focus:ring-[#6dd5fa]"
              :checked="selectedType === 'more'"
              @change="handleRadioChange('more')"
            />
            <span class="text-[#6dd5fa]">More information</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              name="type"
              value="plan"
              class="text-[#6dd5fa] focus:ring-[#6dd5fa]"
              :checked="selectedType === 'plan'"
              @change="handleRadioChange('plan')"
            />
            <span class="text-[#6dd5fa]">Buy a plan</span>
          </label>
        </div>

        <!-- Form dinamico -->
        <form class="space-y-4">
          <div>
            <label class="block mb-1">Name*</label>
            <input type="text" placeholder="Name" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required />
          </div>
          <div>
            <label class="block mb-1">Surname*</label>
            <input type="text" placeholder="Surname" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required />
          </div>
          <div>
            <label class="block mb-1">Email*</label>
            <input type="email" placeholder="Email" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required />
          </div>
          <div>
            <label class="block mb-1">Phone*</label>
            <input type="tel" placeholder="Phone" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required />
          </div>

          <div v-if="selectedType === 'more'">
            <label class="block mb-1">Message*</label>
            <textarea rows="4" placeholder="Your message" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required></textarea>
          </div>

          <div v-else>
            <label class="block mb-1">Choose a date*</label>
            <input type="date" class="w-full bg-transparent border border-[#6dd5fa] text-white px-4 py-2 rounded-md outline-none" required />
          </div>

          <button type="submit" class="w-full bg-[#6dd5fa] text-black font-semibold py-2 rounded-md hover:bg-[#aee8fd] transition">
            {{ selectedType === 'more' ? 'Send Message' : 'Book Consultation' }}
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

      <a href="https://www.instagram.com/andreapiscioneri/" target="_blank" aria-label="Instagram" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.982.24 2.45.406.58.2.996.44 1.43.873.435.433.673.85.873 1.43.166.47.35 1.28.406 2.45.058 1.267.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.982-.406 2.45-.2.58-.44.996-.873 1.43-.433.435-.85.673-1.43.873-.47.166-1.28.35-2.45.406-1.267.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.982-.24-2.45-.406-.58-.2-.996-.44-1.43-.873-.435-.433-.673-.85-.873-1.43-.166-.47-.35-1.28-.406-2.45-.058-1.267-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.982.406-2.45.2-.58.44-.996.873-1.43.433-.435.85-.673 1.43-.873.47-.166 1.28-.35 2.45-.406 1.267-.058 1.65-.07 4.85-.07zm0-2.2c-3.28 0-3.688.012-4.973.07-1.29.058-2.178.252-2.947.54-.794.298-1.46.696-2.127 1.363s-1.066 1.333-1.364 2.127c-.287.77-.482 1.657-.54 2.947-.058 1.285-.07 1.693-.07 4.973s.012 3.688.07 4.973c.058 1.29.252 2.178.54 2.947.298.794.696 1.46 1.363 2.127s1.333 1.066 2.127 1.364c.77.287 1.657.482 2.947.54 1.285.058 1.693.07 4.973.07s3.688-.012 4.973-.07c1.29-.058 2.178-.252 2.947-.54.794-.298 1.46-.696 2.127-1.363s1.066-1.333 1.364-2.127c.287-.77.482-1.657.54-2.947.058-1.285.07-1.693.07-4.973s-.012-3.688-.07-4.973c-.058-1.29-.252-2.178-.54-2.947-.298-.794-.696-1.46-1.363-2.127s-1.333-1.066-2.127-1.364c-.77-.287-1.657-.482-2.947-.54-1.285-.058-1.693-.07-4.973-.07zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.662a1.44 1.44 0 110-2.88 1.44 1.44 0 010 2.88z"/>
        </svg>
      </a>

      <a href="https://www.facebook.com/profile.php?id=100076286341248" target="_blank" aria-label="Facebook" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] hover:bg-[#1877f2] hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10s-10 4.48-10 10c0 4.84 3.44 8.84 8 9.8v-6.93h-2.4v-2.87h2.4v-2.18c0-2.38 1.43-3.7 3.62-3.7 1.05 0 2.14.19 2.14.19v2.35h-1.21c-1.19 0-1.56.74-1.56 1.5v1.83h2.64l-.42 2.87h-2.22v6.93c4.56-.96 8-4.96 8-9.8z"/>
        </svg>
      </a>

      <a href="https://www.linkedin.com/in/andrea-piscioneri/" target="_blank" aria-label="LinkedIn" class="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#0b001a] hover:bg-[#0e76a8] hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.5c0-1.33-.03-3.04-1.85-3.04s-2.15 1.44-2.15 2.94v5.6h-3v-10h2.89v1.37h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.58z"/>
        </svg>
      </a>

    </div>

    </div>
  </div>
  
  <hr class="my-8 border-white/20" />
  
  <div class="flex flex-col md:flex-row md:justify-between text-sm text-white/70">
    <p>© 2023 Lumyn. All Rights Reserved.</p>
    <div class="flex space-x-4">
      <div class="hover:text-white">Privacy Policy</div>
      <div class="hover:text-white">Cookies Policy</div>
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

/* Mobile link style */
.mobile-link {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  transition: color 0.3s ease;
}
.mobile-link:hover {
  color: #6dd5fa;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>