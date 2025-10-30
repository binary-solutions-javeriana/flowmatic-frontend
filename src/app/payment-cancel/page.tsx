'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { config } from '@/lib/config';

// Ensure this page is treated as dynamic to avoid prerender CSR bailout errors
export const dynamic = 'force-dynamic';

function PaymentCancelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlSessionId = searchParams.get('sessionId');
    const storedSessionId = localStorage.getItem('paymentSessionId');
    const finalSessionId = urlSessionId || storedSessionId;
    setSessionId(finalSessionId);
  }, [searchParams]);

  const handleBackToDashboard = () => {
    localStorage.removeItem('paymentSessionId');
    router.push('/dashboard');
  };

  const handleRetryPayment = async () => {
    setLoading(true);
    try {
      if (sessionId) {
        await fetch(`${config.payments.apiUrl}/session/${sessionId}/cancel`, {
          method: 'POST'
        });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Error retrying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100 mb-2">
          Pago Cancelado
        </h1>
        
        <p className="text-[#0c272d]/70 dark:text-gray-400 mb-6">
          El proceso de pago ha sido cancelado. No se realizó ningún cargo a tu cuenta.
        </p>

        {sessionId && (
          <div className="bg-white/40 dark:bg-gray-700/40 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-3">
              Información de la Sesión
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Sesión:</span>
                <span className="text-[#0c272d] dark:text-gray-100 font-mono text-xs">
                  {sessionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Estado:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Cancelado
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
            Posibles motivos de cancelación:
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 text-left">
            <li>• Decidiste no completar la transacción</li>
            <li>• Hubo un problema con el método de pago</li>
            <li>• La sesión expiró por inactividad</li>
            <li>• Cerraste la ventana del navegador</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            disabled={loading}
            className={`w-full py-3 px-6 bg-[#14a67e] text-white rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 ${
              loading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-[#0f8a67]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Intentar Nuevamente</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleBackToDashboard}
            className="w-full py-3 px-6 bg-white/60 dark:bg-gray-700/60 text-[#0c272d] dark:text-gray-100 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 border border-[#9fdbc2]/20 dark:border-gray-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
        
        <p className="text-xs text-[#0c272d]/50 dark:text-gray-500 mt-6">
          ¿Necesitas ayuda? <a href="mailto:support@flowmatic.com" className="text-[#14a67e] hover:underline">Contacta soporte</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <PaymentCancelInner />
    </Suspense>
  );
}