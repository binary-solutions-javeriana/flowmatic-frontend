// Payment service types and implementation based on backend documentation
import { config } from './config';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

export interface CreateSessionRequest {
  userId: string;
  planId: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId: string;
  paymentUrl: string;
  expiresAt: string;
}

export interface PaymentStatus {
  sessionId: string;
  status: string;
  planId: string;
  userId: string;
  amount?: number;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private readonly baseUrl = config.payments.apiUrl;

  /**
   * Obtener planes disponibles
   */
  async getPlans(): Promise<PaymentPlan[]> {
    const response = await fetch(`${this.baseUrl}/plans`);
    if (!response.ok) {
      throw new Error('Error al obtener planes');
    }
    return await response.json();
  }

  /**
   * Crear sesión de pago - MÉTODO PRINCIPAL
   */
  async createPaymentSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: request.userId,
        planId: request.planId,
        returnUrl: request.returnUrl || config.payments.successUrl,
        cancelUrl: request.cancelUrl || config.payments.cancelUrl,
        metadata: request.metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear sesión de pago');
    }

    return await response.json();
  }

  /**
   * Verificar estado de pago
   */
  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/status`);
    if (!response.ok) {
      throw new Error('Error al verificar estado de pago');
    }
    return await response.json();
  }

  /**
   * Cancelar sesión de pago
   */
  async cancelPayment(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/cancel`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Error al cancelar pago');
    }
  }

  /**
   * Health check del servicio de pagos
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(config.payments.healthUrl);
    if (!response.ok) {
      throw new Error('Error en health check');
    }
    return await response.json();
  }
}

// Singleton instance
export const paymentService = new PaymentService();