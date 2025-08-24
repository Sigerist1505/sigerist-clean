#!/usr/bin/env node

// Test script to verify Wompi configuration
import 'dotenv/config';

console.log('🔍 Verificando configuración de Wompi...\n');

const requiredVars = [
  'WOMPI_PUBLIC_KEY',
  'WOMPI_PRIVATE_KEY', 
  'WOMPI_INTEGRITY_SECRET',
  'WOMPI_WEBHOOK_SECRET'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value;
  const prefix = isSet ? '✅' : '❌';
  const status = isSet ? 'CONFIGURADA' : 'FALTANTE';
  
  console.log(`${prefix} ${varName}: ${status}`);
  
  if (isSet && value.length > 10) {
    console.log(`   Valor: ${value.substring(0, 20)}...`);
  }
  
  if (!isSet) {
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allConfigured) {
  console.log('✅ CONFIGURACIÓN COMPLETA');
  console.log('🚀 Wompi está listo para procesar pagos');
} else {
  console.log('❌ CONFIGURACIÓN INCOMPLETA'); 
  console.log('🔧 Configura las variables faltantes en .env');
  console.log('📖 Ver WOMPI_FIX.md para más detalles');
}

console.log('='.repeat(50) + '\n');