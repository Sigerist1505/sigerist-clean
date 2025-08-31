# 🔧 Fix para el Error: "column accepts_marketing does not exist"

## 📋 Problema
El error ocurre porque la tabla `registered_users` en la base de datos no tiene la columna `accepts_marketing` que el código de la aplicación espera encontrar.

## ⚡ Solución Inmediata (SQL)
Ejecuta este comando en tu consola de Neon Database para agregar la columna faltante:

```sql
ALTER TABLE registered_users 
ADD COLUMN IF NOT EXISTS accepts_marketing BOOLEAN DEFAULT false NOT NULL;
```

## 🔄 Solución Permanente (Migraciones)
Los archivos de migración han sido actualizados para incluir la columna:
- `migrate-auth-tables.js`
- `fix-auth-schema.sql`

### Para ejecutar la migración completa:
```bash
npm run migrate:auth
```

## ✅ Verificación
Después de ejecutar el SQL, puedes verificar que la columna fue creada:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'registered_users' 
AND column_name = 'accepts_marketing'
AND table_schema = 'public';
```

## 🎯 Resultado Esperado
- El registro de usuarios funcionará correctamente
- El campo `acceptsMarketing` del formulario se guardará en la base de datos
- Ya no aparecerá el error "column accepts_marketing does not exist"

## 📝 Cambios Realizados
1. Agregada la columna `accepts_marketing BOOLEAN DEFAULT false NOT NULL` a la tabla `registered_users`
2. La columna permite almacenar si el usuario acepta recibir emails de marketing
3. Valor por defecto: `false` (no acepta marketing por defecto)