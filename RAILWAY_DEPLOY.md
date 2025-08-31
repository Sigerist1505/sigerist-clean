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
# NOTE: NO configures PORT - Railway lo asigna automáticamente

# WhatsApp (usa tus valores actuales)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxx
META_WHATSAPP_PHONE_NUMBER_ID=793444840509227
META_WEBHOOK_VERIFY_TOKEN=sigerist_webhook_verify_2024

# Pagos (OBLIGATORIO para pagos con Wompi)
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_INTEGRITY_SECRET=prod_integrity_xxxxx
WOMPI_WEBHOOK_SECRET=prod_events_xxxxx
```

### ✅ 3. Información Importante sobre Puertos

**🚨 NOTA IMPORTANTE:** Railway asigna automáticamente el puerto mediante la variable `PORT` (ej: 8080, 3000, etc). 
**NO configures manualmente la variable PORT** - el servidor la detectará automáticamente.

En los logs verás algo como:
```
🚀 Servidor de Sigerist Luxury Bags corriendo en http://0.0.0.0:8080 - Listo para ventas exclusivas
```

Esto es **NORMAL y CORRECTO**. El puerto puede ser 8080, 3000, o cualquier otro que Railway asigne.

### ✅ 4. Conectar Base de Datos Neon

**Railway detectará automáticamente tu `DATABASE_URL` desde Neon.**

Si necesitas conectar manualmente:
1. Ve a Railway > Add Service > Database > PostgreSQL
2. O usa tu Neon existente copiando la URL

### ✅ 5. Deploy Automático

Railway detectará los cambios y hará deploy automático.

## 🔧 TROUBLESHOOTING

### Problema: "relation does not exist"
**Solución:** El script `seed-database.js` se ejecuta automáticamente al hacer build.

### Problema: "El servidor está en puerto 8080, no en 5000"
**Esto es NORMAL** ✅ Railway asigna automáticamente el puerto. Los puertos pueden ser:
- 8080 (más común en Railway)
- 3000 
- 4000
- Cualquier otro puerto disponible

**NO es un error** - tu aplicación funciona correctamente.

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