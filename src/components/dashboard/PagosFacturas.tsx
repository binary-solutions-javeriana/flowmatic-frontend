'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { usePayment } from '@/lib/hooks/usePayment';
import { useAuth } from '@/lib/auth-store';
import { PaymentButton } from '@/components/PaymentButton';
import { PricingPlans } from '@/components/PricingPlans';

interface PaymentGatewayProps {
  tenantAdminId?: number;
}

const PagosFacturas: React.FC<PaymentGatewayProps> = ({ tenantAdminId }) => {
  const {
    getPlans,
    error
  } = usePayment();
  
  const { state: authState } = useAuth();
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  // Verificar salud del servicio al cargar
  useEffect(() => {
    checkPaymentServiceHealth();
    loadAvailablePlans();
  }, []);

  const checkPaymentServiceHealth = async () => {
    try {
      // Intentar obtener planes para verificar conectividad
      await getPlans();
      setHealthStatus('healthy');
    } catch (error) {
      setHealthStatus('unhealthy');
      console.error('Payment service health check failed:', error);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      await getPlans();
      // El estado ya se actualiza en el hook
    } catch (error) {
      console.error('Error loading plans:', error);
      // Los planes por defecto se manejan en el componente PricingPlans
    }
  };

  const handleRetryHealthCheck = () => {
    setHealthStatus('checking');
    checkPaymentServiceHealth();
  };

  const getHealthStatusIcon = () => {
    switch (healthStatus) {
      case 'checking':
        return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />;
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getHealthStatusText = () => {
    switch (healthStatus) {
      case 'checking':
        return 'Verificando servicios...';
      case 'healthy':
        return 'Servicios operativos';
      case 'unhealthy':
        return 'Servicios no disponibles';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">
              Pagos y Facturas
            </h2>
            <p className="text-[#0c272d]/70 dark:text-gray-400 mt-1">
              Gestiona tus pagos a través de nuestra pasarela segura
            </p>
            
            {/* Estado del servicio */}
            <div className="flex items-center space-x-2 mt-2">
              {getHealthStatusIcon()}
              <span className="text-xs text-[#0c272d]/60 dark:text-gray-500">
                {getHealthStatusText()}
              </span>
              {healthStatus === 'unhealthy' && (
                <button
                  onClick={handleRetryHealthCheck}
                  className="text-xs text-[#14a67e] hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          </div>
          <div className="w-12 h-12 bg-[#14a67e]/10 dark:bg-[#14a67e]/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-[#14a67e]" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          {/* Plan Selection usando PaymentButton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PaymentButton
              planId="basic"
              buttonText="Plan Básico"
              variant="secondary"
              size="lg"
              className="w-full"
            />
            <PaymentButton
              planId="pro"
              buttonText="Plan Pro (Recomendado)"
              variant="primary"
              size="lg"
              className="w-full"
            />
            <PaymentButton
              planId="enterprise"
              buttonText="Plan Enterprise"
              variant="secondary"
              size="lg"
              className="w-full"
            />
          </div>
          
          {!authState.user && (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-400">
                Inicia sesión para acceder a los pagos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Planes disponibles - Componente completo */}
      <PricingPlans />
    </div>
  );
};

export default PagosFacturas;