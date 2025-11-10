# 🎨 Configurazione Image Editing con Imagen 4.0 (Vertex AI)

Questa guida ti aiuterà a configurare la funzionalità di image editing in-chat che usa **Google Imagen 4.0** su **Vertex AI**.

## 📋 Prerequisiti

- Account Google Cloud Platform
- Progetto Google Cloud creato
- Carta di credito associata (per attivare l'API, anche se c'è il free tier)

## 🚀 Setup Passo per Passo

### 1. Crea e Configura il Progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Annota il **Project ID** (lo trovi nel dashboard)

### 2. Abilita le API Necessarie

Nel tuo progetto Google Cloud, abilita queste API:

1. **Vertex AI API**
   - Vai su "APIs & Services" > "Library"
   - Cerca "Vertex AI API"
   - Clicca "Enable"

2. **Cloud Resource Manager API** (se richiesto)
   - Cerca "Cloud Resource Manager API"
   - Clicca "Enable"

### 3. Crea un Service Account

1. Vai su "IAM & Admin" > "Service Accounts"
2. Clicca "Create Service Account"
3. Compila:
   - **Name**: `imagen-chatbot-sa` (o un nome a tua scelta)
   - **Description**: "Service Account per image editing con Imagen 4.0"
4. Clicca "Create and Continue"

### 4. Assegna i Ruoli al Service Account

Aggiungi questi ruoli al Service Account:

- **Vertex AI User** (`roles/aiplatform.user`)
  - Permette di usare i modelli Vertex AI, incluso Imagen

Optional ma consigliati:
- **Service Account Token Creator** (se usi delegazione)

Clicca "Continue" e poi "Done"

### 5. Crea e Scarica la Chiave JSON

1. Clicca sul Service Account appena creato
2. Vai nella tab "Keys"
3. Clicca "Add Key" > "Create new key"
4. Seleziona "JSON"
5. Clicca "Create"
6. Il file JSON verrà scaricato automaticamente
7. **⚠️ IMPORTANTE**: Conserva questo file in modo sicuro, non condividerlo mai!

Il file JSON avrà questa struttura:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "imagen-chatbot-sa@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 6. Configura le Variabili d'Ambiente su Netlify

1. Vai su [Netlify Dashboard](https://app.netlify.com/)
2. Seleziona il tuo sito
3. Vai su "Site settings" > "Environment variables"
4. Aggiungi queste variabili:

#### `GOOGLE_CLOUD_PROJECT_ID`
- **Value**: Il tuo Project ID (es: `my-chatbot-project-123456`)

#### `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: **L'INTERO contenuto del file JSON** (copialo e incollalo come stringa)
- Esempio:
  ```json
  {"type":"service_account","project_id":"my-project",...}
  ```

⚠️ **ATTENZIONE**: 
- Copia TUTTO il contenuto del JSON, dalle parentesi graffe iniziali a quelle finali
- Assicurati che non ci siano spazi extra all'inizio o alla fine
- Il JSON deve essere valido (puoi testarlo su jsonlint.com)

### 7. Installa le Dipendenze

Nel tuo progetto locale, esegui:

```bash
npm install @google-cloud/vertexai
```

Questo è già incluso nel `package.json`, quindi un semplice `npm install` dovrebbe bastare.

### 8. Deploy su Netlify

```bash
# Build del progetto
npm run build

# Deploy (se usi Netlify CLI)
netlify deploy --prod
```

Oppure fai push su Git se hai il deploy automatico configurato.

### 9. Test della Funzionalità

1. Apri il tuo chatbot
2. Clicca sul pulsante arancione con l'icona immagine (📷)
3. Seleziona un'immagine dal tuo computer
4. Scrivi un prompt di modifica (es: "aggiungi un cappello rosso", "cambia lo sfondo in blu")
5. Premi Invio
6. Attendi l'elaborazione (~10-30 secondi)
7. Riceverai l'immagine modificata nella chat! 🎉

## 💰 Costi

### Vertex AI - Imagen 4.0 Pricing (Dicembre 2024)

- **Image Generation**: ~$0.04 per immagine (1024x1024)
- **Image Editing**: Simile al generation
- **Free Tier**: Google Cloud offre $300 di crediti gratuiti per 90 giorni

⚠️ **Monitora i costi**:
- Vai su "Billing" nel Google Cloud Console
- Imposta un budget alert (consigliato: $10-20/mese per test)

## 🔍 Troubleshooting

### Errore: "API Key non configurata"
- Verifica che `GOOGLE_SERVICE_ACCOUNT_KEY` sia impostata correttamente
- Controlla che il JSON sia valido

### Errore: "Permission Denied"
- Verifica che il Service Account abbia il ruolo "Vertex AI User"
- Controlla che Vertex AI API sia abilitata

### Errore: "Project not found"
- Verifica che `GOOGLE_CLOUD_PROJECT_ID` sia corretto
- Assicurati che il progetto esista e sia attivo

### Errore: "Model not available"
- Imagen 4.0 è disponibile in `us-central1`
- Verifica di avere abilitato Vertex AI API

### Le immagini non vengono generate
- Controlla i log della Netlify Function:
  - Vai su Netlify Dashboard > Functions > `edit-image` > Logs
- Verifica che non ci siano errori di quota

## 📚 Risorse

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Imagen Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

## 🔒 Sicurezza

### ⚠️ IMPORTANTE - Non Esporre Mai:
- ❌ Il file JSON del Service Account
- ❌ Le chiavi private
- ❌ Il Project ID in repository pubblici (usa variabili d'ambiente)

### ✅ Best Practices:
- ✅ Usa sempre variabili d'ambiente per le credenziali
- ✅ Ruota regolarmente le chiavi del Service Account
- ✅ Limita i permessi al minimo necessario
- ✅ Monitora l'uso dell'API per attività sospette
- ✅ Imposta budget alerts su Google Cloud

## 🎯 Funzionalità Supportate

✅ **Caricamento immagini** (JPG, PNG, WEBP, GIF)  
✅ **Modifica con prompt** (es: "aggiungi occhiali da sole")  
✅ **Preview immagine originale** nella chat  
✅ **Visualizzazione immagine modificata** nella chat  
✅ **Salvataggio conversazioni** con immagini  
✅ **Solo modelli Google** (Gemini + Imagen) - NO GPT, NO DALL-E ✨

## 🐛 Debug

Per vedere i log dettagliati:

1. **Browser Console** (F12)
   - Vedi log client-side
   - Controlla eventuali errori JavaScript

2. **Netlify Function Logs**
   - Dashboard > Functions > edit-image > Logs
   - Vedi log server-side e errori API

3. **Google Cloud Logs**
   - Cloud Console > Logging > Logs Explorer
   - Filtra per Vertex AI API

## 📞 Supporto

Se hai problemi:
1. Controlla i log (browser + Netlify)
2. Verifica le variabili d'ambiente
3. Controlla i permessi del Service Account
4. Verifica di avere crediti/billing attivo su Google Cloud

---

**Fatto! 🎉** Ora il tuo chatbot può modificare immagini usando Imagen 4.0, esattamente come fa Google Gemini web!
