import { useState } from 'react';
import { paymentService, CreateSessionRequest, PaymentPlan } from '@/lib/payment-service';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  const createPaymentSession = async (data: CreateSessionRequest) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando proceso de pago...', {
        planId: data.planId,
        userId: data.userId
      });

      const session = await paymentService.createPaymentSession({
        ...data,
        returnUrl: data.returnUrl || `${window.location.origin}/payment-success`,
        cancelUrl: data.cancelUrl || `${window.location.origin}/payment-cancel`,
        metadata: {
          source: 'flowmatic-frontend',
          timestamp: new Date().toISOString(),
          ...data.metadata
        }
      });

      console.log('✅ Sesión creada:', session);

      if (session.success && session.paymentUrl) {
        console.log('🔄 Redirigiendo a:', session.paymentUrl);
        
        // Guardar sessionId en localStorage para las páginas de callback
        localStorage.setItem('paymentSessionId', session.sessionId);
        
        // Redirigir a la pasarela de pagos
        window.location.href = session.paymentUrl;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error en el proceso de pago:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPlans = async () => {
    setPlansLoading(true);
    setError(null);

    try {
      const fetchedPlans = await paymentService.getPlans();
      setPlans(fetchedPlans);
      return fetchedPlans;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener planes';
      setError(errorMessage);
      throw err;
    } finally {
      setPlansLoading(false);
    }
  };

  const getPaymentStatus = async (sessionId: string) => {
    try {
      return await paymentService.getPaymentStatus(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al verificar estado';
      setError(errorMessage);
      throw err;
    }
  };

  const cancelPayment = async (sessionId: string) => {
    try {
      await paymentService.cancelPayment(sessionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar pago';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createPaymentSession,
    getPlans,
    getPaymentStatus,
    cancelPayment,
    clearError,
    loading,
    error,
    plans,
    plansLoading
  };
};