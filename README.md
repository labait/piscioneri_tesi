# Chatbot AI - Progetto Tesi

Un chatbot AI avanzato sviluppato con Vue.js e integrato con OpenAI Assistant API, Google Gemini e **Imagen 4.0 per image editing**.

## 🎯 Funzionalità Principali

### Chat Testuale e Vocale
- ✅ Chat testuale con AI
- ✅ Modalità conversazione vocale continua
- ✅ Sintesi vocale delle risposte
- ✅ Riconoscimento vocale italiano

### 🖼️ Image Editing (NEW!)
- ✅ **Carica immagini** e modificale con prompt
- ✅ **Imagen 4.0** (Google Vertex AI) per editing immagini
- ✅ **Gemini 2.0 Flash** per analisi immagini
- ✅ Visualizzazione originale e modificata in chat
- ✅ **SOLO tecnologia Google** - NO GPT, NO DALL-E

📖 **Guida completa**: Vedi [`IMAGEN_SETUP.md`](./IMAGEN_SETUP.md) e [`IMAGEN_USAGE.md`](./IMAGEN_USAGE.md)

### Altre Funzionalità
- ✅ Salvataggio conversazioni su Airtable
- ✅ Interfaccia responsive e moderna
- ✅ Supporto embed per integrazione su altri siti
- ✅ Editing e ri-invio messaggi
- ✅ Archivio conversazioni

## Requisiti

- Node.js 16+
- Account OpenAI con API key
- Account Google Cloud (per image editing)
- Account Airtable (opzionale)
- Account Netlify per il deploy

## Configurazione Locale

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Crea un file `.env` nella root del progetto con le seguenti variabili:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OPENAI_ASSISTANT_ID=your_assistant_id_here
   VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
   VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here
   VITE_AIRTABLE_TABLE_NAME=your_table_name_here
   VITE_APP_NAME=your_app_name_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Per Image Editing (configurare su Netlify, non in locale):
   # GOOGLE_CLOUD_PROJECT_ID=your_project_id
   # GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

4. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

## Deploy su Netlify

### Configurazione Variabili d'Ambiente

⚠️ **IMPORTANTE**: Per funzionare correttamente su Netlify, devi configurare le variabili d'ambiente:

1. Vai su [Netlify Dashboard](https://app.netlify.com)
2. Seleziona il tuo sito
3. Vai in **Site settings** > **Environment variables**
4. Aggiungi le seguenti variabili:

   | Chiave | Valore | Necessaria per |
   |--------|--------|----------------|
   | `VITE_OPENAI_API_KEY` | La tua OpenAI API key | Chat testuale |
   | `VITE_OPENAI_ASSISTANT_ID` | ID del tuo OpenAI Assistant | Chat testuale |
   | `VITE_GEMINI_API_KEY` | La tua Google Gemini API key | Analisi immagini |
   | `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud Project ID | **Image editing** |
   | `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON completo del Service Account | **Image editing** |
   | `VITE_AIRTABLE_API_KEY` | La tua Airtable API key | Salvataggio conversazioni (opzionale) |
   | `VITE_AIRTABLE_BASE_ID` | ID della base Airtable | Salvataggio conversazioni (opzionale) |
   | `VITE_AIRTABLE_TABLE_NAME` | Nome della tabella Airtable | Salvataggio conversazioni (opzionale) |
   | `VITE_APP_NAME` | Nome della tua app | Generale |

5. **Per configurare Image Editing**: Segui la guida completa in [`IMAGEN_SETUP.md`](./IMAGEN_SETUP.md)
6. Rideploya il sito dopo aver aggiunto le variabili

### Configurazione OpenAI Assistant

Per creare un Assistant OpenAI:

1. Vai su [OpenAI Platform](https://platform.openai.com)
2. Sezione **Assistants**
3. Crea un nuovo Assistant
4. Configura le istruzioni e le funzionalità
5. Copia l'ID dell'Assistant creato

### Configurazione Build

Il file `netlify.toml` è già configurato con:
- Comando di build: `npm run build`
- Directory di pubblicazione: `dist`
- Redirects per SPA
- Headers di sicurezza

## Struttura del Progetto

```
src/
├── components/
│   ├── chat.vue          # Componente chat principale
│   ├── embed.vue         # Versione embed del chat
│   ├── widgetChat.vue    # Widget chat
│   └── widgetLink.vue    # Widget link
├── views/               # Pagine dell'applicazione
├── utils/              # Utilità
├── router.js           # Configurazione routing
└── main.js             # Entry point
```

## Troubleshooting

### Il chatbot non funziona su Netlify

1. **Verifica le variabili d'ambiente**: Assicurati che tutte le variabili `VITE_*` siano configurate correttamente su Netlify
2. **Controlla i logs**: Vai in **Site settings** > **Functions** > **Function logs**
3. **Verifica la console**: Apri la console del browser per vedere eventuali errori
4. **Testa localmente**: Assicurati che funzioni in locale con le stesse variabili

### Errori comuni

- **401 Unauthorized**: API key OpenAI non valida o mancante
- **404 Not Found**: Assistant ID non valido
- **CORS Errors**: Problemi di configurazione headers (risolti in `netlify.toml`)

### Variabili mancanti

Se vedi l'errore "Configurazione mancante", controlla che tutte le variabili d'ambiente necessarie siano presenti e abbiano il prefisso `VITE_`.

## Sviluppo

```bash
# Sviluppo
npm run dev

# Build per produzione
npm run build

# Preview build di produzione
npm run preview
```

## Tecnologie Utilizzate

- Vue.js 3
- Vite
- TailwindCSS
- OpenAI Assistant API
- Airtable API
- Web Speech API
- Netlify

## Supporto

Per problemi o domande, controlla:
1. I logs di Netlify
2. La console del browser
3. Le variabili d'ambiente configurate
4. Lo stato delle API OpenAIpiscioneri tesi

## setup

* install node modules with `npm i`
* copy `env.sample` to `.env`and set variables

# run
use ```netlify dev```  
or w/ docker
```bash
docker compose up #run 
docker compose up -d #run detached
docker compose exec app [command] #exec command inside container
docker compose exec app sh #open a shell 
```
