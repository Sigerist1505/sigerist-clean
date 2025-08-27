# 🚀 Configuración de Wompi en Railway

## Respuesta a la Pregunta: "¿Debo pasar las claves de Wompi como variables en Railway?"

**¡SÍ, ABSOLUTAMENTE!** ✅

Las claves de Wompi **NUNCA** deben estar hardcodeadas en el código fuente. Deben configurarse como variables de entorno en Railway por razones de seguridad.

## 🔑 Variables de Entorno Requeridas en Railway

Ve a **Railway > tu-proyecto > Settings > Variables** y agrega estas 4 variables **OBLIGATORIAS**:

```env
WOMPI_PUBLIC_KEY=pub_prod_xxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxxxxxxxxxxxxx  
WOMPI_INTEGRITY_SECRET=prod_integrity_xxxxxxxxxxxxxxxx
WOMPI_WEBHOOK_SECRET=prod_events_xxxxxxxxxxxxxxxx
```

## 📍 Dónde Obtener las Claves

1. Ve a [comercios.wompi.co](https://comercios.wompi.co/)
2. Inicia sesión en tu cuenta de comercio
3. Ve a **Configuración > API Keys**
4. Copia las claves de **PRODUCCIÓN** (no las de prueba)

## ⚠️ Configuración Crítica

- **Sin estas variables**: La aplicación mostrará error 503 "El servicio de pagos no está configurado correctamente"
- **Verificación**: Usa `GET /api/wompi/config` para verificar el estado
- **Ambiente**: Todas las claves deben ser del mismo ambiente (producción)

## 🔍 Verificar Configuración

Después de configurar las variables en Railway:

1. **Ejecuta el script de verificación:**
   ```bash
   node verify-wompi-config.js
   ```

2. **Revisa el endpoint de configuración:**
   ```
   GET https://tu-app.railway.app/api/wompi/config
   ```

## 🚨 ¿Por qué es el problema?

Si NO configuras estas variables, verás:
- ❌ Error 503 en pagos  
- ❌ "Servicio de pagos no disponible"
- ❌ Formularios de pago no funcionan
- ❌ Checkout redirige a error

## ✅ Después de Configurar Correctamente

Una vez configuradas las variables en Railway:
- ✅ Pagos con tarjeta funcionan
- ✅ Checkout Wompi disponible  
- ✅ Procesamiento seguro
- ✅ Webhooks de confirmación

## 🔐 Seguridad

**NUNCA** pongas las claves directamente en:
- ❌ Archivos `.env` committeados
- ❌ Código fuente
- ❌ Variables hardcodeadas
- ❌ Archivos de configuración

**SIEMPRE** usa:
- ✅ Variables de entorno en Railway
- ✅ Valores encriptados
- ✅ Acceso restringido
- ✅ Rotación de claves

## 🎯 URL del Proyecto

Una vez configurado correctamente:
- **Frontend:** https://sigeristluxurybags.com
- **API:** https://sigeristluxurybags.com/api/
- **Verificación:** https://sigeristluxurybags.com/api/wompi/config

---

**Conclusión:** La configuración de variables de entorno en Railway es la causa MÁS probable del problema de pagos. Una vez configuradas correctamente, el sistema funcionará perfectamente.