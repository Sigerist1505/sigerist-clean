# 🚂 GUÍA COMPLETA DE DEPLOY EN RAILWAY

## 📋 CHECKLIST BEFORE DEPLOY

### ✅ 1. Subir Archivos Actualizados a GitHub
```bash
# En tu repositorio sigerist-clean:
git add .
git commit -m "Railway deploy ready - database seeding + production config"
git push origin main
```

### ✅ 2. Variables de Entorno en Railway

**Ve a Railway > tu-proyecto > Settings > Variables y agrega:**

```env
# OBLIGATORIAS
NODE_ENV=production
SESSION_SECRET=sigerist-super-secret-key-2025-railway
PORT=5000

# WhatsApp (usa tus valores actuales)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxx
META_WHATSAPP_PHONE_NUMBER_ID=793444840509227
META_WEBHOOK_VERIFY_TOKEN=sigerist_webhook_verify_2024

# Pagos (opcional al inicio)
STRIPE_SECRET_KEY=sk_test_xxxxx
WOMPI_PRIVATE_KEY=test_xxxxx
```

### ✅ 3. Conectar Base de Datos Neon

**Railway detectará automáticamente tu `DATABASE_URL` desde Neon.**

Si necesitas conectar manualmente:
1. Ve a Railway > Add Service > Database > PostgreSQL
2. O usa tu Neon existente copiando la URL

### ✅ 4. Deploy Automático

Railway detectará los cambios y hará deploy automático.

## 🔧 TROUBLESHOOTING

### Problema: "relation does not exist"
**Solución:** El script `seed-database.js` se ejecuta automáticamente al hacer build.

### Problema: Solo backend funciona
**Solución:** Verifica que `NODE_ENV=production` esté configurado.

### Problema: 404 en frontend
**Solución:** El servidor está configurado para servir frontend en producción automáticamente.

## 📊 VERIFICACIÓN POST-DEPLOY

1. **Health Check:** `https://tu-app.railway.app/api/health`
2. **Frontend:** `https://tu-app.railway.app/`
3. **Productos:** `https://tu-app.railway.app/api/products`

## 🎯 URLs DE PRODUCCIÓN

- **Frontend:** https://sigeristluxurybags.com
- **API:** https://sigeristluxurybags.com/api/
- **WhatsApp Webhook:** https://sigeristluxurybags.com/webhook/whatsapp

## 🚀 FUNCIONALIDADES INCLUIDAS

- ✅ E-commerce completo con catálogo Sigerist
- ✅ Sistema de carrito y checkout
- ✅ Integración WhatsApp Business API
- ✅ Pagos con Stripe y Wompi
- ✅ Base de datos PostgreSQL con productos
- ✅ Frontend React optimizado
- ✅ SEO y responsive design

---

**Tu proyecto está 100% listo para producción en Railway** 🎉