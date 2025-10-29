import React from 'react';
import { CreditCard } from 'lucide-react';
import { usePayment } from '@/lib/hooks/usePayment';
import { useAuth } from '@/lib/auth-store';

interface PaymentButtonProps {
  planId: string;
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  planId, 
  buttonText = 'Acceder a Pagos y Facturas',
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const { createPaymentSession, loading, error } = usePayment();
  const { state: authState } = useAuth();

  const handlePayment = async () => {
    if (!authState.user?.id) {
      alert('Usuario no identificado. Por favor, inicia sesión.');
      return;
    }

    try {
      await createPaymentSession({
        userId: authState.user.id,
        planId,
        metadata: {
          userEmail: authState.user.email,
          source: 'dashboard-button'
        }
      });
    } catch (error) {
      // Error ya manejado en el hook
      console.error('Error en handlePayment:', error);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-[#14a67e] text-white hover:bg-[#0f8a67] shadow-lg hover:shadow-xl',
    secondary: 'bg-white/60 dark:bg-gray-700/60 text-[#0c272d] dark:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-[#9fdbc2]/20 dark:border-gray-600/30'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm space-x-2',
    md: 'px-6 py-3 text-base space-x-2',
    lg: 'px-8 py-4 text-lg space-x-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading || !authState.user}
        className={combinedClasses}
      >
        {loading ? (
          <>
            <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${iconSizes[size]}`} />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <CreditCard className={iconSizes[size]} />
            <span>{buttonText}</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
          Error: {error}
        </div>
      )}
      
      {!authState.user && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Inicia sesión para continuar
        </div>
      )}
    </div>
  );
};