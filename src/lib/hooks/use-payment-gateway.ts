import { useState, useCallback } from 'react';
import { PAYMENT_CONFIG } from '../payment-config';

// Función utilitaria para generar UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Función para validar si una string es un UUID válido
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

interface CreateSessionResponse {
  success: boolean;
  sessionId: string;
  paymentUrl: string;
  expiresAt: string;
}

interface PaymentStatus {
  sessionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
  method?: 'card' | 'pse';
  plan: string; // El backend retorna 'plan' según la documentación
  amount: number;
  createdAt: string;
  completedAt?: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

interface CreateSessionRequest {
  userId: string;
  planId: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export const usePaymentGateway = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar salud del servicio de pagos
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(PAYMENT_CONFIG.ENDPOINTS.HEALTH);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }, []);

  // Obtener planes disponibles
  const getPlans = useCallback(async (): Promise<PaymentPlan[]> => {
    try {
      const response = await fetch(PAYMENT_CONFIG.ENDPOINTS.PLANS);
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }, []);

  // Crear sesión de pago - MÉTODO PRINCIPAL
  const createSession = useCallback(async (payload: CreateSessionRequest): Promise<CreateSessionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(PAYMENT_CONFIG.ENDPOINTS.CREATE_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: payload.userId,
          planId: payload.planId,
          returnUrl: payload.returnUrl || `${window.location.origin}/payment-success`,
          cancelUrl: payload.cancelUrl || `${window.location.origin}/payment-cancel`,
          metadata: payload.metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }

      const session = await response.json();
      
      // Guardar sessionId para seguimiento
      if (session.sessionId) {
        localStorage.setItem('paymentSessionId', session.sessionId);
      }

      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estado de una sesión de pago
  const getSessionStatus = useCallback(async (sessionId: string): Promise<PaymentStatus> => {
    try {
      const response = await fetch(PAYMENT_CONFIG.ENDPOINTS.SESSION_STATUS(sessionId));
      if (!response.ok) {
        throw new Error('Failed to get session status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting session status:', error);
      throw error;
    }
  }, []);

  // Cancelar sesión de pago
  const cancelSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(PAYMENT_CONFIG.ENDPOINTS.CANCEL_SESSION(sessionId), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }, []);

  // Función de conveniencia para crear sesión y redirigir
  const createSessionAndRedirect = useCallback(async (
    userId: string | number,
    plan: string = 'pro',
    metadata?: Record<string, any>
  ) => {
    try {
      const baseUrl = window.location.origin;
      
      // Generar UUID válido si el userId no es un UUID
      let validUserId = String(userId);
      if (!isValidUUID(validUserId)) {
        // Si no es un UUID válido, generar uno nuevo
        validUserId = generateUUID();
        console.log('Generated new UUID for user:', validUserId);
      }
      
      const session = await createSession({
        userId: validUserId,
        planId: plan, // Cambiar a planId como espera el backend
        returnUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-cancel`,
        metadata: {
          source: 'flowmatic-frontend',
          timestamp: new Date().toISOString(),
          originalUserId: String(userId), // Guardar el ID original para referencia
          ...metadata,
        },
      });

      // Redirigir a la pasarela de pagos .NET
      window.location.href = session.paymentUrl;
    } catch (error) {
      console.error('Payment redirect error:', error);
      // El error ya está en el estado, no necesitamos hacer nada más aquí
    }
  }, [createSession]);

  return {
    isLoading,
    error,
    checkHealth,
    getPlans,
    createSession,
    getSessionStatus,
    cancelSession,
    createSessionAndRedirect,
    clearError: () => setError(null),
  };
};

export default usePaymentGateway;