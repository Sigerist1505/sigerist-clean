# 🎨 Guía de Bordados y Assets

## 📁 Estructura de Archivos

### Bordados (Diseños de Bordado)
Los diseños de bordado se almacenan en `client/public/bordados/`:
- Leoncito.jpg
- animaciones.jpg  
- animalitos.jpg
- blancanieves.jpg
- caballo.jpg
- carrito.jpg
- chico.jpg
- hada.jpg, hada 2.jpg
- leona.jpg
- mini mouse.jpg, mouse.jpg
- muñeca.jpg, muñeca 2.jpg
- osito.jpg
- oveja.jpg
- princesa.jpg
- safari.jpg, safari 2.jpg
- wini pu.jpg
- zoo.jpg

### Assets (Imágenes de Productos)
Las imágenes de productos se almacenan en `client/public/assets/`:
- Multifuncional 4.jpg
- Pañalera grande 2.jpg
- milan 3.jpg  
- pañalera grande 3.jpg
- (y otros archivos de productos existentes)

## 🔧 Configuración de Git para Caracteres Especiales

### Problema Resuelto
Git ahora está configurado para manejar correctamente los nombres de archivos con caracteres especiales españoles (ñ, ü, acentos).

### Configuración Aplicada
```bash
git config core.quotepath false
git config core.precomposeunicode true
git config i18n.commitencoding utf-8
git config i18n.logoutputencoding utf-8
```

### Para Nuevos Repositorios
Si clonas este repositorio en una nueva máquina, puedes aplicar la configuración recomendada ejecutando:
```bash
git config --file .gitconfig-recommended --list
```

## 📸 Agregar Nuevos Bordados

1. Guarda las imágenes en `client/public/bordados/`
2. Usa nombres descriptivos en español (ej: `osito.jpg`, `princesa.jpg`)
3. Formatos soportados: JPG, PNG
4. Tamaño recomendado: máximo 1MB por imagen

## 🛠️ Solución de Problemas

### Si Git no reconoce los archivos con ñ o acentos:
```bash
git config core.quotepath false
```

### Si el commit se cuelga con archivos grandes:
```bash
git config http.postBuffer 157286400  # 150MB
git config pack.windowMemory 256m
```

### Para verificar el estado de los archivos:
```bash
git status
git ls-files | grep bordados
```

## ✅ Estado Actual
- ✅ Configuración UTF-8 aplicada
- ✅ Bordados creados (21 diseños)
- ✅ Assets adicionales agregados
- ✅ Git funcionando correctamente con caracteres especiales
- ✅ Archivos listos para commit