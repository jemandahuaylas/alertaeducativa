# Guía de Deployment en Vercel

## Error Común: "supabaseKey is required"

Si ves este error durante el build en Vercel:
```
Error: supabaseKey is required.
```

Significa que las variables de entorno de Supabase no están configuradas correctamente.

## Configuración de Variables de Entorno

### Variables Obligatorias

Debes configurar estas 3 variables en Vercel:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valor: URL de tu proyecto Supabase
   - Ejemplo: `https://zahqnkjkyltsthfczzgp.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valor: Clave anónima/pública de Supabase
   - Se puede exponer al cliente

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Valor: Clave de rol de servicio de Supabase
   - ⚠️ **CRÍTICO**: Esta clave debe mantenerse secreta
   - Requerida para operaciones administrativas como bulk import

### Pasos para Configurar en Vercel

1. **Accede a tu Dashboard de Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Selecciona tu proyecto

2. **Navega a Environment Variables**
   - Ve a `Settings` > `Environment Variables`

3. **Agrega cada variable**
   - Haz clic en "Add New"
   - Nombre: `NEXT_PUBLIC_SUPABASE_URL`
   - Valor: Tu URL de Supabase
   - Environments: Selecciona `Production`, `Preview`, y `Development`
   - Repite para las otras 2 variables

4. **Obtén los valores desde Supabase**
   - Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
   - Selecciona tu proyecto
   - Ve a `Settings` > `API`
   - Copia:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

5. **Redeploy**
   - Después de agregar las variables, haz un nuevo deployment
   - Puedes hacer push a tu repositorio o usar "Redeploy" en Vercel

## Verificación

Después de configurar las variables:
- El build debería completarse sin errores
- Las funciones de bulk import funcionarán correctamente
- No verás más el error "supabaseKey is required"

## Troubleshooting

- **Error persiste**: Verifica que los nombres de las variables sean exactos
- **Build falla**: Asegúrate de que las 3 variables estén configuradas
- **Funciones no funcionan**: Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcta

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el código cliente
- Esta clave solo debe usarse en funciones del servidor (API routes)
- Las claves `NEXT_PUBLIC_*` son seguras para el cliente