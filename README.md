# Chatbot AI - Progetto Tesi

Un chatbot AI avanzato sviluppato con Vue.js e integrato con OpenAI Assistant API.

## Funzionalità Principali

- Chat testuale e vocale con AI
- Modalità conversazione vocale continua
- Salvataggio conversazioni su Airtable
- Interfaccia responsive e moderna
- Supporto embed per integrazione su altri siti

## Requisiti

- Node.js 16+
- Account OpenAI con API key
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

   | Chiave | Valore |
   |--------|--------|
   | `VITE_OPENAI_API_KEY` | La tua OpenAI API key |
   | `VITE_OPENAI_ASSISTANT_ID` | ID del tuo OpenAI Assistant |
   | `VITE_AIRTABLE_API_KEY` | La tua Airtable API key (opzionale) |
   | `VITE_AIRTABLE_BASE_ID` | ID della base Airtable (opzionale) |
   | `VITE_AIRTABLE_TABLE_NAME` | Nome della tabella Airtable (opzionale) |
   | `VITE_APP_NAME` | Nome della tua app |

5. Rideploya il sito dopo aver aggiunto le variabili

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
