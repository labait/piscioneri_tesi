#!/usr/bin/env node

/**
 * Script per verificare la configurazione delle variabili d'ambiente
 */

// Carica le variabili d'ambiente dal file .env
const fs = require('fs');
const path = require('path');

// Funzione per caricare il file .env
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

console.log('🔍 Verifica configurazione variabili d\'ambiente...\n');

const requiredVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_OPENAI_ASSISTANT_ID',
  'VITE_AIRTABLE_API_KEY',
  'VITE_AIRTABLE_BASE_ID',
  'VITE_AIRTABLE_TABLE_NAME',
  'VITE_APP_NAME'
];

const envVars = loadEnvFile();
const missingVars = [];
const presentVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName] || envVars[varName];
  if (!value) {
    missingVars.push(varName);
  } else {
    presentVars.push({
      name: varName,
      value: varName.includes('KEY') ? '***hidden***' : value
    });
  }
});

console.log('✅ Variabili configurate:');
presentVars.forEach(({ name, value }) => {
  console.log(`   ${name}: ${value}`);
});

if (missingVars.length > 0) {
  console.log('\n❌ Variabili mancanti:');
  missingVars.forEach(varName => {
    console.log(`   ${varName}`);
  });
  
  console.log('\n📋 Per risolvere:');
  console.log('1. Crea un file .env nella root del progetto');
  console.log('2. Aggiungi le variabili mancanti');
  console.log('3. Su Netlify, vai in Site settings > Environment variables');
  
  process.exit(1);
} else {
  console.log('\n🎉 Tutte le variabili sono configurate correttamente!');
  process.exit(0);
}
