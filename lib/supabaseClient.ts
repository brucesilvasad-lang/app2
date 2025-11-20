
import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// PASSO A PASSO PARA ATIVAR A NUVEM:
// 1. Crie um projeto grátis em https://supabase.com
// 2. Vá em Settings > API
// 3. Copie a "Project URL" e cole abaixo.
// 4. Copie a "anon public key" e cole abaixo.
// ==============================================================================

const SUPABASE_URL = 'https://wkmigwuhzchbnjquhxgo.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWlnd3VoemNoYm5qcXVoeGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODY5OTQsImV4cCI6MjA3OTE2Mjk5NH0.fhQZNKLzdS_YvXNaEC93nKc4CwX416GvctFkkzfCR0E'; 

// ==============================================================================

// Verifica se as chaves foram preenchidas
export const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY) 
    : null;

// Exporta uma flag para saber se a nuvem está ativa
export const isCloudEnabled = !!supabase;

if (!isCloudEnabled) {
    console.log('⚠️ Supabase não configurado. O App está rodando em modo OFFLINE (LocalStorage).');
} else {
    console.log('✅ Conexão com Supabase configurada.');
}
