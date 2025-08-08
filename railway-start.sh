#!/bin/bash

echo "🚀 Starting Sigerist Luxury Bags on Railway..."

# Configurar base de datos si es necesario
if [ "$NODE_ENV" = "production" ]; then
  echo "📊 Setting up database for production..."
  node seed-database.js
fi

# Iniciar aplicación
echo "🎯 Starting server..."
node dist/index.js