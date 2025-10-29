'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sessionId de la URL o localStorage
    const urlSessionId = searchParams.get('sessionId');
    const storedSessionId = localStorage.getItem('paymentSessionId');
    const finalSessionId = urlSessionId || storedSessionId;
    
    setSessionId(finalSessionId);
    
    if (finalSessionId) {
      fetchPaymentDetails(finalSessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (sessionId: string) => {
    try {
      // Usar el servicio de pagos actualizado
      const response = await fetch(`http://localhost:3000/v1/payments/session/${sessionId}/status`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    // Limpiar sessionId del localStorage
    localStorage.removeItem('paymentSessionId');
    router.push('/dashboard');
  };

  const handleDownloadReceipt = () => {
    // Implementar descarga de comprobante
    alert('Funcionalidad de descarga en desarrollo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-8 shadow-lg text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100 mb-2">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-[#0c272d]/70 dark:text-gray-400 mb-6">
          Tu pago ha sido procesado correctamente
        </p>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-white/40 dark:bg-gray-700/40 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-3">
              Detalles del Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Sesión:</span>
                <span className="text-[#0c272d] dark:text-gray-100 font-mono text-xs">
                  {sessionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Plan:</span>
                <span className="text-[#0c272d] dark:text-gray-100 capitalize">
                  {paymentDetails.planId || paymentDetails.plan || 'Pro'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Monto:</span>
                <span className="text-[#14a67e] font-semibold">
                  ${paymentDetails.amount?.toLocaleString() || '150,000'} COP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0c272d]/70 dark:text-gray-400">Estado:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Completado
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadReceipt}
            className="w-full py-3 px-6 bg-[#14a67e] text-white rounded-xl hover:bg-[#0f8a67] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Comprobante</span>
          </button>
          
          <button
            onClick={handleBackToDashboard}
            className="w-full py-3 px-6 bg-white/60 dark:bg-gray-700/60 text-[#0c272d] dark:text-gray-100 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 border border-[#9fdbc2]/20 dark:border-gray-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </button>
        </div>

        {/* Support Link */}
        <p className="text-xs text-[#0c272d]/50 dark:text-gray-500 mt-6">
          ¿Tienes problemas? <a href="mailto:support@flowmatic.com" className="text-[#14a67e] hover:underline">Contacta soporte</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;