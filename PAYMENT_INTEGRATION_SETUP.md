# 🔧 Configuración de Desarrollo - Integración de Pagos

## 📋 Resumen de Implementación

Se ha implementado la integración de pagos según la documentación del backend, siguiendo las mejores prácticas para React/Next.js.

## 🚀 Archivos Implementados

### 1. Servicios Core
- `src/lib/payment-service.ts` - Servicio principal de pagos
- `src/lib/hooks/usePayment.ts` - Hook personalizado para pagos
- `src/lib/config.ts` - Configuración actualizada con URLs de pagos

### 2. Componentes UI
- `src/components/PaymentButton.tsx` - Botón de pago reutilizable
- `src/components/PricingPlans.tsx` - Componente de planes completo

### 3. Páginas
- `src/app/pricing/page.tsx` - Página de precios (nueva)
- `src/app/payment-success/page.tsx` - Página de éxito (actualizada)
- `src/app/payment-cancel/page.tsx` - Página de cancelación (actualizada)

### 4. Dashboard
- `src/components/dashboard/PagosFacturas.tsx` - Actualizado con nueva integración

## ⚙️ Configuración de Desarrollo

### Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_API_USE_PROXY=true
```

### Puertos Requeridos
- **Frontend Next.js**: Puerto 4000 (configurado en package.json)
- **Backend NestJS**: Puerto 3000
- **Componente .NET**: Puerto 5194 o 7209

## 🧪 Cómo Probar

### 1. Verificar Backend
```bash
# Health check general
curl http://localhost:3000

# Health check de pagos
curl http://localhost:3000/v1/payments/health

# Obtener planes
curl http://localhost:3000/v1/payments/plans
```

### 2. Probar Integración Frontend

#### Opción A: Página de Precios Dedicada
```
http://localhost:4000/pricing
```

#### Opción B: Dashboard
1. Ir a `http://localhost:4000/dashboard`
2. En la sección "Pagos y Facturas"
3. Usar los botones de pago

### 3. Flujo Completo
1. **Clic en botón** → Crea sesión en backend
2. **Redirección** → Va al componente .NET
3. **Procesar pago** → Simular pago en .NET
4. **Callback** → Regresa a `/payment-success` o `/payment-cancel`

## 🎯 Componentes Disponibles

### PaymentButton
```tsx
import { PaymentButton } from '@/components/PaymentButton';

<PaymentButton
  planId="pro"
  buttonText="Acceder a Pagos"
  variant="primary"
  size="lg"
/>
```

### PricingPlans
```tsx
import { PricingPlans } from '@/components/PricingPlans';

<PricingPlans />
```

### usePayment Hook
```tsx
import { usePayment } from '@/lib/hooks/usePayment';

const { createPaymentSession, getPlans, loading, error } = usePayment();
```

## 🔍 Debugging

### Logs Importantes
```javascript
// En DevTools Console buscar:
console.log('🚀 Iniciando proceso de pago...');
console.log('✅ Sesión creada:');
console.log('🔄 Redirigiendo a:');
```

### Estados de Health Check
- **🟡 checking**: Verificando servicios
- **🟢 healthy**: Servicios operativos  
- **🔴 unhealthy**: Servicios no disponibles

### Errores Comunes

#### "planId should not be empty"
- ✅ Verificar que se envía `planId` no `plan`
- ✅ Verificar que `userId` no esté vacío

#### "CORS policy"
- ✅ Backend debe estar en puerto 3000
- ✅ Frontend debe estar en puerto permitido (4000 por defecto)

#### "No es posible conectar"
- ✅ Verificar que NestJS esté ejecutándose
- ✅ Verificar que componente .NET esté ejecutándose

## 📝 Datos de Prueba

### Planes Disponibles
```typescript
const testPlans = [
  { id: 'basic', name: 'Plan Básico', price: 75000 },
  { id: 'pro', name: 'Plan Pro', price: 150000 },
  { id: 'enterprise', name: 'Plan Enterprise', price: 270000 }
];
```

### Usuario de Prueba
```typescript
const testUser = {
  id: 'test-user-123',
  email: 'test@flowmatic.com'
};
```

## 🔒 Seguridad

### ✅ Implementado
- ✅ Validación de usuario autenticado
- ✅ URLs de callback configurables
- ✅ Metadata de sesión con información del usuario
- ✅ Limpieza de localStorage en callbacks
- ✅ Manejo de errores comprensivo

### ⚠️ Consideraciones
- Los pagos van directamente al backend NestJS (nunca al .NET)
- Las URLs de callback son configurables por entorno
- El sessionId se guarda temporalmente en localStorage

## 🚀 Próximos Pasos

### Funcionalidades Pendientes
1. **Historial de pagos** - Mostrar pagos anteriores
2. **Facturas PDF** - Generar y descargar facturas
3. **Webhooks** - Notificaciones automáticas de estado
4. **Suscripciones** - Pagos recurrentes
5. **Cupones/Descuentos** - Sistema de promociones

### Mejoras UX
1. **Loading states** más detallados
2. **Animaciones** de transición
3. **Notificaciones toast** para feedback
4. **Modo offline** con estado de cola

## 📞 Soporte

### Para el Equipo de Frontend
- Revisar este archivo para dudas de implementación
- Usar los componentes ya creados antes que custom
- Seguir el patrón de error handling establecido

### Para el Equipo de Backend
- Los endpoints implementados siguen la documentación exacta
- Cualquier cambio en el API debe reflejarse en `payment-service.ts`
- Los CORS deben permitir `http://localhost:4000`

### Contacto
- **Issues técnicos**: Revisar logs de console y network tab
- **Nuevas funcionalidades**: Seguir el patrón de componentes existentes
- **Bugs**: Incluir sessionId y mensaje de error exacto

---

¡La integración está lista para usar! 🎉