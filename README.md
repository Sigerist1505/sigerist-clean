# 🛍️ Sigerist Luxury Bags

Plataforma de e-commerce de lujo para bolsos personalizados con chatbot de WhatsApp con IA.

## 🚀 Deploy en Railway

### 1. Preparación del Repositorio
```bash
# Clona este repositorio limpio
git clone <tu-repo>
cd sigerist-luxury-bags

# Instala dependencias
npm install
```

### 2. Variables de Entorno
Copia `.env.example` a `.env` y configura:

```env
# Database (Railway auto-provisiona)
DATABASE_URL=postgresql://...

# AI Services
ANTHROPIC_API_KEY=your-anthropic-key

# WhatsApp Business
META_WHATSAPP_ACCESS_TOKEN=your-token
META_WHATSAPP_PHONE_NUMBER_ID=your-id
META_WEBHOOK_VERIFY_TOKEN=your-verify-token

# Payments
STRIPE_SECRET_KEY=your-stripe-key
WOMPI_PRIVATE_KEY=your-wompi-key

# App
SESSION_SECRET=random-secure-string
NODE_ENV=production
PORT=5000
```

### 3. Deploy en Railway

1. **Conecta Repositorio**:
   - Ve a [railway.app](https://railway.app)
   - Conecta tu repositorio de GitHub

2. **Configura Variables**:
   - Agrega todas las variables del `.env.example`
   - Railway creará automáticamente `DATABASE_URL`

3. **Deploy Automático**:
   - Railway detectará el `Dockerfile`
   - Build y deploy automático ✅

## 🏗️ Arquitectura

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── components/     # Componentes UI
│   ├── pages/         # Páginas de la app
│   ├── contexts/      # Context providers
│   ├── lib/           # Utilities
│   └── main.tsx       # Entry point
└── index.html         # HTML template
```

### Backend (Express + TypeScript)
```
server/
├── index.ts           # Server principal
├── routes.ts          # API endpoints
├── storage.ts         # Database operations
└── db.ts              # Database connection
```

### Base de Datos (PostgreSQL + Drizzle)
```
shared/
└── schema.ts          # Database schemas
```

## 🛠️ Desarrollo Local

```bash
# Desarrollo
npm run dev          # Frontend en :3000, Backend en :5000

# Build
npm run build        # Compila todo

# Producción
npm start            # Ejecuta build
```

## ✅ Funcionalidades

- 🛒 **E-commerce completo**: Catálogo, carrito, checkout
- 💳 **Pagos**: Stripe + Wompi (Colombia)
- 🎨 **Personalización**: Bordados y accesorios
- 📱 **WhatsApp Bot**: IA con Anthropic Claude
- 📱 **Responsive**: Mobile-first design
- 🔍 **SEO**: Meta tags optimizados

## 🎯 Stack Optimizado

### Dependencies Esenciales (60% reducción)
- ✅ `@anthropic-ai/sdk` - WhatsApp IA
- ✅ `stripe` - Pagos internacionales
- ✅ `drizzle-orm` - Base de datos moderna
- ✅ `express` - Backend robusto
- ✅ `react` + `@radix-ui/*` - UI profesional

### Eliminadas (No necesarias)
- ❌ `@sendgrid/mail` - Email marketing
- ❌ `openai` - Generación de imágenes
- ❌ `twilio` - SMS
- ❌ `@replit/vite-plugin-*` - Plugins Replit

## 🚂 Railway Ready

**Garantías de Deploy Exitoso**:
- ✅ Vite config funcional (encuentra `client/index.html`)
- ✅ Build commands optimizados
- ✅ TypeScript sin errores
- ✅ Dockerfile optimizado para Node.js 20
- ✅ Health checks configurados
- ✅ Variables de entorno documentadas

---

**Deploy garantizado en Railway** 🎉