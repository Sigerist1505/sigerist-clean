# 🗄️ Guía para Cargar Todas las Imágenes en la Base de Datos Neon

## 📋 Resumen
Esta guía te ayudará a cargar todas las imágenes de productos en tu base de datos Neon para que el sitio web funcione correctamente con todas las imágenes y el toggle de bordado.

## 🔧 Pasos para Configurar la Base de Datos

### 1. Configurar Variables de Entorno
Asegúrate de que tu archivo `.env` tenga la URL de tu base de datos Neon:

```bash
DATABASE_URL=tu-url-de-neon-aqui
```

### 2. Scripts Disponibles para Cargar Productos

#### Opción A: Script Completo (Recomendado)
```bash
node migrate-complete-products.js
```
Este script:
- ✅ Borra las tablas existentes y las recrea
- ✅ Carga **TODOS** los productos con imágenes
- ✅ Incluye productos con y sin bordado
- ✅ Configura galerías de imágenes múltiples

#### Opción B: Script de Semillas Básico
```bash
node seed-database.js
```
Este script:
- ✅ Crea las tablas básicas
- ✅ Carga productos principales
- ⚠️ Menos productos que la opción A

### 3. Verificar que las Imágenes Estén Disponibles

Asegúrate de que todas estas imágenes estén en la carpeta `client/public/assets/`:

#### Imágenes de Maletas:
- `maleta-viajera-bordada.jpg`
- `Maleta viajera_Bordada_1754093212912.jpg`
- `Maleta Viajera_Sin bordar_1754094149303.jpg`
- `MaletaMilan_ConBordado.jpg`
- `MaletaMilan_SinBordado.jpg`

#### Imágenes de Bolsos:
- `Bolsito Mariposa.jpg`
- `Bolso Mariposa sin Bordar.jpg`
- `Bolso Rosadito Bordado Minifantasy.jpg`
- `Minifantasy rosado sin bordar.jpg`

#### Imágenes de Pañaleras:
- `Multifuncional 3 Bordada.jpg`
- `Multifuncional 3 sin Bordado.jpg`
- `Multifuncional 3sinB.jpg`
- `Multifuncional 2 Bordada.jpg`

#### Imágenes de Organizadores:
- `Organizador Bordado.jpg`
- `Organizador_Sin bordar.jpg`
- `Organizador_Bordado.jpg`
- `Organizador.jpg`

#### Imágenes de Loncheras:
- `Lonchera baul.jpg`
- `Lonchera baul sin bordar.jpg`
- `Porta Biberones_Bordado.jpg`
- `PortaBiberones_SinBordar.jpg`

#### Imágenes de Mochilas:
- `Mochila clasica.jpg`

#### Imágenes de Accesorios:
- `Cambiador.jpg`
- `Cambiador_1754094149302.jpg`
- `Portachupeta.jpg`

## 🔄 Funcionalidad del Toggle de Bordado

### Cómo Funciona:
1. **Productos con bordado**: Tienen `bordado: true` en variants
2. **Imágenes separadas**: 
   - `bordadoImageUrl`: Imagen con bordado
   - `blankImageUrl`: Imagen sin bordado
3. **Galerías múltiples**:
   - `bordadoGalleryImages`: Varias imágenes con bordado
   - `galleryImages`: Imágenes sin bordado

### Ejemplo de Configuración:
```javascript
{
  name: "Pañalera Multifuncional",
  variants: {
    bordado: true,
    bordadoImageUrl: "/assets/Multifuncional 3 Bordada.jpg",
    blankImageUrl: "/assets/Multifuncional 3 sin Bordado.jpg",
    galleryImages: ["/assets/Multifuncional 3sinB.jpg"],
    bordadoGalleryImages: [
      "/assets/Multifuncional 3 Bordada.jpg",
      "/assets/Multifuncional 2 Bordada.jpg"
    ]
  }
}
```

## 📱 Menú Móvil Mejorado

### ✅ Cambios Realizados:
- ❌ **Eliminado**: Menú horizontal que cubría la pantalla
- ✅ **Agregado**: Menú hamburguesa desplegable limpio
- ✅ **Incluye**: Todas las opciones de navegación
- ✅ **Más espacio**: Pantalla móvil más limpia

## 🚀 Comandos Rápidos

```bash
# 1. Cargar todos los productos
node migrate-complete-products.js

# 2. O cargar productos básicos
node seed-database.js

# 3. Verificar conexión a base de datos
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL)"

# 4. Construir y ejecutar
npm run build
npm start
```

## ⚠️ Solución de Problemas

### Si las imágenes no cargan:
1. Verificar que las imágenes estén en `client/public/assets/`
2. Verificar que los nombres coincidan exactamente
3. Ejecutar el script de migración completa

### Si el toggle no funciona:
1. Verificar que el producto tenga `bordado: true`
2. Verificar que tenga `bordadoImageUrl` y `blankImageUrl`
3. Revisar la consola del navegador para errores

### Si el menú móvil no funciona:
1. Verificar que estés en móvil (ancho < 768px)
2. Hacer clic en el icono de hamburguesa (≡)
3. El menú debería aparecer como dropdown

## 📊 Estado Actual
- ✅ Menú móvil mejorado (sin cinta horizontal)
- ✅ Toggle de bordado corregido
- ✅ Scripts de base de datos listos
- ✅ Galería de imágenes funcional
- ⚠️ Pendiente: Ejecutar script en base de datos Neon

¡Con estos pasos tendrás todas las imágenes cargadas y el sitio funcionando perfectamente! 🎉