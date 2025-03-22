<template>
    <section id="landing" class="min-h-screen bg-gradient-to-b from-[#0b001a] to-[#0f0025] text-white py-20 px-6 md:px-20">
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
  </template>
  
  <script>
  export default {
    name: "Landing",
  };
  </script>
  
  <style scoped>
  </style>
  