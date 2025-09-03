# Deploy su Netlify - Guida Completa

## 🚀 Configurazione Variabili d'Ambiente su Netlify

**⚠️ IMPORTANTE**: Per far funzionare il chatbot su Netlify, devi configurare correttamente le variabili d'ambiente.

### Step 1: Accedi al Dashboard Netlify

1. Vai su [https://app.netlify.com](https://app.netlify.com)
2. Seleziona il tuo sito
3. Vai in **Site settings** > **Environment variables**

### Step 2: Aggiungi le Variabili

Clicca su **Add variable** e aggiungi queste variabili una per una:

| Nome Variabile |
|----------------|
| `VITE_OPENAI_API_KEY` |
| `VITE_OPENAI_ASSISTANT_ID` |
| `VITE_AIRTABLE_API_KEY` | 
| `VITE_AIRTABLE_BASE_ID` |
| `VITE_AIRTABLE_TABLE_NAME` |
| `VITE_APP_NAME` |

### Step 3: Rideploy del Sito

Dopo aver aggiunto tutte le variabili:

1. Vai in **Deploys**
2. Clicca su **Trigger deploy** > **Deploy site**
3. Attendi il completamento del deploy

## 🔧 Risoluzione Problemi

### Problema: "Configurazione mancante" nell'interfaccia

**Causa**: Le variabili d'ambiente non sono configurate correttamente.

**Soluzione**:
1. Verifica che tutte le 6 variabili siano presenti in Netlify
2. Controlla che non ci siano spazi o caratteri extra nei nomi delle variabili
3. Fai un nuovo deploy dopo aver aggiunto le variabili

### Problema: Errori 401 Unauthorized

**Causa**: API key OpenAI non valida.

**Soluzione**:
1. Verifica che `VITE_OPENAI_API_KEY` sia copiata correttamente
2. Controlla che la API key sia ancora valida su [OpenAI Platform](https://platform.openai.com)

### Problema: Assistant non risponde

**Causa**: Assistant ID non corretto.

**Soluzione**:
1. Verifica che `VITE_OPENAI_ASSISTANT_ID` sia corretto
2. Controlla che l'Assistant esista nel tuo account OpenAI

### Problema: Errori CORS

**Causa**: Problemi di configurazione headers.

**Soluzione**: Il file `netlify.toml` dovrebbe gestire automaticamente i CORS. Se persiste il problema:
1. Verifica che il file `netlify.toml` sia presente nella root
2. Controlla che contenga la configurazione headers corretta

## 📝 Verifica Deploy

Dopo il deploy, per verificare che tutto funzioni:

1. Apri il sito Netlify
2. Apri la console del browser (F12)
3. Clicca per aprire il chat
4. Se vedi l'errore "Configurazione mancante", le variabili non sono configurate
5. Se il chat si carica ma non risponde, verifica le API keys

## 🔍 Debug

Per debug avanzato:

1. **Console Browser**: Apri F12 > Console per vedere errori JavaScript
2. **Netlify Logs**: Vai in Site overview > Functions > View function logs
3. **Build Logs**: Vai in Deploys > clicca sull'ultimo deploy per vedere i logs di build

## 📋 Checklist Pre-Deploy

Prima di fare il deploy, verifica:

- [ ] File `.env` presente localmente con tutte le variabili
- [ ] Build locale funzionante (`npm run build`)
- [ ] Test locale funzionante (`npm run dev`)
- [ ] Variabili d'ambiente configurate su Netlify
- [ ] File `netlify.toml` presente nella root del progetto

## 🆘 Supporto

Se hai ancora problemi:

1. Controlla i logs di Netlify
2. Verifica la console del browser per errori
3. Testa localmente per isolare il problema
4. Verifica che tutte le API keys siano ancora valide

---

## Comando Rapido per Test Locale

```bash
# Verifica configurazione
npm run check-config

# Test locale
npm run dev

# Build per produzione
npm run build
```
