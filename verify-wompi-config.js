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
  
  // Check for placeholder values
  const isPlaceholder = value && (
    value.includes('your-public-key-here') || 
    value.includes('your-private-key-here') || 
    value.includes('your-integrity-secret-here') || 
    value.includes('your-webhook-secret-here')
  );
  
  const isValid = isSet && !isPlaceholder;
  const prefix = isValid ? '✅' : (isSet ? '⚠️' : '❌');
  const status = isValid ? 'CONFIGURADA' : (isSet ? 'PLACEHOLDER - NECESITA ACTUALIZACIÓN' : 'FALTANTE');
  
  console.log(`${prefix} ${varName}: ${status}`);
  
  if (isSet && value.length > 10 && !isPlaceholder) {
    console.log(`   Valor: ${value.substring(0, 20)}...`);
  } else if (isPlaceholder) {
    console.log(`   ⚠️  Valor placeholder detectado - reemplaza con tu clave real de Wompi`);
  }
  
  if (!isValid) {
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
  console.log('📖 Ver WOMPI_SETUP.md para instrucciones detalladas');
  console.log('🌐 Obtén tus claves en: https://comercios.wompi.co/');
}

console.log('='.repeat(50) + '\n');