# Guía de Assets - Flowmatic Frontend

Esta guía documenta todos los assets estáticos en la carpeta `public/` y su uso en la aplicación Flowmatic.

## 📁 Estructura de Assets

```
public/
├── background_login/
│   └── flowmatic_background.svg
├── debug-check.html
├── login/ (vacía)
├── logo/
│   ├── flowmatic_ico_.ico
│   └── flowmatic_logo.png
└── favicon.ico (en src/app/)
```

---

## 🎨 Assets de Marca

### Logo Principal
**Archivo**: `/logo/flowmatic_logo.png`

**Uso en la aplicación**:
- **Navegación principal** (`src/components/landing/Nav.tsx`)
- **Sidebar del dashboard** (`src/components/dashboard/Sidebar.tsx`)
- **Footer** (`src/components/landing/Footer.tsx`)
- **Formularios de autenticación** (`src/components/auth/LoginForm.tsx`, `src/app/register/RegisterForm.tsx`)

**Características**:
- Formato: PNG
- Tamaño: 32x32px (w-8 h-8 en Tailwind)
- Uso: Logo principal de la marca en toda la aplicación
- Alt text: "Flowmatic" o "Flowmatic Logo"

**Implementación**:
```tsx
<img 
  src="/logo/flowmatic_logo.png" 
  alt="Flowmatic" 
  className="w-8 h-8 object-contain"
/>
```

### Favicon
**Archivo**: `/src/app/favicon.ico`

**Uso**: Icono de la pestaña del navegador
- Se carga automáticamente por Next.js
- Ubicado en `src/app/favicon.ico` (convención de Next.js 13+)
- Reemplaza el favicon estándar del navegador

### Icono ICO
**Archivo**: `/logo/flowmatic_ico_.ico`

**Uso**: 
- Icono alternativo para la aplicación
- Formato ICO para compatibilidad con sistemas Windows
- Disponible como backup del favicon principal

---

## 🖼️ Assets de Fondo

### Fondo de Login/Registro
**Archivo**: `/background_login/flowmatic_background.svg`

**Uso en la aplicación**:
- **Página de login** (`src/components/auth/Login.tsx`)
- **Página de registro** (`src/app/register/page.tsx`)

**Características**:
- Formato: SVG (escalable)
- Uso: Fondo de pantalla completa para páginas de autenticación
- Estilo: SVG con diseño de marca

**Implementación**:
```tsx
<div 
  className="absolute inset-0"
  style={{
    backgroundImage: 'url("/background_login/flowmatic_background.svg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
/>
```

---

## 🛠️ Herramientas de Desarrollo

### Debug Check
**Archivo**: `/debug-check.html`

**Propósito**: Herramienta de diagnóstico para verificar la configuración de la aplicación

**Funcionalidades**:
- ✅ Verificación de variables de entorno
- ✅ Verificación de localStorage (tokens de autenticación)
- ✅ Verificación de conectividad API
- ✅ Verificación de CORS
- ✅ Resumen de estado de la aplicación

**Características**:
- Interfaz visual con iconos de estado
- Ejecución automática al cargar
- Botón para re-ejecutar diagnósticos
- Resumen detallado de problemas encontrados
- Estilo consistente con la marca Flowmatic

**Uso**:
- Acceder a `/debug-check.html` en el navegador
- Útil para debugging en desarrollo
- Verificación de configuración en producción

**Elementos verificados**:
```javascript
// Variables de entorno
const apiUrl = window.location.origin;

// LocalStorage
const hasAccessToken = !!localStorage.getItem('flowmatic_access_token');
const hasRefreshToken = !!localStorage.getItem('flowmatic_refresh_token');
const hasUser = !!localStorage.getItem('flowmatic_user');

// Conectividad API
// Verificación de endpoints del backend
```

---

## 📂 Carpetas Especiales

### `/login/` (Vacía)
**Propósito**: Carpeta reservada para assets específicos de login
- Actualmente vacía
- Preparada para futuros assets de la página de login
- Posibles usos: iconos específicos, imágenes de fondo alternativas

---

## 🎯 Patrones de Uso

### Logo en Componentes
Todos los componentes que usan el logo siguen este patrón:

```tsx
// Estructura común
<div className="flex items-center space-x-2">
  <img 
    src="/logo/flowmatic_logo.png" 
    alt="Flowmatic" 
    className="w-8 h-8 object-contain"
  />
  <span className="text-xl font-bold text-[#0c272d]">Flowmatic</span>
</div>
```

### Fondo en Páginas de Autenticación
Las páginas de login y registro usan el mismo patrón:

```tsx
<div className="min-h-screen flex items-center justify-center relative">
  <div 
    className="absolute inset-0"
    style={{
      backgroundImage: 'url("/background_login/flowmatic_background.svg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
  {/* Contenido del formulario */}
</div>
```

---

## 🎨 Especificaciones de Diseño

### Colores de Marca
- **Primario**: `#14a67e` (verde Flowmatic)
- **Secundario**: `#0c272d` (gris oscuro)
- **Acento**: `#9fdbc2` (verde claro)

### Tamaños de Logo
- **Navegación**: 32x32px (`w-8 h-8`)
- **Sidebar**: 32x32px (`w-8 h-8`)
- **Footer**: 32x32px (`w-8 h-8`)
- **Formularios**: 88x88px (`w-22 h-22` en algunos casos)

### Responsive Design
- Logo se mantiene visible en todas las resoluciones
- Fondo SVG se adapta automáticamente
- Tamaños consistentes en desktop y mobile

---

## 🔧 Optimización

### Formato de Archivos
- **PNG**: Para logos con transparencia
- **SVG**: Para fondos escalables
- **ICO**: Para compatibilidad con favicons

### Carga de Assets
- Assets se cargan desde la raíz `/public/`
- Next.js optimiza automáticamente las imágenes
- Uso de `object-contain` para mantener proporciones

### Performance
- Logo pequeño (32x32px) para carga rápida
- SVG vectorial para fondos (escalable sin pérdida)
- Favicon en formato ICO para compatibilidad

---

## 📱 Uso en Diferentes Contextos

### Landing Page
- Logo en navegación principal
- Logo en footer
- Fondo personalizado (no usa el SVG de auth)

### Dashboard
- Logo en sidebar (expandido y colapsado)
- Consistencia visual en toda la aplicación

### Autenticación
- Logo en formularios de login/registro
- Fondo SVG en páginas de auth
- Estilo consistente con la marca

### Debug/Desarrollo
- Herramienta de diagnóstico independiente
- No depende de React/Next.js
- Útil para troubleshooting

---

## 🚀 Mejoras Futuras

### Assets Pendientes
- Iconos específicos para diferentes secciones
- Imágenes de fondo alternativas
- Assets para onboarding
- Iconos de estado y notificaciones

### Optimizaciones
- WebP para imágenes (mejor compresión)
- Lazy loading para assets pesados
- Sprites para iconos pequeños
- CDN para assets estáticos

---

## 📝 Notas Técnicas

### Rutas de Assets
- Todos los assets en `/public/` son accesibles desde la raíz
- No incluir `/public/` en las rutas
- Ejemplo: `/logo/flowmatic_logo.png` (no `/public/logo/...`)

### Next.js Integration
- Favicon automático desde `src/app/favicon.ico`
- Assets estáticos servidos desde `/public/`
- Optimización automática de imágenes

### Browser Compatibility
- ICO para favicon (compatibilidad máxima)
- PNG para logos (soporte universal)
- SVG para fondos (navegadores modernos)

---

**Última actualización**: 1 de Octubre, 2025  
**Versión**: develop branch  
**Total de assets**: 4 archivos principales + 1 carpeta vacía
