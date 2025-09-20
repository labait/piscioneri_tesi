<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Embed from './components/embed.vue'

const chatOpen = ref(true)
const showModal = ref(false)
const showVideoModal = ref(false)
const isScrolled = ref(false)
const currentSection = ref('')
const parallaxOffset = ref(0)

const toggleChat = () => {
  chatOpen.value = !chatOpen.value
}

const openVideoModal = () => {
  showVideoModal.value = true
  document.body.style.overflow = 'hidden' // Prevent background scrolling
}

const closeVideoModal = () => {
  showVideoModal.value = false
  document.body.style.overflow = '' // Restore scrolling
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showVideoModal.value) {
    closeVideoModal()
  }
}

// Smooth scroll function
const smoothScrollTo = (element, duration = 1000) => {
  const targetPosition = element.offsetTop - 80
  const startPosition = window.pageYOffset
  const distance = targetPosition - startPosition
  let startTime = null

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const run = ease(timeElapsed, startPosition, distance, duration)
    window.scrollTo(0, run)
    if (timeElapsed < duration) requestAnimationFrame(animation)
  }

  function ease(t, b, c, d) {
    t /= d / 2
    if (t < 1) return c / 2 * t * t + b
    t--
    return -c / 2 * (t * (t - 2) - 1) + b
  }

  requestAnimationFrame(animation)
}

// Handle scroll effects
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  parallaxOffset.value = window.scrollY * 0.5
  
  // Update current section for navigation
  const sections = document.querySelectorAll('section[id]')
  const scrollPos = window.scrollY + 100
  
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      currentSection.value = section.id
    }
  })
}

// Intersection Observer for animations
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  }, { threshold: 0.1 })

  // Observe all animatable elements
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el)
  })
}

onMounted(() => {
  const input = document.getElementById('user-input')
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        // sendMessage() // Commented out since function doesn't exist
      }
    })
  }
  
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown)
  setTimeout(observeElements, 100) // Delay to ensure DOM is ready
  setTimeout(initCountUpAnimations, 500) // Initialize count-up animations
  initParallaxEffects()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('menu-open')
})

// Count up animation for stats
const initCountUpAnimations = () => {
  const countElements = document.querySelectorAll('.count-up')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target)
        animateValue(entry.target, 0, target, 2000)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })
  
  countElements.forEach(el => observer.observe(el))
}

const animateValue = (element, start, end, duration) => {
  let startTimestamp = null
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const value = Math.floor(progress * (end - start) + start)
    element.innerText = end === 99 ? value + '%' : value + (end === 24 ? '/7' : '+')
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
}

// Enhanced parallax effects
const initParallaxEffects = () => {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('.parallax-element')
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5
      const yPos = -(scrolled * speed)
      element.style.transform = `translateY(${yPos}px)`
    })
  })
}

const activeIndex = ref(null) // Iniziamo con tutti gli accordion chiusi
const toggleAccordion = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}

const items = [
  {
    title: 'Initial Accessibility Review',
    description: 'We will begin by analyzing your digital product to identify accessibility barriers. You will get a clear overview of what can be improved to make your platform more inclusive.',
    icon: '🔍'
  },
  {
    title: 'Visual Accessibility',
    description: 'We focus on contrast, text size, visual hierarchy, and color use to ensure content is readable and accessible to users with visual impairments or color blindness.',
    icon: '👁️'
  },
  {
    title: 'Keyboard Navigation',
    description: 'We ensure that interfaces are fully operable using only a keyboard, supporting users with motor disabilities and those using screen readers.',
    icon: '⌨️'
  },
  {
    title: 'User Testing with Real People',
    description: 'We include users with visual, auditory, and cognitive impairments in our testing to uncover real-world issues that automated tools might miss.',
    icon: '👥'
  },
  {
    title: 'Compliance & Guidelines',
    description: 'We help you meet global accessibility standards such as WCAG and ADA, and support your path to accessibility certification.',
    icon: '✅'
  },
  {
    title: 'Inclusive Design Approach',
    description: 'From the first sketch to the final product, we design with inclusivity in mind creating interfaces that are intuitive, clear, and accessible to everyone.',
    icon: '🎨'
  }
]

const selectedType = ref('more') // default

const handleRadioChange = (value) => {
  selectedType.value = value
}

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  
  // Prevent body scroll when menu is open
  if (isMenuOpen.value) {
    document.body.classList.add('menu-open')
  } else {
    document.body.classList.remove('menu-open')
  }
}

// Navigation helper
const navigateToSection = (sectionId) => {
  const element = document.getElementById(sectionId.replace('#', ''))
  if (element) {
    smoothScrollTo(element)
    isMenuOpen.value = false
    document.body.classList.remove('menu-open')
  }
}
</script>



<template>
  <!-- NAVBAR -->
  <header 
    :class="[
      'navbar-fixed fixed top-0 w-full z-[9998] font-text transition-all duration-500',
      isScrolled 
        ? 'bg-[#0b001a]/95 backdrop-blur-lg shadow-2xl py-2' 
        : 'bg-gradient-to-r from-[#0b001a] to-[#0f0025] py-3 md:py-4'
    ]"
    style="z-index: 9998 !important;"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
      <!-- Logo with hover animation -->
      <div class="z-[9999] group relative">
        <img 
          src="/images/L.png" 
          alt="Lumyn Logo" 
          :class="[
            'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
            isScrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-10'
          ]"
        />
      </div>

      <!-- Desktop NAV with active states -->
      <nav class="hidden lg:flex flex-wrap justify-center gap-1 xl:gap-2 text-xs xl:text-sm">
        <a
          @click="navigateToSection('service')"
          :class="[
            'nav-link px-2 xl:px-4 py-2 rounded-full border border-cyan-400 text-white bg-transparent transition-all duration-300 cursor-pointer',
            'hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow-lg hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
            currentSection === 'service' ? 'bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] shadow-lg' : ''
          ]"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('service')"
        >Service</a>
        <a
          @click="navigateToSection('case-studies')"
          :class="[
            'nav-link px-2 xl:px-4 py-2 rounded-full border border-cyan-400 text-white bg-transparent transition-all duration-300 cursor-pointer',
            'hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow-lg hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
            currentSection === 'case-studies' ? 'bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] shadow-lg' : ''
          ]"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('case-studies')"
        >Case Studies</a>
        <a
          @click="navigateToSection('thinking')"
          :class="[
            'nav-link px-2 xl:px-4 py-2 rounded-full border border-cyan-400 text-white bg-transparent transition-all duration-300 cursor-pointer',
            'hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow-lg hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
            currentSection === 'thinking' ? 'bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] shadow-lg' : ''
          ]"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('thinking')"
        >Thinking</a>
        <a
          @click="navigateToSection('pricing')"
          :class="[
            'nav-link px-2 xl:px-4 py-2 rounded-full border border-cyan-400 text-white bg-transparent transition-all duration-300 cursor-pointer',
            'hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow-lg hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
            currentSection === 'pricing' ? 'bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] shadow-lg' : ''
          ]"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('pricing')"
        >Pricing</a>
        <a
          @click="navigateToSection('team')"
          :class="[
            'nav-link px-2 xl:px-4 py-2 rounded-full border border-cyan-400 text-white bg-transparent transition-all duration-300 cursor-pointer',
            'hover:bg-gradient-to-r hover:from-[#6dd5fa] hover:to-[#8a00ff] hover:text-white hover:shadow-lg hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50',
            currentSection === 'team' ? 'bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] shadow-lg' : ''
          ]"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('team')"
        >About Us</a>
        <a
          @click="navigateToSection('contact')"
          class="nav-link px-2 xl:px-4 py-2 rounded-full bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] text-white transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
          role="button"
          tabindex="0"
          @keydown.enter="navigateToSection('contact')"
        >Book a Consultation</a>
      </nav>

      <!-- Modern Morphic Hamburger Button -->
      <button 
        @click="toggleMenu" 
        class="lg:hidden z-[10000] relative w-12 h-12 flex items-center justify-center group focus:outline-none"
        aria-label="Toggle menu"
        :aria-expanded="isMenuOpen"
      >
        <!-- Animated background circle -->
        <div 
          :class="[
            'absolute inset-0 rounded-full border-2 transition-all duration-500 ease-out',
            isMenuOpen 
              ? 'border-[#ff0080] bg-gradient-to-br from-[#ff0080]/20 to-[#6dd5fa]/20 backdrop-blur-md scale-110 shadow-lg shadow-[#ff0080]/25' 
              : 'border-[#6dd5fa]/50 bg-[#6dd5fa]/10 backdrop-blur-sm group-hover:border-[#6dd5fa] group-hover:bg-[#6dd5fa]/20 group-hover:scale-105'
          ]"
        ></div>
        
        <!-- Hamburger lines with advanced morphing -->
        <div class="relative w-6 h-6 flex flex-col justify-center items-center">
          <!-- Top line -->
          <span 
            :class="[
              'absolute h-0.5 bg-gradient-to-r transition-all duration-500 ease-out transform origin-center',
              isMenuOpen 
                ? 'w-7 from-[#ff0080] to-[#6dd5fa] rotate-45 translate-y-0 shadow-sm shadow-[#ff0080]/50' 
                : 'w-5 from-[#6dd5fa] to-[#8a00ff] -translate-y-2 group-hover:w-6 group-hover:shadow-sm group-hover:shadow-[#6dd5fa]/50'
            ]"
          ></span>
          
          <!-- Middle line -->
          <span 
            :class="[
              'absolute h-0.5 bg-gradient-to-r transition-all duration-300 ease-out',
              isMenuOpen 
                ? 'w-0 opacity-0 scale-0' 
                : 'w-4 from-[#6dd5fa] to-[#8a00ff] group-hover:w-5 group-hover:shadow-sm group-hover:shadow-[#6dd5fa]/50'
            ]"
          ></span>
          
          <!-- Bottom line -->
          <span 
            :class="[
              'absolute h-0.5 bg-gradient-to-r transition-all duration-500 ease-out transform origin-center',
              isMenuOpen 
                ? 'w-7 from-[#ff0080] to-[#6dd5fa] -rotate-45 translate-y-0 shadow-sm shadow-[#ff0080]/50' 
                : 'w-5 from-[#6dd5fa] to-[#8a00ff] translate-y-2 group-hover:w-6 group-hover:shadow-sm group-hover:shadow-[#6dd5fa]/50'
            ]"
          ></span>
        </div>
        
        <!-- Pulse effect on hover -->
        <div 
          :class="[
            'absolute inset-0 rounded-full opacity-0 transition-all duration-300',
            'group-hover:opacity-100 group-hover:animate-ping',
            isMenuOpen ? 'border-2 border-[#ff0080]/30' : 'border-2 border-[#6dd5fa]/30'
          ]"
        ></div>
      </button>
    </div>

    <!-- Ultra Modern Mobile Menu -->
    <transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMenuOpen"
        class="mobile-menu-overlay fixed inset-0 z-[9999] w-full h-full overflow-y-auto"
        style="height: 100vh; height: 100dvh;"
      >
        <!-- Animated background with glassmorphism -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#0b001a]/95 via-[#1a0033]/90 to-[#0f0025]/95 backdrop-blur-xl">
          <!-- Floating geometric shapes -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="floating-shape-1 absolute w-32 h-32 bg-gradient-to-br from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-full blur-xl animate-float-slow"></div>
            <div class="floating-shape-2 absolute w-24 h-24 bg-gradient-to-br from-[#ff0080]/20 to-[#6dd5fa]/20 rounded-full blur-xl animate-float-delayed"></div>
            <div class="floating-shape-3 absolute w-40 h-40 bg-gradient-to-br from-[#8a00ff]/15 to-[#ff0080]/15 rounded-full blur-2xl animate-float-reverse"></div>
          </div>
          
          <!-- Animated grid pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="grid-pattern"></div>
          </div>
        </div>

        <!-- Menu content container -->
        <div class="relative min-h-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <!-- Main navigation links -->
          <nav class="flex flex-col items-center space-y-4 w-full max-w-sm flex-shrink-0">
            <div class="menu-item-container w-full" style="animation-delay: 0.1s">
              <a 
                @click="navigateToSection('service')" 
                class="modern-menu-link group relative"
                :class="{ 'active': currentSection === 'service' }"
              >
                <span class="menu-link-bg"></span>
                <span class="menu-link-text">Service</span>
                <div class="menu-link-icon">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </a>
            </div>

            <div class="menu-item-container w-full" style="animation-delay: 0.2s">
              <a 
                @click="navigateToSection('case-studies')" 
                class="modern-menu-link group relative"
                :class="{ 'active': currentSection === 'case-studies' }"
              >
                <span class="menu-link-bg"></span>
                <span class="menu-link-text">Case Studies</span>
                <div class="menu-link-icon">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </a>
            </div>

            <div class="menu-item-container w-full" style="animation-delay: 0.3s">
              <a 
                @click="navigateToSection('thinking')" 
                class="modern-menu-link group relative"
                :class="{ 'active': currentSection === 'thinking' }"
              >
                <span class="menu-link-bg"></span>
                <span class="menu-link-text">Thinking</span>
                <div class="menu-link-icon">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </a>
            </div>

            <div class="menu-item-container w-full" style="animation-delay: 0.4s">
              <a 
                @click="navigateToSection('pricing')" 
                class="modern-menu-link group relative"
                :class="{ 'active': currentSection === 'pricing' }"
              >
                <span class="menu-link-bg"></span>
                <span class="menu-link-text">Pricing</span>
                <div class="menu-link-icon">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </a>
            </div>

            <div class="menu-item-container w-full" style="animation-delay: 0.5s">
              <a 
                @click="navigateToSection('team')" 
                class="modern-menu-link group relative"
                :class="{ 'active': currentSection === 'team' }"
              >
                <span class="menu-link-bg"></span>
                <span class="menu-link-text">About Us</span>
                <div class="menu-link-icon">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </a>
            </div>

            <!-- CTA Button with special styling -->
            <div class="menu-item-container w-full mt-6" style="animation-delay: 0.6s">
              <a 
                @click="navigateToSection('contact')" 
                class="modern-menu-cta group relative overflow-hidden"
              >
                <div class="cta-bg-animation"></div>
                <span class="relative z-10 flex items-center justify-center space-x-3">
                  <span class="font-bold text-lg">Book a Consultation</span>
                  <svg class="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-[#ff0080] to-[#6dd5fa] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </a>
            </div>
          </nav>

          <!-- Footer info with social links (optional) -->
          <div class="mt-auto pt-8 px-6 flex-shrink-0">
            <div class="flex justify-center items-center space-x-6 opacity-60">
              <div class="w-2 h-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-gradient-to-r from-[#8a00ff] to-[#ff0080] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>



  <main class="bg-gradient-to-b from-[#0b001a] to-[#0f0025] min-h-screen text-white font-text pt-20">
    <!-- HERO SECTION -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Animated background particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="floating-particles">
          <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
          <div class="particle" style="left: 80%; animation-delay: 2s;"></div>
          <div class="particle" style="left: 40%; animation-delay: 4s;"></div>
          <div class="particle" style="left: 60%; animation-delay: 1s;"></div>
          <div class="particle" style="left: 10%; animation-delay: 3s;"></div>
          <div class="particle" style="left: 90%; animation-delay: 5s;"></div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative z-10">
        <!-- Left content with staggered animations -->
        <div class="text-center md:text-left space-y-6 animate-on-scroll">
          <div class="overflow-hidden">
            <h3 class="pt-12 md text-lg md:text-xl text-[#6dd5fa] mb-2 font-medium animate-slide-up" style="animation-delay: 0.2s;">
              Chatbot
            </h3>
          </div>
          
          <div class="overflow-hidden">
            <h1 class="text-6xl md:text-9xl font-extrabold mb-6 tracking-tight font-title animate-slide-up bg-gradient-to-r from-white via-[#6dd5fa] to-[#8a00ff] bg-clip-text text-transparent" style="animation-delay: 0.4s;">
              Lumyn
            </h1>
          </div>
          
          <div class="flex flex-col md:flex-row items-center md:items-start gap-4 mt-8 animate-slide-up" style="animation-delay: 0.8s;">
            <button 
              @click="navigateToSection('contact')"
              class="group relative px-8 py-4 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] text-white rounded-full text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
            >
              <span class="relative z-10">Start Your Journey</span>
              <div class="absolute inset-0 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button 
              @click="openVideoModal"
              class="group relative px-8 py-4 bg-transparent border-2 border-[#6dd5fa] text-[#6dd5fa] rounded-full text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-[#6dd5fa] hover:text-gray-900 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
            >
              <span class="relative z-10">Watch Lumyn</span>
            </button>
          </div>
          
          <!-- Stats showcase -->
          <div class="grid grid-cols-3 gap-4 mt-12 animate-slide-up" style="animation-delay: 1s;">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-[#6dd5fa] count-up" data-target="500">0</div>
              <div class="text-sm text-gray-400">Happy Clients</div>
            </div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-[#6dd5fa] count-up" data-target="99">0</div>
              <div class="text-sm text-gray-400">Uptime %</div>
            </div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-[#6dd5fa] count-up" data-target="24">0</div>
              <div class="text-sm text-gray-400">24/7 Support</div>
            </div>
          </div>
        </div>
        
        <!-- Right content with enhanced animations -->
        <div class="relative animate-on-scroll">
          <div class="relative z-10">
            <!-- Glow effect behind the image -->
            <div class="absolute inset-0 bg-gradient-to-r from-[#8a00ff]/20 to-[#6dd5fa]/20 rounded-full blur-3xl scale-110 animate-pulse-slow"></div>
            
            <img 
              src="/images/hero.png" 
              alt="Hero" 
              class="w-full max-w-lg mx-auto md:mx-0 animate-float-enhanced relative z-10 drop-shadow-2xl" 
            />
            
            <!-- Floating elements around the hero image -->
            <div class="absolute top-10 right-10 w-4 h-4 bg-[#6dd5fa] rounded-full animate-bounce opacity-70" style="animation-delay: 0.5s;"></div>
            <div class="absolute bottom-20 left-10 w-3 h-3 bg-[#8a00ff] rounded-full animate-bounce opacity-70" style="animation-delay: 1.5s;"></div>
            <div class="absolute top-1/2 right-0 w-2 h-2 bg-white rounded-full animate-ping opacity-50" style="animation-delay: 2s;"></div>
          </div>
        </div>
      </div>
      
      <!-- Subtle parallax background -->
      <div 
        class="absolute inset-0 opacity-10 bg-gradient-to-br from-[#6dd5fa] via-transparent to-[#8a00ff]"
        :style="{ transform: `translateY(${parallaxOffset}px)` }"
      ></div>
    </section>
    
    <!-- SEZIONE LANDING -->
    <section id="landing" class="min-h-screen py-20 px-6 md:px-20">
      <div class="max-w-6xl mx-auto text-center">
        <div class="animate-on-scroll">
          <h2 class="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-[#6dd5fa] to-white bg-clip-text text-transparent">
            Welcome to Lumyn
          </h2>
          <p class="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
            Our goal is to simplify your business through artificial intelligence. 
            Discover how we can support your digital growth with innovative solutions.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div class="feature-card group bg-gradient-to-br from-[#1a0033] to-[#0f0025] p-8 rounded-3xl shadow-2xl border border-[#6dd5fa]/20 hover:border-[#6dd5fa]/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-on-scroll">
            <div class="mb-6">
              <div class="w-16 h-16 mx-auto bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-semibold mb-4 group-hover:text-[#6dd5fa] transition-colors">Automation</h3>
            <p class="text-gray-400 leading-relaxed">Reduce time and improve efficiency by automating repetitive tasks with our intelligent chatbots.</p>
            <div class="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-full h-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-full"></div>
            </div>
          </div>
          
          <div class="feature-card group bg-gradient-to-br from-[#1a0033] to-[#0f0025] p-8 rounded-3xl shadow-2xl border border-[#6dd5fa]/20 hover:border-[#6dd5fa]/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-on-scroll" style="animation-delay: 0.2s;">
            <div class="mb-6">
              <div class="w-16 h-16 mx-auto bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-semibold mb-4 group-hover:text-[#6dd5fa] transition-colors">24/7 Support</h3>
            <p class="text-gray-400 leading-relaxed">Provide continuous support to your customers with always-on, customizable AI solutions.</p>
            <div class="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-full h-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-full"></div>
            </div>
          </div>
          
          <div class="feature-card group bg-gradient-to-br from-[#1a0033] to-[#0f0025] p-8 rounded-3xl shadow-2xl border border-[#6dd5fa]/20 hover:border-[#6dd5fa]/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-on-scroll" style="animation-delay: 0.4s;">
            <div class="mb-6">
              <div class="w-16 h-16 mx-auto bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-2xl font-semibold mb-4 group-hover:text-[#6dd5fa] transition-colors">Easy Integration</h3>
            <p class="text-gray-400 leading-relaxed">Implement our technology on any digital platform, in just a few simple steps.</p>
            <div class="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-full h-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div class="animate-on-scroll">
          <button 
            @click="navigateToSection('contact')"
            class="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] text-white font-semibold rounded-full shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_#6dd5fa40] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
          >
            <span class="relative z-10">Start Your Journey</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
            <div class="absolute inset-0 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </section>
    
<!-- SEZIONE SERVICE -->
<section id="service" class="py-20 px-6 md:px-20 text-white font-text">
  <div class="max-w-7xl mx-auto">

    <!-- Titolo e Descrizione iniziale -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-6 animate-on-scroll">
      <div class="relative">
        <div class="inline-block bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-3xl md:text-4xl font-title px-8 py-4 rounded-2xl shadow-2xl">
          Service
        </div>
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl blur opacity-30 -z-10"></div>
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-base md:text-lg leading-relaxed">
        Discover our customized solutions designed to accompany you in your digital growth. 
        Each service is designed to meet specific needs, with a touch of innovation and simplicity.
      </p>
    </div>

    <!-- Box dei servizi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Box 1 - Brand Strategy -->
      <div class="group relative animate-on-scroll">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 hover:border-[#6dd5fa]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#6dd5fa] mb-3">Brand Strategy</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            Define your brand's unique position in the market with strategic insights and creative direction. Positioning, vision, identity development.
          </p>
          <!-- Services -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-sm font-medium text-[#6dd5fa]">Identity</div>
              <div class="text-xs text-gray-400">Brand Design</div>
            </div>
            <div>
              <div class="text-sm font-medium text-[#6dd5fa]">Strategy</div>
              <div class="text-xs text-gray-400">Positioning</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Box 2 - UX Design -->
      <div class="group relative animate-on-scroll" style="animation-delay: 0.2s;">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#8a00ff]/30 rounded-3xl p-8 hover:border-[#8a00ff]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#8a00ff] mb-3">UX Design</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            Create exceptional user experiences through research-driven design and intuitive interfaces. User journey, interface, wireframe development.
          </p>
          <!-- Services -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-sm font-medium text-[#8a00ff]">UI/UX</div>
              <div class="text-xs text-gray-400">Interface</div>
            </div>
            <div>
              <div class="text-sm font-medium text-[#8a00ff]">Research</div>
              <div class="text-xs text-gray-400">User Journey</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Box 3 - Development -->
      <div class="group relative animate-on-scroll" style="animation-delay: 0.4s;">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 hover:border-[#6dd5fa]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#6dd5fa] mb-3">Development</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            Build robust, scalable solutions using cutting-edge technologies and best practices. Web apps, landing pages, integrations.
          </p>
          <!-- Services -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-sm font-medium text-[#6dd5fa]">Web Apps</div>
              <div class="text-xs text-gray-400">Custom Dev</div>
            </div>
            <div>
              <div class="text-sm font-medium text-[#6dd5fa]">Integration</div>
              <div class="text-xs text-gray-400">APIs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Box 4 - Automation -->
      <div class="group relative animate-on-scroll" style="animation-delay: 0.6s;">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#8a00ff]/30 rounded-3xl p-8 hover:border-[#8a00ff]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#8a00ff] mb-3">Automation</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            Streamline your business processes with intelligent automation and workflow optimization. CRM, workflows, marketing automations.
          </p>
          <!-- Services -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-sm font-medium text-[#8a00ff]">CRM</div>
              <div class="text-xs text-gray-400">Management</div>
            </div>
            <div>
              <div class="text-sm font-medium text-[#8a00ff]">Workflows</div>
              <div class="text-xs text-gray-400">Automation</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

  
  <!-- SEZIONE CALL TO ACTION -->
  <section class="px-4 sm:px-6 md:px-10 lg:px-16 py-16 relative overflow-hidden">
    <!-- Background decorativo -->
    <div class="absolute inset-0">
      <div class="absolute top-0 right-1/3 w-72 h-72 bg-[#6dd5fa]/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 w-80 h-80 bg-[#8a00ff]/10 rounded-full blur-3xl"></div>
    </div>
    <div class="max-w-7xl mx-auto relative">
      <!-- Card glassmorphism -->
      <div class="group relative animate-on-scroll">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#6dd5fa]/60 transition-all duration-500">
      <!-- Testo -->
      <div>
        <h2 class="text-2xl md:text-3xl font-title mb-4">Let’s make things happen</h2>
        <p class="text-sm md:text-base text-white/80 mb-6 max-w-md">
          Chat right now to become a professional e-commerce creator
        </p>
        <button
          onclick="window.lumyn.toggleChat()"
          class="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_#6dd5fa40] hover:scale-105"
        >
          <svg class="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span>Start Chatting Now</span>
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </button>
          </div>
          
          <!-- Icona decorativa -->
          <div class="hidden md:block">
            <div class="w-24 h-24 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

<!-- SEZIONE CASE STUDIES -->
<section id="case-studies" class="py-20 px-6 md:px-20 text-white font-text relative overflow-hidden">
  <!-- Background decorativo -->
  <div class="absolute inset-0">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#6dd5fa]/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-[#8a00ff]/5 rounded-full blur-3xl"></div>
  </div>
  
  <div class="max-w-7xl mx-auto relative z-10">
    <!-- Intestazione modernizzata -->
    <div class="text-center mb-16">
      <div class="inline-block relative group">
        <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-3xl md:text-4xl font-title px-8 py-4 rounded-3xl shadow-2xl">
          Case Studies
        </div>
      </div>
      <p class="mt-6 text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
        A selection of real projects that demonstrate our approach, strategy, and results. Each case study highlights our focus on growth, creativity, and digital innovation.
      </p>
    </div>
    
    <!-- Grid delle case studies -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Card 1 -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 hover:border-[#6dd5fa]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#6dd5fa] mb-3">E-commerce Revamp</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            We redesigned the UX and implemented a tailored SEO strategy for a fashion e-commerce brand. Within 3 months, conversions increased by 38% and bounce rate dropped by 22%.
          </p>
          <!-- Metrics -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-2xl font-bold text-[#6dd5fa]">+38%</div>
              <div class="text-xs text-gray-400">Conversions</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#6dd5fa]">-22%</div>
              <div class="text-xs text-gray-400">Bounce Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#8a00ff]/30 rounded-3xl p-8 hover:border-[#8a00ff]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#8a00ff] mb-3">SaaS Lead Generation</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            For a B2B SaaS startup, we developed an automated lead funnel via LinkedIn and email outreach, resulting in 400+ qualified leads and a 30% booking rate in 2 months.
          </p>
          <!-- Metrics -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-2xl font-bold text-[#8a00ff]">400+</div>
              <div class="text-xs text-gray-400">Qualified Leads</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#8a00ff]">30%</div>
              <div class="text-xs text-gray-400">Booking Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Card 3 -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 hover:border-[#6dd5fa]/60 transition-all duration-500 h-full">
          <div class="mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h4 class="text-xl font-semibold text-[#6dd5fa] mb-3">Local Visibility Boost</h4>
          </div>
          <p class="text-gray-300 leading-relaxed mb-6">
            We launched a geotargeted Google Ads campaign for a dental clinic. Appointment bookings grew by 45%, and the client now ranks top 3 in local search results.
          </p>
          <!-- Metrics -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <div class="text-2xl font-bold text-[#6dd5fa]">+45%</div>
              <div class="text-xs text-gray-400">Bookings</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-[#6dd5fa]">Top 3</div>
              <div class="text-xs text-gray-400">Local Ranking</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</section>


<!-- SEZIONE THINKING -->
<section id="thinking" class="py-20 px-6 md:px-20 font-text text-white relative overflow-hidden">
  <!-- Background decorativo -->
  <div class="absolute inset-0 bg-gradient-to-br from-[#8a00ff]/5 via-transparent to-[#6dd5fa]/5 pointer-events-none"></div>
  
  <div class="max-w-6xl mx-auto relative z-10">
    <!-- Titolo modernizzato -->
    <div class="mb-16 text-center">
      <div class="inline-block relative group">
        <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-2xl md:text-4xl font-title px-8 py-4 rounded-3xl shadow-2xl">
          Our thinking about accessibility
        </div>
      </div>
      <p class="mt-6 text-gray-300 text-lg max-w-3xl mx-auto">
        Discover our comprehensive approach to creating inclusive digital experiences
      </p>
    </div>
    
    <!-- Accordion moderno -->
    <div class="space-y-6">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="group relative"
      >
        <!-- Card moderna con glassmorphism -->
        <div class="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 hover:border-[#6dd5fa]/50 hover:shadow-[0_0_50px_rgba(109,213,250,0.15)] hover:scale-[1.02]">
          <!-- Gradiente decorativo -->
          <div class="absolute inset-0 bg-gradient-to-r from-[#6dd5fa]/5 to-[#8a00ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- Header dell'accordion -->
          <div
            class="relative flex items-center justify-between p-6 md:p-8 cursor-pointer group/header"
            :class="activeIndex === index ? 'bg-gradient-to-r from-[#6dd5fa]/10 to-[#8a00ff]/10' : ''"
            @click="toggleAccordion(index)"
          >
            <div class="flex items-center gap-6">
              <!-- Numero con stile moderno -->
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center font-bold text-white shadow-lg group-hover/header:scale-110 transition-transform duration-300">
                {{ `0${index + 1}` }}
              </div>
              
              <!-- Icona emoji moderna -->
              <div class="flex-shrink-0 w-12 h-12 bg-white/5 backdrop-blur rounded-xl flex items-center justify-center text-2xl group-hover/header:rotate-12 transition-transform duration-300">
                {{ item.icon }}
              </div>
              
              <!-- Testo -->
              <div>
                <h3 class="font-bold text-xl md:text-2xl text-white group-hover/header:text-[#6dd5fa] transition-colors duration-300">
                  {{ item.title }}
                </h3>
              </div>
            </div>
            
            <!-- Indicatore moderno -->
            <div class="flex-shrink-0 w-12 h-12 bg-white/5 backdrop-blur rounded-xl flex items-center justify-center transition-all duration-500"
                 :class="activeIndex === index ? 'rotate-180 bg-[#6dd5fa]/20' : 'group-hover/header:bg-white/10'">
              <svg class="w-6 h-6 text-[#6dd5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          <!-- Contenuto dell'accordion -->
          <div v-if="activeIndex === index" class="relative">
            <!-- Linea decorativa -->
            <div class="h-px bg-gradient-to-r from-transparent via-[#6dd5fa]/50 to-transparent mx-6"></div>
            
            <div class="p-6 md:p-8 pt-6">
              <div class="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p class="text-gray-300 text-lg leading-relaxed">
                  {{ item.description }}
                </p>
                
                <!-- CTA decorativa -->
                <div class="mt-6 flex items-center gap-3 text-[#6dd5fa]">
                  <div class="w-2 h-2 bg-[#6dd5fa] rounded-full animate-pulse"></div>
                  <span class="text-sm font-medium">Explore this approach in detail</span>
                  <svg class="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SEZIONE PREZZI -->
<section id="pricing" class="py-20 px-6 md:px-20 font-text text-white relative overflow-hidden">
  <!-- Background decorativo -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-10 w-72 h-72 bg-[#8a00ff]/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-[#6dd5fa]/10 rounded-full blur-3xl"></div>
  </div>
  
  <div class="max-w-7xl mx-auto relative z-10">
    
    <!-- Titolo modernizzato -->
    <div class="text-center mb-16">
      <div class="inline-block relative group">
        <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-2xl md:text-4xl font-title px-8 py-4 rounded-3xl shadow-2xl">
          Tailored Plans for Your Needs
        </div>
      </div>
      <p class="mt-6 text-gray-300 text-lg max-w-3xl mx-auto">
        Choose the perfect plan to accelerate your digital transformation
      </p>
    </div>

    <!-- Cards moderne -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Piano Base -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-br from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/30 border border-white/10 rounded-3xl p-8 hover:border-[#6dd5fa]/50 transition-all duration-500 hover:scale-105">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#6dd5fa] to-[#8a00ff] rounded-2xl flex items-center justify-center shadow-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-[#6dd5fa] mb-2">Base</h4>
            <p class="text-gray-400">Perfect for getting started</p>
          </div>
          
          <!-- Features -->
          <div class="space-y-4 mb-8">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#6dd5fa] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">Basic AI integration</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#6dd5fa] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">24/7 support</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#6dd5fa] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">Free consultation</span>
            </div>
          </div>
          
          <!-- CTA -->
          <button class="w-full bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>

      <!-- Piano Professional -->
      <div class="group relative">

        
        <div class="absolute -inset-1 bg-gradient-to-br from-[#8a00ff]/30 to-[#6dd5fa]/30 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/40 border-2 border-[#6dd5fa]/50 rounded-3xl p-8 hover:border-[#6dd5fa] transition-all duration-500 hover:scale-105 shadow-2xl">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center shadow-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-white mb-2">Professional</h4>
            <p class="text-gray-300">For growing businesses</p>
          </div>
          
          <!-- Features -->
          <div class="space-y-4 mb-8">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa] rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-200">Advanced AI features</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa] rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-200">Priority support</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa] rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-200">Custom integrations</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#6dd5fa] rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <span class="text-sm text-gray-200">Analytics dashboard</span>
            </div>
          </div>
          
          <!-- CTA -->
          <button class="w-full bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg">
            Get Quote
          </button>
        </div>
      </div>

      <!-- Piano Advanced -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-br from-[#8a00ff]/20 to-[#6dd5fa]/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/30 border border-white/10 rounded-3xl p-8 hover:border-[#8a00ff]/50 transition-all duration-500 hover:scale-105">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#8a00ff] to-[#6dd5fa] rounded-2xl flex items-center justify-center shadow-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-[#8a00ff] mb-2">Advanced</h4>
            <p class="text-gray-400">Enterprise solutions</p>
          </div>
          
          <!-- Features -->
          <div class="space-y-4 mb-8">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#8a00ff]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#8a00ff] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">Enterprise AI solutions</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#8a00ff]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#8a00ff] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">Dedicated support</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-[#8a00ff]/20 rounded-full flex items-center justify-center">
                <div class="w-2 h-2 bg-[#8a00ff] rounded-full"></div>
              </div>
              <span class="text-sm text-gray-300">Custom development</span>
            </div>
          </div>
          
          <!-- CTA -->
          <button class="w-full bg-gradient-to-r from-[#8a00ff] to-[#6dd5fa] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Contact Sales
          </button>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- SEZIONE TEAM -->
<section id="team" class="py-20 px-6 md:px-20 font-text text-white relative overflow-hidden">
  <!-- Background decorativo -->
  <div class="absolute inset-0">
    <div class="absolute top-0 left-1/4 w-64 h-64 bg-[#6dd5fa]/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-[#8a00ff]/10 rounded-full blur-3xl"></div>
  </div>
  
  <div class="max-w-7xl mx-auto relative z-10">
    <!-- Titolo modernizzato -->
    <div class="text-center mb-16">
      <div class="inline-block relative group">
        <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-2xl md:text-4xl font-title px-8 py-4 rounded-3xl shadow-2xl">
          Meet Our Team
        </div>
      </div>
      <p class="mt-6 text-gray-300 text-lg max-w-3xl mx-auto">
        The creative minds behind your digital transformation
      </p>
    </div>

    <!-- Cards membri team -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      <!-- Membro 1 - Andrea -->
      <div class="group relative">
        <div class="absolute -inset-1 bg-gradient-to-br from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div class="relative backdrop-blur-xl bg-black/30 border border-white/10 rounded-3xl p-8 hover:border-[#6dd5fa]/50 transition-all duration-500 hover:scale-105">
          <!-- Immagine con effetti -->
          <div class="relative mb-6">
            <div class="relative w-24 h-24 mx-auto bg-gradient-to-br from-[#6dd5fa] to-[#8a00ff] rounded-full p-1">
              <img src="/images/profile.png" alt="Andrea Piscioneri" class="w-full h-full rounded-full object-cover" />
            </div>
          </div>
          
          <!-- Info -->
          <div class="text-center space-y-4">
            <div>
              <h3 class="font-bold text-xl text-white group-hover:text-[#6dd5fa] transition-colors">Andrea Piscioneri</h3>
              <p class="text-[#6dd5fa] font-medium">CEO and Founder</p>
            </div>
            
            <!-- Linea decorativa -->
            <div class="h-px bg-gradient-to-r from-transparent via-[#6dd5fa]/50 to-transparent"></div>
            
            <p class="text-gray-300 leading-relaxed">
              10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy.
            </p>
            
            <!-- Skills tags -->
            <div class="flex flex-wrap justify-center gap-2 mt-4">
              <span class="px-3 py-1 bg-[#6dd5fa]/20 text-[#6dd5fa] rounded-full text-xs font-medium">Marketing</span>
              <span class="px-3 py-1 bg-[#8a00ff]/20 text-[#8a00ff] rounded-full text-xs font-medium">Strategy</span>
              <span class="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium">Innovation</span>
            </div>
            
            <!-- Social links modernizzati -->
            <div class="flex justify-center gap-4 pt-4">
              <a href="#" class="group/social w-10 h-10 bg-white/5 backdrop-blur rounded-xl flex items-center justify-center border border-white/10 hover:border-[#6dd5fa]/50 hover:bg-[#6dd5fa]/10 transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" class="group/social w-10 h-10 bg-white/5 backdrop-blur rounded-xl flex items-center justify-center border border-white/10 hover:border-[#6dd5fa]/50 hover:bg-[#6dd5fa]/10 transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="group/social w-10 h-10 bg-white/5 backdrop-blur rounded-xl flex items-center justify-center border border-white/10 hover:border-[#6dd5fa]/50 hover:bg-[#6dd5fa]/10 transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
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
      <div class="inline-block relative group">
        <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        <div class="relative bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-2xl md:text-3xl font-title px-8 py-4 rounded-3xl shadow-2xl">
          {{ selectedType === 'more' ? 'Becoming client - Contact US!' : 'Book a Consultation' }}
        </div>
      </div>
      <p class="text-gray-300 max-w-xl md:text-right text-sm md:text-base leading-snug">
        {{ selectedType === 'more'
          ? "Connect with Us: Let’s Discuss Your Digital Marketing Needs"
          : "Choose your preferred date and book a call with us" }}
      </p>
    </div>

    <!-- Form e immagine modernizzati -->
    <div class="relative group">
      <div class="absolute -inset-2 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
      <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-3xl p-8 md:p-12 hover:border-[#6dd5fa]/60 transition-all duration-500">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- FORM SECTION -->
          <div class="space-y-8">
            <!-- Type Selection modernizzata -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-[#6dd5fa] mb-4">What can we help you with?</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="more"
                    class="sr-only"
                    :checked="selectedType === 'more'"
                    @change="handleRadioChange('more')"
                  />
                  <div class="flex items-center space-x-3 p-4 border-2 rounded-2xl transition-all duration-300"
                       :class="selectedType === 'more' ? 'border-[#6dd5fa] bg-[#6dd5fa]/10' : 'border-white/20 hover:border-[#6dd5fa]/50'">
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                         :class="selectedType === 'more' ? 'border-[#6dd5fa]' : 'border-white/40'">
                      <div class="w-2.5 h-2.5 rounded-full bg-[#6dd5fa] transition-opacity"
                           :class="selectedType === 'more' ? 'opacity-100' : 'opacity-0'"></div>
                    </div>
                    <div>
                      <div class="font-medium text-white">More Information</div>
                      <div class="text-sm text-gray-400">General inquiry</div>
                    </div>
                  </div>
                </label>
                
                <label class="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="plan"
                    class="sr-only"
                    :checked="selectedType === 'plan'"
                    @change="handleRadioChange('plan')"
                  />
                  <div class="flex items-center space-x-3 p-4 border-2 rounded-2xl transition-all duration-300"
                       :class="selectedType === 'plan' ? 'border-[#8a00ff] bg-[#8a00ff]/10' : 'border-white/20 hover:border-[#8a00ff]/50'">
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                         :class="selectedType === 'plan' ? 'border-[#8a00ff]' : 'border-white/40'">
                      <div class="w-2.5 h-2.5 rounded-full bg-[#8a00ff] transition-opacity"
                           :class="selectedType === 'plan' ? 'opacity-100' : 'opacity-0'"></div>
                    </div>
                    <div>
                      <div class="font-medium text-white">Buy a Plan</div>
                      <div class="text-sm text-gray-400">Book consultation</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Form modernizzato -->
            <form class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="group">
                  <label class="block mb-2 text-sm font-medium text-gray-300">Name*</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    class="w-full bg-black/20 border border-white/20 text-white px-4 py-3 rounded-xl outline-none focus:border-[#6dd5fa] focus:bg-black/30 transition-all duration-300" 
                    required 
                  />
                </div>
                <div class="group">
                  <label class="block mb-2 text-sm font-medium text-gray-300">Surname*</label>
                  <input 
                    type="text" 
                    placeholder="Enter your surname" 
                    class="w-full bg-black/20 border border-white/20 text-white px-4 py-3 rounded-xl outline-none focus:border-[#6dd5fa] focus:bg-black/30 transition-all duration-300" 
                    required 
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="group">
                  <label class="block mb-2 text-sm font-medium text-gray-300">Email*</label>
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      class="w-full bg-black/20 border border-white/20 text-white px-12 py-3 rounded-xl outline-none focus:border-[#6dd5fa] focus:bg-black/30 transition-all duration-300" 
                      required 
                    />
                  </div>
                </div>
                <div class="group">
                  <label class="block mb-2 text-sm font-medium text-gray-300">Phone*</label>
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <input 
                      type="tel" 
                      placeholder="+39 123 456 7890" 
                      class="w-full bg-black/20 border border-white/20 text-white px-12 py-3 rounded-xl outline-none focus:border-[#6dd5fa] focus:bg-black/30 transition-all duration-300" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div v-if="selectedType === 'more'" class="group">
                <label class="block mb-2 text-sm font-medium text-gray-300">Message*</label>
                <textarea 
                  rows="4" 
                  placeholder="Tell us about your project and how we can help you..." 
                  class="w-full bg-black/20 border border-white/20 text-white px-4 py-3 rounded-xl outline-none focus:border-[#6dd5fa] focus:bg-black/30 transition-all duration-300 resize-none" 
                  required
                ></textarea>
              </div>

              <div v-else class="group">
                <label class="block mb-2 text-sm font-medium text-gray-300">Preferred Date*</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <input 
                    type="date" 
                    class="w-full bg-black/20 border border-white/20 text-white px-12 py-3 rounded-xl outline-none focus:border-[#8a00ff] focus:bg-black/30 transition-all duration-300" 
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full group relative overflow-hidden bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-black font-bold py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_#6dd5fa40] hover:scale-[1.02]"
              >
                <span class="relative z-10 flex items-center justify-center gap-3">
                  <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  {{ selectedType === 'more' ? 'Send Message' : 'Book Consultation' }}
                </span>
              </button>
            </form>
          </div>

          <!-- IMAGE SECTION -->
          <div class="relative">
            <div class="relative group">
              <div class="absolute -inset-4 bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition duration-500"></div>
              <img 
                src="/images/lumyinback.png" 
                alt="Lumyn AI Assistant" 
                class="relative w-full h-auto max-w-md mx-auto filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            
            <!-- Stats decorativi -->
            <div class="absolute top-4 right-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 animate-float">
              <div class="text-center">
                <div class="text-2xl font-bold text-[#6dd5fa]">24/7</div>
                <div class="text-xs text-gray-300">Support</div>
              </div>
            </div>
            
            <div class="absolute bottom-8 left-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 animate-float" style="animation-delay: 1s">
              <div class="text-center">
                <div class="text-2xl font-bold text-[#8a00ff]">< 2h</div>
                <div class="text-xs text-gray-300">Response</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</section>


<!-- FOOTER -->
<footer class="relative bg-gradient-to-br from-[#1a1a1a] via-[#0b001a] to-black text-white py-16 px-6 md:px-20 font-text rounded-t-3xl overflow-hidden">
  <!-- Background decorativo -->
  <div class="absolute inset-0">
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-[#6dd5fa]/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-[#8a00ff]/5 rounded-full blur-3xl"></div>
  </div>
  
  <div class="max-w-7xl mx-auto relative z-10">
    <!-- Header del footer -->
    <div class="text-center mb-16">
      <h2 class="text-4xl md:text-5xl font-title bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] bg-clip-text text-transparent">
        Lumyn
      </h2>
      <p class="mt-4 text-gray-300 text-lg">
        Transforming ideas into digital success
      </p>
    </div>
    
    <!-- Grid principale -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      
      <!-- Informazioni contatto -->
      <div class="lg:col-span-2">
        <div class="space-y-6">
          <div>
            <span class="inline-block bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white text-sm font-semibold px-4 py-2 rounded-xl mb-4">
              Contact us
            </span>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-3 group cursor-pointer">
              <div class="w-10 h-10 bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl flex items-center justify-center group-hover:from-[#6dd5fa] group-hover:to-[#8a00ff] transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Email</p>
                <p class="text-white hover:text-[#6dd5fa] transition-colors">andrypiscioneri@gmail.com <br> andrea.piscioneri@denani.it</br></p>
              </div>
            </div>
            
            <div class="flex items-center gap-3 group cursor-pointer">
              <div class="w-10 h-10 bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl flex items-center justify-center group-hover:from-[#6dd5fa] group-hover:to-[#8a00ff] transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Phone</p>
                <p class="text-white hover:text-[#6dd5fa] transition-colors">+39 375 528 6241</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3 group cursor-pointer">
              <div class="w-10 h-10 bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl flex items-center justify-center group-hover:from-[#6dd5fa] group-hover:to-[#8a00ff] transition-all duration-300">
                <svg class="w-5 h-5 text-[#6dd5fa] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-gray-400 text-sm">Address</p>
                <p class="text-white hover:text-[#6dd5fa] transition-colors">Via Tribulina 22/a Bergamo (BG)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h4 class="text-lg font-semibold text-[#6dd5fa] mb-6">Quick Links</h4>
        <ul class="space-y-3">
          <li><a @click="navigateToSection('team')" class="text-gray-300 hover:text-[#6dd5fa] transition-colors cursor-pointer">About Us</a></li>
          <li><a @click="navigateToSection('service')" class="text-gray-300 hover:text-[#6dd5fa] transition-colors cursor-pointer">Services</a></li>
          <li><a @click="navigateToSection('case-studies')" class="text-gray-300 hover:text-[#6dd5fa] transition-colors cursor-pointer">Case Studies</a></li>
          <li><a @click="navigateToSection('pricing')" class="text-gray-300 hover:text-[#6dd5fa] transition-colors cursor-pointer">Pricing</a></li>
          <li><a @click="navigateToSection('contact')" class="text-gray-300 hover:text-[#6dd5fa] transition-colors cursor-pointer">Contact</a></li>
        </ul>
      </div>
      
      <!-- Newsletter + Social -->
      <div>
        <h4 class="text-lg font-semibold text-[#6dd5fa] mb-6">Stay Updated</h4>
        
        <!-- Newsletter form -->
        <div class="mb-8">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div class="relative backdrop-blur-xl bg-black/40 border border-[#6dd5fa]/30 rounded-2xl p-4 space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                class="w-full bg-transparent border border-white/20 text-white px-4 py-3 rounded-xl outline-none focus:border-[#6dd5fa] transition-colors placeholder-gray-400" 
              />
              <button class="w-full bg-gradient-to-r from-[#6dd5fa] to-[#8a00ff] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-[0_0_30px_#6dd5fa40] transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <!-- Social media -->
        <div>
          <h5 class="text-sm font-medium text-gray-400 mb-4">Follow Us</h5>
          <div class="flex gap-3">
            <a href="https://www.instagram.com/andreapiscioneri/" target="_blank" aria-label="Instagram" 
               class="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl text-[#6dd5fa] hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:text-white transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.982.24 2.45.406.58.2.996.44 1.43.873.435.433.673.85.873 1.43.166.47.35 1.28.406 2.45.058 1.267.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.982-.406 2.45-.2.58-.44.996-.873 1.43-.433.435-.85.673-1.43.873-.47.166-1.28.35-2.45.406-1.267.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.982-.24-2.45-.406-.58-.2-.996-.44-1.43-.873-.435-.433-.673-.85-.873-1.43-.166-.47-.35-1.28-.406-2.45-.058-1.267-.07-1.65-.07-4.85s.012-3.584.07-4.85c.056-1.17.24-1.982.406-2.45.2-.58.44-.996.873-1.43.433-.435.85-.673 1.43-.873.47-.166 1.28-.35 2.45-.406 1.267-.058 1.65-.07 4.85-.07zm0-2.2c-3.28 0-3.688.012-4.973.07-1.29.058-2.178.252-2.947.54-.794.298-1.46.696-2.127 1.363s-1.066 1.333-1.364 2.127c-.287.77-.482 1.657-.54 2.947-.058 1.285-.07 1.693-.07 4.973s.012 3.688.07 4.973c.058 1.29.252 2.178.54 2.947.298.794.696 1.46 1.363 2.127s1.333 1.066 2.127 1.364c.77.287 1.657.482 2.947.54 1.285.058 1.693.07 4.973.07s3.688-.012 4.973-.07c1.29-.058 2.178-.252 2.947-.54.794-.298 1.46-.696 2.127-1.363s1.066-1.333 1.364-2.127c.287-.77.482-1.657.54-2.947.058-1.285.07-1.693.07-4.973s-.012-3.688-.07-4.973c-.058-1.29-.252-2.178-.54-2.947-.298-.794-.696-1.46-1.363-2.127s-1.333-1.066-2.127-1.364c-.77-.287-1.657-.482-2.947-.54-1.285-.058-1.693-.07-4.973-.07zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.662a1.44 1.44 0 110-2.88 1.44 1.44 0 010 2.88z"/>
              </svg>
            </a>

            <a href="https://www.facebook.com/profile.php?id=100076286341248" target="_blank" aria-label="Facebook" 
               class="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl text-[#6dd5fa] hover:bg-[#1877f2] hover:text-white transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10s-10 4.48-10 10c0 4.84 3.44 8.84 8 9.8v-6.93h-2.4v-2.87h2.4v-2.18c0-2.38 1.43-3.7 3.62-3.7 1.05 0 2.14.19 2.14.19v2.35h-1.21c-1.19 0-1.56.74-1.56 1.5v1.83h2.64l-.42 2.87h-2.22v6.93c4.56-.96 8-4.96 8-9.8z"/>
              </svg>
            </a>

            <a href="https://www.linkedin.com/in/andrea-piscioneri/" target="_blank" aria-label="LinkedIn" 
               class="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#6dd5fa]/20 to-[#8a00ff]/20 rounded-xl text-[#6dd5fa] hover:bg-[#0e76a8] hover:text-white transition-all duration-300 group">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.5c0-1.33-.03-3.04-1.85-3.04s-2.15 1.44-2.15 2.94v5.6h-3v-10h2.89v1.37h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.58z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
    
    <!-- Footer bottom -->
    <div class="flex flex-col md:flex-row md:justify-between items-center gap-4">
      <p class="text-gray-400 text-sm">
        © 2025 Lumyn. All Rights Reserved.
      </p>
      <div class="flex gap-6 text-sm">
        <a href="#" class="text-gray-400 hover:text-[#6dd5fa] transition-colors">Privacy Policy</a>
        <a href="#" class="text-gray-400 hover:text-[#6dd5fa] transition-colors">Terms of Service</a>
        <a href="#" class="text-gray-400 hover:text-[#6dd5fa] transition-colors">Cookies Policy</a>
      </div>
    </div>
  </div>
</footer>
</main>

<Embed />

<!-- Video Modal -->
<div 
  v-if="showVideoModal" 
  class="fixed inset-0 z-[10001] bg-black"
  @click="closeVideoModal"
>
  <!-- Close button -->
  <button 
    @click="closeVideoModal"
    class="absolute top-8 right-8 z-10 text-white hover:text-[#6dd5fa] transition-colors duration-200 bg-black bg-opacity-50 rounded-full p-3"
  >
    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>
  
  <!-- Video fullscreen -->
  <video 
    controls 
    autoplay 
    class="w-full h-full object-cover"
    @click.stop
  >
    <source src="/videos/Videos.mp4" type="video/mp4">
    Il tuo browser non supporta il tag video.
  </video>
</div>
</template>


<style scoped>
/* Enhanced font imports */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

/* Core typography */
.font-text {
  font-family: 'Montserrat', sans-serif;
}

.font-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Header z-index fix - Always on top */
header,
.navbar-fixed {
  z-index: 9998 !important;
  position: fixed !important;
  will-change: transform;
  isolation: isolate;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Ensure header elements are properly stacked */
header *,
.navbar-fixed * {
  position: relative;
  z-index: 1;
}

/* Force all other elements to have lower z-index */
main,
section,
.feature-card,
.service-card,
.chat {
  position: relative;
  z-index: auto;
}

/* Specific fixes for potential conflicting elements */
.backdrop-blur-lg,
.backdrop-blur-md,
.backdrop-blur-sm {
  z-index: auto;
}

/* Additional header protection - prevent stacking context issues */
body {
  position: relative;
  z-index: auto;
}

/* Reset transform contexts that might interfere */
.transform,
.translate-x-0,
.translate-y-0,
.scale-100 {
  z-index: auto;
}

/* Make sure the header container has the highest priority */
.navbar-fixed {
  transform: translate3d(0, 0, 0) !important;
  backface-visibility: hidden;
}

/* Enhanced navigation styles */
.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

/* Ultra Modern Mobile Menu Styles */

/* Mobile menu full height fix */
.mobile-menu-overlay {
  height: 100vh !important;
  height: 100dvh !important; /* Dynamic viewport height for mobile */
  min-height: 100vh !important;
  min-height: 100dvh !important;
  max-height: 100vh !important;
  max-height: 100dvh !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

/* Ensure proper viewport handling on mobile */
@supports (height: 100dvh) {
  .mobile-menu-overlay {
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
  }
}

/* Prevent body scroll when menu is open */
body.menu-open {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

/* Floating geometric shapes animations */
.floating-shape-1 {
  top: 10%;
  left: 15%;
  animation: float-1 8s ease-in-out infinite;
}

.floating-shape-2 {
  top: 60%;
  right: 20%;
  animation: float-2 6s ease-in-out infinite 2s;
}

.floating-shape-3 {
  bottom: 20%;
  left: 60%;
  animation: float-3 10s ease-in-out infinite 4s;
}

@keyframes float-1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  33% { transform: translate(30px, -30px) rotate(120deg) scale(1.1); }
  66% { transform: translate(-20px, 20px) rotate(240deg) scale(0.9); }
}

@keyframes float-2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(-40px, -40px) rotate(180deg) scale(1.2); }
}

@keyframes float-3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(20px, -50px) rotate(90deg) scale(0.8); }
  75% { transform: translate(-30px, 30px) rotate(270deg) scale(1.1); }
}

/* Animated grid pattern */
.grid-pattern {
  background-image: 
    linear-gradient(rgba(109, 213, 250, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(109, 213, 250, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Menu item container with staggered animation */
.menu-item-container {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  animation: menu-item-appear 0.6s ease-out forwards;
}

@keyframes menu-item-appear {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modern menu link styles */
.modern-menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.5rem;
  margin-bottom: 0.5rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(109, 213, 250, 0.2);
  backdrop-filter: blur(20px);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  min-height: 3.5rem;
}

.modern-menu-link:hover {
  transform: translateX(10px) scale(1.02);
  border-color: rgba(109, 213, 250, 0.6);
  background: rgba(109, 213, 250, 0.1);
  box-shadow: 
    0 10px 30px rgba(109, 213, 250, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modern-menu-link.active {
  background: rgba(109, 213, 250, 0.15);
  border-color: rgba(109, 213, 250, 0.8);
  box-shadow: 
    0 0 20px rgba(109, 213, 250, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Menu link background animation */
.menu-link-bg {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(109, 213, 250, 0.1), 
    rgba(138, 0, 255, 0.1), 
    transparent
  );
  transition: left 0.6s ease-out;
}

.modern-menu-link:hover .menu-link-bg {
  left: 100%;
}

/* Menu link text */
.menu-link-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

/* Menu link icon */
.menu-link-icon {
  position: relative;
  z-index: 2;
  opacity: 0.7;
  transform: translateX(-10px);
  transition: all 0.4s ease;
}

.modern-menu-link:hover .menu-link-icon {
  opacity: 1;
  transform: translateX(0) rotate(5deg);
  color: #6dd5fa;
}

/* CTA Button special styling */
.modern-menu-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: 1.75rem;
  background: linear-gradient(135deg, #8a00ff 0%, #6b4eff 25%, #4e8bff 50%, #4eb8ff 75%, #6dd5fa 100%);
  background-size: 200% 200%;
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 
    0 10px 30px rgba(138, 0, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-height: 3.5rem;
  white-space: nowrap;
  background-clip: padding-box;
  -webkit-background-clip: padding-box;
}

.modern-menu-cta:hover {
  transform: translateY(-3px) scale(1.05);
  background-position: 100% 0;
  animation: gradient-shift 2s ease infinite;
  box-shadow: 
    0 20px 40px rgba(138, 0, 255, 0.4),
    0 0 20px rgba(109, 213, 250, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

/* CTA background animation */
.cta-bg-animation {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent
  );
  transition: left 0.8s ease-out;
}

.modern-menu-cta:hover .cta-bg-animation {
  left: 100%;
}

/* Gradient animation for smooth transitions */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Custom animations for enhanced UX */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(109, 213, 250, 0.3); 
  }
  50% { 
    box-shadow: 0 0 30px rgba(109, 213, 250, 0.6), 0 0 40px rgba(138, 0, 255, 0.3); 
  }
}

.modern-menu-link.active {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modern-menu-link {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    min-height: 3rem;
    margin-bottom: 0.375rem;
  }
  
  .modern-menu-cta {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
    min-height: 3rem;
    white-space: nowrap;
    background: linear-gradient(135deg, #8a00ff 0%, #6b4eff 25%, #4e8bff 50%, #4eb8ff 75%, #6dd5fa 100%);
    background-size: 200% 200%;
    background-clip: padding-box;
    -webkit-background-clip: padding-box;
  }
  
  .floating-shape-1,
  .floating-shape-2,
  .floating-shape-3 {
    display: none; /* Hide on small screens for performance */
  }
}

/* High DPI / Retina display optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .modern-menu-cta {

    background-size: 300% 300%;
    transform: translateZ(0); /* Force hardware acceleration */
    will-change: background-position;
  }
}

/* Enhanced desktop nav styles (keeping existing) */
.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before {
  left: 100%;
}

/* Feature cards enhanced styling */
.feature-card {
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(109, 213, 250, 0.1), transparent);
  transition: left 0.8s;
}

.feature-card:hover::before {
  left: 100%;
}

/* Service cards styling */
.service-card {
  position: relative;
  overflow: hidden;
}

.service-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(109, 213, 250, 0.05), rgba(138, 0, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.service-card:hover::after {
  opacity: 1;
}

/* Chat widget enhancements */
.chat {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(15px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(109, 213, 250, 0.2);
}

.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #6dd5fa, #8a00ff);
  border-radius: 3px;
}

/* Enhanced accordion styles */
.accordion-item {
  backdrop-filter: blur(10px);
}

/* Glassmorphism effects */
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Custom button hover effects */
.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s;
}

.btn-primary:hover::before {
  left: 100%;
}

/* Form enhancements */
.form-input {
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.form-input:focus {
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0 2px rgba(109, 213, 250, 0.3);
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(109, 213, 250, 0.1) 0%, 
    rgba(109, 213, 250, 0.3) 50%, 
    rgba(109, 213, 250, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-cyan-400 {
    border-color: #00ffff;
  }
  
  .text-gray-300 {
    color: #ffffff;
  }
  
  .bg-gradient-to-r {
    background: #0066cc;
  }
}

/* Dark mode specific enhancements */
@media (prefers-color-scheme: dark) {
  body {
    color-scheme: dark;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white !important;
    color: black !important;
  }
}
</style>