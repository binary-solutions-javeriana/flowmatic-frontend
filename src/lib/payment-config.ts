// Configuración centralizada para la integración con la pasarela de pagos

export const PAYMENT_CONFIG = {
  // URLs del backend
  BACKEND_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  
  // Endpoints de la API de pagos
  ENDPOINTS: {
    HEALTH: '/v1/payments/health',
    PLANS: '/v1/payments/plans', 
    CREATE_SESSION: '/v1/payments/session',
    SESSION_STATUS: (sessionId: string) => `/v1/payments/session/${sessionId}/status`,
    CANCEL_SESSION: (sessionId: string) => `/v1/payments/session/${sessionId}/cancel`,
  },
  
  // URLs de redirección
  REDIRECT_URLS: {
    SUCCESS: '/payment-success',
    CANCEL: '/payment-cancel',
  },
  
  // Configuración del componente .NET
  DOTNET_COMPONENT: {
    URL: 'http://localhost:5194',
    TIMEOUT: 60000, // 1 minuto
  },
  
  // Planes por defecto (fallback si la API no responde)
  DEFAULT_PLANS: [
    {
      id: 'basic',
      name: 'Basic',
      price: 75000,
      currency: 'COP',
      description: 'Plan básico con funcionalidades esenciales'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 150000,
      currency: 'COP',
      description: 'Plan profesional con funcionalidades avanzadas'
    }
  ],
  
  // Estados de pago
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  } as const,
  
  // Métodos de pago soportados
  PAYMENT_METHODS: {
    CARD: 'card',
    PSE: 'pse'
  } as const,
  
  // Configuración de localStorage
  STORAGE_KEYS: {
    SESSION_ID: 'paymentSessionId',
    USER_TOKEN: 'token'
  },
  
  // Headers por defecto para las requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Configuración de timeouts
  TIMEOUTS: {
    HEALTH_CHECK: 5000,
    SESSION_CREATE: 10000,
    STATUS_CHECK: 5000
  }
};

// Tipos TypeScript para mayor seguridad
export type PaymentStatus = typeof PAYMENT_CONFIG.PAYMENT_STATUS[keyof typeof PAYMENT_CONFIG.PAYMENT_STATUS];
export type PaymentMethod = typeof PAYMENT_CONFIG.PAYMENT_METHODS[keyof typeof PAYMENT_CONFIG.PAYMENT_METHODS];

// Función utilitaria para construir URLs completas
export const buildUrl = (endpoint: string): string => {
  const baseUrl = PAYMENT_CONFIG.BACKEND_BASE_URL;
  return endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
};

// Función utilitaria para obtener headers de autenticación
export const getAuthHeaders = (includeAuth: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = { ...PAYMENT_CONFIG.DEFAULT_HEADERS };
  
  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEYS.USER_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Función utilitaria para formatear precios
export const formatPrice = (amount: number, currency: string = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Función utilitaria para validar el estado de salud
export const isHealthy = (healthResponse: any): boolean => {
  return healthResponse && healthResponse.status === 'healthy';
};

export default PAYMENT_CONFIG;