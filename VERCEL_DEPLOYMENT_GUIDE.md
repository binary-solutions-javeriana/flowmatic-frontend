# Guía de Solución: Proyectos no se Renderizan en Vercel

## 🔍 Problema
Los proyectos se pueden crear en Vercel pero no se muestran/renderizan en el dashboard.

## 🎯 Causas Más Comunes

### 1. Variable de Entorno `NEXT_PUBLIC_API_BASE_URL` No Configurada

Esta es la causa más probable. En Vercel, las variables de entorno deben configurarse manualmente.

#### ✅ Solución:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** → **Environment Variables**
3. Agrega la siguiente variable:
   ```
   Key: NEXT_PUBLIC_API_BASE_URL
   Value: [URL_DE_TU_BACKEND]
   ```
   Por ejemplo:
   - `https://api.flowmatic.com`
   - `https://flowmatic-backend.onrender.com`
   - O la URL donde esté desplegado tu backend

4. **IMPORTANTE**: Marca las casillas para todos los entornos:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

5. Haz clic en **Save**

6. **Redeploy tu aplicación**:
   - Ve a **Deployments**
   - Haz clic en los tres puntos (...) del deployment más reciente
   - Selecciona **Redeploy**
   - Marca la opción **Use existing Build Cache** (opcional, más rápido)

### 2. CORS (Cross-Origin Resource Sharing)

Si tu backend no permite peticiones desde el dominio de Vercel, las llamadas a la API fallarán.

#### ✅ Solución en el Backend:

Asegúrate de que tu backend permita el dominio de Vercel en la configuración de CORS:

```typescript
// Ejemplo para NestJS
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://tu-app.vercel.app',
    'https://*.vercel.app', // Para deployments de preview
  ],
  credentials: true,
});
```

### 3. Problemas con el Token de Autenticación

Los tokens pueden no estar persistiendo correctamente en producción.

#### ✅ Verificación:

1. Abre las **Developer Tools** del navegador (F12)
2. Ve a la pestaña **Application** → **Local Storage**
3. Verifica que existan las siguientes keys:
   - `flowmatic_access_token`
   - `flowmatic_refresh_token`
   - `flowmatic_user`

Si no existen, el problema está en el login/registro.

### 4. Estructura de Respuesta del Backend Incorrecta

El frontend espera que el backend retorne los proyectos en este formato:

```typescript
{
  data: [
    {
      proyect_id: number,
      name_proyect: string,
      description?: string,
      state: string,
      type?: string,
      start_date?: string,
      end_date?: string,
      created_by?: number,
      created_at: string,
      updated_at: string
    }
  ],
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### ✅ Verificación:

Usa el **Network Tab** en Developer Tools:
1. Filtra por `/projects`
2. Observa la respuesta del backend
3. Verifica que tenga la estructura `{ data: [...], meta: {...} }`

## 🔧 Debugging en Producción

### Paso 1: Verifica los Logs en la Consola

Con los cambios que acabamos de hacer, ahora verás logs detallados en la consola del navegador:

1. Abre tu app en Vercel
2. Abre **Developer Tools** (F12)
3. Ve a la pestaña **Console**
4. Busca logs que empiecen con:
   - `[CONFIG]` - Configuración y variables de entorno
   - `[useProjects]` - Llamadas a la API y respuestas
   - `[ProjectsList]` - Estado de los componentes

### Paso 2: Verifica las Variables de Entorno

En la consola, deberías ver:
```
✅ [CONFIG] All required environment variables are set
✅ [CONFIG] NEXT_PUBLIC_API_BASE_URL: https://tu-backend.com
```

Si ves:
```
⚠️ [CONFIG] Missing environment variables: NEXT_PUBLIC_API_BASE_URL
⚠️ [CONFIG] Current NEXT_PUBLIC_API_BASE_URL: NOT SET (using fallback: http://localhost:3000)
```
**Entonces el problema es la variable de entorno** → Ver Solución #1 arriba

### Paso 3: Verifica las Llamadas a la API

Busca en la consola:
```
[useProjects] Fetching projects with URL: /projects?page=1&limit=100...
[useProjects] Response received: { data: [...], meta: {...} }
[useProjects] Number of projects: 5
```

Si ves un error:
```
[useProjects] Error fetching projects: ...
```
Lee el mensaje de error para identificar el problema.

### Paso 4: Verifica el Network Tab

1. Ve a **Network** en Developer Tools
2. Filtra por **Fetch/XHR**
3. Busca la petición a `/projects`
4. Verifica:
   - ✅ Status Code: 200
   - ✅ Response tiene formato correcto
   - ❌ Si es 401/403: Problema de autenticación
   - ❌ Si es 404: Endpoint no existe
   - ❌ Si es 500: Error del backend
   - ❌ Si falla con CORS: Problema de configuración CORS

## 📋 Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] Variable `NEXT_PUBLIC_API_BASE_URL` está configurada en Vercel
- [ ] El backend está corriendo y accesible desde internet
- [ ] CORS está configurado correctamente en el backend
- [ ] Los tokens de autenticación están en localStorage
- [ ] La respuesta del backend tiene el formato correcto `{ data: [], meta: {} }`
- [ ] No hay errores en la consola del navegador
- [ ] El Network tab muestra status 200 para `/projects`
- [ ] Has hecho redeploy después de configurar las variables de entorno

## 🚀 Pasos para Probar Localmente

Para asegurarte de que todo funciona antes de deployar a Vercel:

1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://tu-backend.com
   ```

2. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Verifica que los proyectos se cargan correctamente

4. Si funciona localmente pero no en Vercel, el problema es definitivamente la configuración de variables de entorno en Vercel

## 🔗 URLs de Referencia

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## 💡 Nota Importante sobre `NEXT_PUBLIC_`

Las variables que empiezan con `NEXT_PUBLIC_` son las únicas que están disponibles en el navegador (client-side). Sin este prefijo, la variable solo estará disponible en el servidor y **NO funcionará** para componentes con `'use client'`.

## 🆘 Si Nada Funciona

1. Copia los logs completos de la consola del navegador
2. Copia los detalles del Network tab para la petición `/projects`
3. Verifica la configuración de variables de entorno en Vercel (screenshot)
4. Comparte esta información con el equipo

---

**Última actualización**: 1 de Octubre, 2025



