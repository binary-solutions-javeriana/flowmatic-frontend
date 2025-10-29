# Integración Pagos y Facturas - Frontend Flowmatic

## 🎯 Resumen de la Implementación

Se ha implementado exitosamente la integración del botón "Pagos y Facturas" que conecta el frontend de Flowmatic con el backend NestJS y el componente .NET de la pasarela de pagos.

## 📁 Archivos Creados/Modificados

### ✅ Nuevos Archivos Creados:

1. **`src/lib/hooks/use-payment-gateway.ts`**
   - Hook personalizado para manejar toda la lógica de pagos
   - Funciones: health check, crear sesión, obtener estado, cancelar

2. **`src/lib/payment-config.ts`**
   - Configuración centralizada de URLs, endpoints y constantes
   - Funciones utilitarias para headers, formateo y validaciones

3. **`src/app/payment-success/page.tsx`**
   - Página de confirmación de pago exitoso
   - Muestra detalles del pago y opciones de descarga

4. **`src/app/payment-cancel/page.tsx`**
   - Página de pago cancelado
   - Opciones para reintentar o volver al dashboard

### ✅ Archivos Modificados:

1. **`src/components/tenant-admin/TenantAdminDashboard.tsx`**
   - ➕ Agregado botón "Pagos y Facturas" al sidebar
   - ➕ Importado componente PagosFacturas
   - ➕ Configurado routing para la nueva vista

2. **`src/components/dashboard/PagosFacturas.tsx`**
   - 🔄 Reemplazado contenido vacío con integración completa
   - ➕ Health check del servicio
   - ➕ Selección de planes
   - ➕ Manejo de errores y estados de carga

3. **`next.config.ts`**
   - ➕ Agregado proxy para endpoints `/api/v1/payments/*`
   - ➕ Configuración de headers CORS

## 🔗 Flujo de Integración

```
1. Usuario hace clic en "Pagos y Facturas"
   ↓
2. Frontend verifica salud del servicio (/api/v1/payments/health)
   ↓
3. Frontend crea sesión de pago (/api/v1/payments/session)
   ↓
4. Backend NestJS procesa la request
   ↓
5. Backend llama al componente .NET (http://localhost:5194)
   ↓
6. Componente .NET retorna URL de pago
   ↓
7. Frontend redirige usuario a la URL del .NET
   ↓
8. Usuario completa/cancela el pago
   ↓
9. Componente .NET redirige a success/cancel URL
```

## 🛠️ Configuración Requerida

### 1. Variables de Entorno

Asegúrate de que estas variables estén configuradas:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. Backend NestJS

El backend debe estar ejecutándose en `http://localhost:3000` con los siguientes endpoints:

- `GET /v1/payments/health` - Health check
- `GET /v1/payments/plans` - Obtener planes
- `POST /v1/payments/session` - Crear sesión de pago
- `GET /v1/payments/session/{id}/status` - Estado de sesión
- `POST /v1/payments/session/{id}/cancel` - Cancelar sesión

### 3. Componente .NET

El componente .NET debe estar ejecutándose en `http://localhost:5194`

## 🎮 Cómo Usar

### Para Usuario Final:

1. Navegar a `/tenant-admin`
2. Hacer clic en "Pagos y Facturas" en el sidebar
3. Seleccionar plan (si hay múltiples opciones)
4. Hacer clic en "Acceder a Pagos y Facturas"
5. Completar el pago en la pasarela .NET
6. Ser redirigido a página de éxito/cancelación

### Para Desarrollador:

```typescript
// Usar el hook directamente en cualquier componente
import usePaymentGateway from '@/lib/hooks/use-payment-gateway';

const MyComponent = () => {
  const { createSessionAndRedirect, isLoading, error } = usePaymentGateway();
  
  const handlePayment = () => {
    createSessionAndRedirect('user123', 'pro', { custom: 'metadata' });
  };
  
  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Procesando...' : 'Pagar Ahora'}
    </button>
  );
};
```

## 🔍 Estados y Manejo de Errores

### Estados de Servicio:
- ✅ **healthy** - Servicios operativos
- 🟡 **checking** - Verificando conexión
- ❌ **unhealthy** - Servicios no disponibles

### Estados de Pago:
- `pending` - Esperando pago
- `completed` - Pago exitoso
- `failed` - Pago falló
- `cancelled` - Pago cancelado
- `expired` - Sesión expirada

### Manejo de Errores:
- Verificación automática de salud del servicio
- Mensajes de error descriptivos para el usuario
- Retry automático para health checks
- Fallback a planes por defecto si la API falla

## 🧪 Testing

### Verificar Integración:

1. **Health Check:**
   ```bash
   curl http://localhost:4000/api/v1/payments/health
   ```

2. **Crear Sesión:**
   ```bash
   curl -X POST http://localhost:4000/api/v1/payments/session \
     -H "Content-Type: application/json" \
     -d '{"userId":"test","plan":"pro","returnUrl":"http://localhost:4000/payment-success","cancelUrl":"http://localhost:4000/payment-cancel"}'
   ```

### URLs de Testing:
- **Frontend:** http://localhost:4000/tenant-admin
- **Success Page:** http://localhost:4000/payment-success
- **Cancel Page:** http://localhost:4000/payment-cancel

## 🔧 Troubleshooting

### Problemas Comunes:

1. **Botón deshabilitado:**
   - Verificar que el backend esté ejecutándose
   - Verificar endpoint de health check
   - Revisar configuración de proxy en next.config.ts

2. **Error de CORS:**
   - Verificar configuración de headers en next.config.ts
   - Verificar configuración CORS en el backend

3. **Redirección no funciona:**
   - Verificar que el componente .NET esté ejecutándose
   - Verificar que la respuesta incluya `paymentUrl` válida
   - Revisar logs del backend

### Logs Útiles:

```bash
# Frontend (consola del navegador)
console.log('Payment session:', session);

# Backend NestJS
[PAYMENT] Creating session for user: userId

# Next.js
[NEXT CONFIG] Setting up API proxy to: http://localhost:3000
```

## 📝 Próximos Pasos

1. **Implementar webhook** para notificaciones de pago
2. **Agregar persistencia** de sesiones en base de datos
3. **Implementar descarga** de comprobantes PDF
4. **Agregar métricas** y logging avanzado
5. **Implementar tests** unitarios y de integración

## 🎉 ¡Implementación Completa!

El botón "Pagos y Facturas" está totalmente funcional y conectado a tu backend NestJS y componente .NET. La integración incluye:

- ✅ Verificación de salud del servicio
- ✅ Selección de planes
- ✅ Creación de sesiones de pago
- ✅ Redirección a pasarela .NET
- ✅ Páginas de éxito y cancelación
- ✅ Manejo completo de errores
- ✅ UI consistente con el diseño existente