# 🖼️ Image Editing In-Chat - Guida Rapida

## 🎯 Cosa fa questa funzionalità?

Il tuo chatbot ora ha la **stessa funzionalità di Google Gemini** per la modifica di immagini:
- Carichi un'immagine 📤
- Scrivi un prompt di modifica ✍️  
- Ricevi l'immagine modificata ✨

**Usa SOLO tecnologia Google**:
- ✅ **Gemini 2.0 Flash Exp** per analisi immagini
- ✅ **Imagen 4.0** (Vertex AI) per generazione/editing immagini
- ❌ **NO GPT** - ❌ **NO DALL-E**

## 🚀 Come usarla

### 1. Nell'interfaccia chat

1. Clicca sul **pulsante arancione** con l'icona 📷 (a sinistra del pulsante invio)
2. Seleziona un'immagine dal tuo computer
   - Formati supportati: JPG, PNG, WEBP, GIF
   - Dimensione max: 10MB
3. Vedrai un'**anteprima** dell'immagine caricata
4. Scrivi il **prompt di modifica** nell'input (esempio: "aggiungi un cappello rosso")
5. Premi **Invio** o clicca sul pulsante di invio
6. Attendi ~10-30 secondi (elaborazione con Imagen 4.0)
7. Riceverai l'**immagine modificata** nella conversazione! 🎉

### 2. Esempi di prompt

#### Semplici modifiche
- "Cambia lo sfondo in blu"
- "Aggiungi occhiali da sole"
- "Rendi l'immagine in bianco e nero"
- "Aggiungi un tramonto sullo sfondo"

#### Modifiche complesse
- "Trasforma questa foto in stile cartoon"
- "Aggiungi un cappello a cilindro e un monocolo"
- "Cambia la stagione da estate a inverno"
- "Rimuovi lo sfondo e sostituiscilo con una spiaggia"

#### Stile artistico
- "Applica uno stile Van Gogh"
- "Rendi l'immagine come un dipinto ad olio"
- "Trasforma in pixel art"
- "Converti in un disegno a matita"

## 🔧 Setup (per sviluppatori)

### Prerequisiti
- Account Google Cloud Platform
- Vertex AI API abilitata
- Service Account configurato
- Variabili d'ambiente su Netlify

### Configurazione completa
Segui la guida dettagliata in [`IMAGEN_SETUP.md`](./IMAGEN_SETUP.md)

### Quick Start
```bash
# 1. Installa dipendenze
npm install

# 2. Configura le variabili d'ambiente su Netlify:
# - GOOGLE_CLOUD_PROJECT_ID
# - GOOGLE_SERVICE_ACCOUNT_KEY

# 3. Deploy
npm run build
netlify deploy --prod
```

## 📦 File modificati/creati

### Nuovi file
- `src/composables/useImageEditingChat.js` - Logica gestione immagini
- `netlify/functions/edit-image.js` - Endpoint backend Imagen 4.0
- `IMAGEN_SETUP.md` - Guida setup completa
- `IMAGEN_USAGE.md` - Questa guida

### File modificati
- `src/components/chat.vue` - Aggiunto UI e logica upload/visualizzazione
- `package.json` - Aggiunto @google-cloud/vertexai

## 🎨 Architettura

```
[Browser/Client]
    ↓ Carica immagine
[useImageEditingChat composable]
    ↓ Upload file
[Chat Component]
    ↓ Invia: immagine base64 + prompt
[Netlify Function: edit-image]
    ↓ Autentica con Service Account
[Google Vertex AI]
    ↓ Gemini 2.0 (analizza)
    ↓ Imagen 4.0 (genera/modifica)
[Netlify Function]
    ↓ Ritorna: immagine modificata (base64)
[Chat Component]
    ↓ Visualizza nella conversazione
[Utente] 🎉
```

## 💡 Funzionalità

### Cosa funziona
✅ Upload immagini (JPG, PNG, WEBP, GIF)  
✅ Preview immagine caricata  
✅ Modifica con Imagen 4.0  
✅ Visualizzazione immagine originale e modificata  
✅ Salvataggio conversazione con immagini  
✅ Loading states durante elaborazione  
✅ Gestione errori  
✅ Rimozione immagine caricata  

### Cosa NON è incluso
❌ Edit multiplo (una modifica alla volta)  
❌ Cronologia modifiche sulle stesse immagini  
❌ Download diretto immagini (puoi fare right-click > salva)  
❌ Batch processing (più immagini insieme)  

## 🐛 Troubleshooting

### L'immagine non si carica
- Verifica che sia in formato supportato (JPG, PNG, WEBP, GIF)
- Controlla che sia < 10MB
- Prova con un'altra immagine

### Errore "API Key non configurata"
- Verifica le variabili d'ambiente su Netlify
- Vedi `IMAGEN_SETUP.md` step 6

### Errore durante l'elaborazione
- Controlla i log della Netlify Function
- Verifica che Vertex AI API sia abilitata
- Controlla di avere crediti su Google Cloud

### L'elaborazione è lenta
- Imagen 4.0 impiega ~10-30 secondi
- Dipende dalla complessità dell'immagine e del prompt
- È normale, non è un errore!

## 💰 Costi

- **Imagen 4.0**: ~$0.04 per immagine generata (1024x1024)
- **Gemini API**: incluso nel free tier o molto economico
- **Netlify Functions**: 125k invocazioni/mese gratis

**Stima**: Con ~100 modifiche/mese = ~$4-5/mese

## 📚 Riferimenti

- [Vertex AI Imagen Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)

## 🎯 Prossimi Miglioramenti Possibili

- [ ] Supporto per modifiche multiple sulla stessa immagine
- [ ] Cronologia modifiche
- [ ] Download immagini modificate
- [ ] Preset di stili predefiniti
- [ ] Confronto side-by-side originale vs modificata
- [ ] Supporto per video editing (quando disponibile)

---

**Fatto con ❤️ usando solo tecnologia Google** 🚀
