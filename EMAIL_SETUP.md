# 📧 Configuración de Email - Sigerist Luxury Bags

## 🚀 Nueva Opción: SMTP2GO API (Recomendado para Railway)

**¡Configuración actualizada!** Ahora soportamos SMTP2GO API para resolver problemas de bloqueo SMTP en Railway.

### Opción 1: SMTP2GO API (Recomendado)
```env
SMTP2GO_API_KEY=api-4CD6CD4114304458A8C441E6FFC36D52
EMAIL_FROM=info@sigeristluxurybags.com
```

**Ventajas**:
- ✅ Compatible con Railway (sin bloqueo de puertos SMTP)
- ✅ Más confiable que SMTP tradicional
- ✅ Mejor monitoreo y logging
- ✅ Configuración simple

### Opción 2: SMTP Tradicional (Respaldo)
Si prefieres usar SMTP tradicional, la configuración original sigue funcionando:

## Resumen

Se ha implementado un sistema completo de emails que incluye:
- ✅ Confirmación de registro por email
- ✅ Códigos de recuperación de contraseña (6 dígitos, 15 minutos de expiración)
- ✅ Emails con diseño profesional de la marca Sigerist

## 🔧 Configuración de Namecheap Email

### Paso 1: Obtener la información de tu cuenta de Namecheap

1. **Iniciar sesión en Namecheap**
   - Ve a [namecheap.com](https://namecheap.com)
   - Inicia sesión con tu cuenta

2. **Acceder a Private Email**
   - Ve a "Domain List"
   - Busca tu dominio `sigeristluxurybags.com`
   - Haz clic en "Manage" 
   - Selecciona la pestaña "Private Email"

3. **Obtener configuración SMTP**
   - En Private Email, busca "Mail settings" o "SMTP settings"
   - Anota la siguiente información:
     - **Servidor SMTP**: Generalmente `mail.privateemail.com`
     - **Puerto**: `587` (con STARTTLS) o `465` (con SSL)
     - **Usuario**: `info@sigeristluxurybags.com`
     - **Contraseña**: La contraseña que configuraste para este email

### Paso 2: Configurar las variables de entorno

Actualiza tu archivo `.env` con la información real:

```env
# Email Configuration (Namecheap Private Email)
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@sigeristluxurybags.com
EMAIL_PASSWORD=tu-contraseña-de-email-aqui
EMAIL_FROM=info@sigeristluxurybags.com

# Frontend URL (para los enlaces en emails)
FRONTEND_URL=https://sigerist.com
```

### Paso 3: Configuración alternativa si tienes problemas

Si tienes problemas con `mail.privateemail.com`, prueba con:

```env
EMAIL_HOST=smtp.privateemail.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Paso 4: Verificar la configuración

El sistema incluye un endpoint para probar la conexión de email:

```bash
# En desarrollo, puedes probar con:
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email-de-prueba@gmail.com"}'
```

## 🎯 Funcionalidades Implementadas

### 1. Registro con Confirmación por Email
- ✅ Al registrarse, el usuario recibe un email de bienvenida
- ✅ Email con diseño profesional de Sigerist
- ✅ Enlaces a la página principal

### 2. Recuperación de Contraseña
- ✅ Enlace "¿Olvidaste tu contraseña?" en la página de login
- ✅ Página dedicada para recuperación (`/forgot-password`)
- ✅ Generación de código de 6 dígitos
- ✅ Envío por email con plantilla profesional
- ✅ Expiración automática en 15 minutos
- ✅ Validación de código y actualización de contraseña

### 3. Base de Datos
- ✅ Tabla `password_reset_codes` creada
- ✅ Gestión automática de códigos expirados
- ✅ Encriptación de contraseñas con bcrypt

## 🔒 Consideraciones de Seguridad

1. **Códigos de Recuperación**:
   - Expiran en 15 minutos
   - Solo se puede usar una vez
   - Se eliminan después de ser usados
   - 6 dígitos aleatorios

2. **Validación de Contraseñas**:
   - Mínimo 8 caracteres
   - Al menos una mayúscula
   - Al menos un número
   - Al menos un símbolo especial

3. **Protección de Información**:
   - Los emails no revelan si una cuenta existe o no
   - Las contraseñas se encriptan con bcrypt (12 rounds)

## 🛠️ Solución de Problemas

### Error: "Email service not configured"
- **Causa**: Variables de entorno faltantes
- **Solución**: Verificar que todas las variables EMAIL_* estén configuradas

### Error: "Connection refused" al enviar emails
- **Causa**: Configuración SMTP incorrecta
- **Solución**: 
  1. Verificar host, puerto y credenciales
  2. Intentar con EMAIL_SECURE=true y puerto 465
  3. Contactar soporte de Namecheap si persiste

### Los emails no llegan
- **Causa**: Posible filtro de spam
- **Solución**:
  1. Revisar carpeta de spam/promociones
  2. Configurar SPF, DKIM en Namecheap (ver `DKIM_SETUP.md`)
  3. Usar "mail-tester.com" para verificar reputación

## 📋 Lista de Verificación para Producción

- [ ] **Configurar DNS**: SPF, DKIM, DMARC records en Namecheap
- [ ] **Configurar DKIM**: Seguir la guía en `DKIM_SETUP.md` para configuración completa
- [ ] **Verificar dominio**: Completar verificación en Namecheap
- [ ] **Configurar variables**: Actualizar .env con credenciales reales
- [ ] **Probar emails**: Enviar emails de prueba a diferentes proveedores
- [ ] **Configurar DATABASE_URL**: Usar Neon u otra base de datos en producción
- [ ] **SSL certificado**: Asegurar HTTPS en producción

## 📧 Plantillas de Email Incluidas

### Email de Bienvenida
- Diseño con colores de la marca (negro/dorado)
- Información sobre beneficios de la cuenta
- Enlace para explorar productos
- Información de contacto

### Email de Recuperación de Contraseña
- Código de 6 dígitos destacado
- Advertencia de expiración (15 minutos)
- Instrucciones claras
- Medidas de seguridad

## 🚀 Próximos Pasos

1. **Configurar email real** con las credenciales de Namecheap
2. **Configurar base de datos** para completar el registro
3. **Probar flujo completo** de registro y recuperación
4. **Configurar DNS** para mejorar deliverability
5. **Implementar análisis** de emails (opcional)

Para cualquier problema, revisar los logs del servidor y verificar la configuración de Namecheap Private Email.