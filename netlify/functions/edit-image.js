/**
 * Netlify Function per l'editing di immagini usando Google Vertex AI Imagen 4.0
 * 
 * SETUP RICHIESTO:
 * 1. Abilita Vertex AI API nel tuo Google Cloud Project
 * 2. Crea un Service Account con ruolo "Vertex AI User"
 * 3. Scarica il JSON key del Service Account
 * 4. Aggiungi le seguenti variabili ambiente in Netlify:
 *    - GOOGLE_CLOUD_PROJECT_ID: il tuo project ID
 *    - GOOGLE_SERVICE_ACCOUNT_KEY: il contenuto del JSON (tutto il file come stringa)
 * 
 * ENDPOINT: /.netlify/functions/edit-image
 * METHOD: POST
 * BODY: { imageBase64: string, prompt: string, mimeType: string }
 * RESPONSE: { success: boolean, imageBase64?: string, error?: string }
 */

import { VertexAI } from '@google-cloud/vertexai'

// Handler della funzione
export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method Not Allowed. Use POST.' 
      })
    }
  }

  try {
    // Verifica variabili ambiente
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!projectId || !serviceAccountKey) {
      throw new Error(
        'Configurazione mancante: GOOGLE_CLOUD_PROJECT_ID o GOOGLE_SERVICE_ACCOUNT_KEY non impostati'
      )
    }

    // Parse del body
    const body = JSON.parse(event.body)
    const { imageBase64, prompt, mimeType = 'image/jpeg' } = body

    if (!imageBase64 || !prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'imageBase64 e prompt sono obbligatori' 
        })
      }
    }

    console.log('🚀 Inizio editing immagine con Imagen 4.0')
    console.log('📝 Prompt:', prompt.substring(0, 100))

    // Parse del service account
    let credentials
    try {
      credentials = JSON.parse(serviceAccountKey)
    } catch (e) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY non è un JSON valido')
    }

    // Inizializza Vertex AI con le credenziali
    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1', // Imagen è disponibile in questa region
      googleAuthOptions: {
        credentials: credentials
      }
    })

    // APPROCCIO 1: Usa Imagen 4.0 Edit per modificare l'immagine esistente
    console.log('🎨 Chiamata a Imagen 4.0 Edit...')

    // Converti base64 in Buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64')

    // Usa l'API Imagen Edit
    const model = vertexAI.preview.getGenerativeModel({
      model: 'imagegeneration@006', // Imagen 4.0
    })

    // Genera immagine modificata
    const request = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Edit this image: ${prompt}`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
      }
    }

    const response = await model.generateContent(request)

    console.log('📦 Risposta ricevuta da Imagen')

    // Estrai l'immagine dalla risposta
    if (response.response && response.response.candidates) {
      for (const candidate of response.response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              console.log('✅ Immagine modificata generata con successo')
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  imageBase64: part.inlineData.data,
                  mimeType: part.inlineData.mimeType || 'image/png'
                })
              }
            }
          }
        }
      }
    }

    // Se non troviamo un'immagine, proviamo approccio alternativo
    console.log('⚠️ Tentativo con Imagen Generate (fallback)...')
    
    // APPROCCIO 2: Usa Gemini per analizzare + Imagen per generare
    const geminiModel = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'
    })

    // Analizza l'immagine e crea una descrizione dettagliata
    const analysisPrompt = `
Analizza questa immagine in dettaglio e genera una descrizione completa che includa:
- Tutti gli elementi visivi presenti
- Colori, composizione, stile
- Illuminazione e prospettiva

Poi, applica questa modifica: "${prompt}"

Rispondi con una descrizione dettagliata dell'immagine DOPO le modifiche richieste, 
pronta per essere usata in un generatore di immagini AI.
    `.trim()

    const analysisResponse = await geminiModel.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      },
      { text: analysisPrompt }
    ])

    const detailedDescription = analysisResponse.response.text()
    console.log('📋 Descrizione generata:', detailedDescription.substring(0, 150))

    // Ora usa Imagen per generare l'immagine basata sulla descrizione
    const imagenModel = vertexAI.preview.getGenerativeModel({
      model: 'imagegeneration@006'
    })

    const generateRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: detailedDescription
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
      }
    }

    const generateResponse = await imagenModel.generateContent(generateRequest)

    // Estrai l'immagine generata
    if (generateResponse.response && generateResponse.response.candidates) {
      for (const candidate of generateResponse.response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              console.log('✅ Immagine generata con successo (approccio alternativo)')
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  success: true,
                  imageBase64: part.inlineData.data,
                  mimeType: part.inlineData.mimeType || 'image/png'
                })
              }
            }
          }
        }
      }
    }

    // Se nessun approccio funziona
    throw new Error('Nessuna immagine generata dalla risposta di Vertex AI')

  } catch (error) {
    console.error('❌ Errore:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Errore durante l\'editing dell\'immagine',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
