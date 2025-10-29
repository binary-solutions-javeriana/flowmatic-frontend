'use client';

import React from 'react';
import { PricingPlans } from '@/components/PricingPlans';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9fdbc2]/5 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0c272d] dark:text-gray-100 mb-6">
            Elige tu Plan Ideal
          </h1>
          <p className="text-xl text-[#0c272d]/70 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Descubre la solución perfecta para tu equipo con nuestros planes flexibles y escalables
          </p>
          <div className="w-24 h-1 bg-[#14a67e] mx-auto rounded-full"></div>
        </div>

        <PricingPlans />

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0c272d] dark:text-gray-100 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-[#0c272d]/70 dark:text-gray-400">
              Resolvemos tus dudas sobre nuestros planes
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 shadow-lg">
              <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                ¿Puedo cambiar de plan después?
              </h3>
              <p className="text-[#0c272d]/70 dark:text-gray-400 text-sm">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu dashboard.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 shadow-lg">
              <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                ¿Es seguro el proceso de pago?
              </h3>
              <p className="text-[#0c272d]/70 dark:text-gray-400 text-sm">
                Absolutamente. Utilizamos encriptación de nivel bancario y nunca almacenamos datos de tarjetas.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 shadow-lg">
              <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                ¿Hay periodo de prueba?
              </h3>
              <p className="text-[#0c272d]/70 dark:text-gray-400 text-sm">
                Ofrecemos 14 días de prueba gratuita para que explores todas las funcionalidades.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-[#9fdbc2]/20 dark:border-gray-700/50 p-6 shadow-lg">
              <h3 className="font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-[#0c272d]/70 dark:text-gray-400 text-sm">
                Aceptamos tarjetas de crédito y débito, transferencias bancarias y PSE.
              </p>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-16 text-center">
          <div className="bg-[#14a67e]/5 dark:bg-[#14a67e]/10 rounded-2xl border border-[#14a67e]/20 p-8">
            <h3 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100 mb-4">
              ¿Necesitas Ayuda?
            </h3>
            <p className="text-[#0c272d]/70 dark:text-gray-400 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@flowmatic.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#14a67e] text-white rounded-xl hover:bg-[#0f8a67] transition-all duration-300 hover:scale-105"
              >
                Contactar Soporte
              </a>
              <a
                href="mailto:sales@flowmatic.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/60 dark:bg-gray-700/60 text-[#0c272d] dark:text-gray-100 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 border border-[#9fdbc2]/20 dark:border-gray-600/30"
              >
                Consultas de Ventas
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;