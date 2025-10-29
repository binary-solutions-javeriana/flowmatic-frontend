import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { usePayment } from '@/lib/hooks/usePayment';
import { PaymentButton } from '@/components/PaymentButton';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 75000,
    currency: 'COP',
    description: 'Plan básico con funcionalidades esenciales',
    features: [
      'Hasta 5 proyectos',
      'Gestión básica de tareas',
      'Soporte por email',
      'Dashboard básico'
    ]
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    price: 150000,
    currency: 'COP',
    description: 'Plan profesional con funcionalidades avanzadas',
    features: [
      'Proyectos ilimitados',
      'Gestión avanzada de tareas',
      'Soporte prioritario',
      'Dashboard completo',
      'Reportes detallados',
      'Integraciones'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Plan Enterprise',
    price: 270000,
    currency: 'COP',
    description: 'Plan empresarial con todas las funcionalidades',
    features: [
      'Todo lo del Plan Pro',
      'Usuarios ilimitados',
      'API personalizada',
      'Soporte 24/7',
      'Consultoría incluida',
      'Implementación personalizada'
    ]
  }
];

export const PricingPlans: React.FC = () => {
  const { getPlans, plans, plansLoading, error } = usePayment();

  useEffect(() => {
    // Intentar obtener planes del backend
    getPlans().catch(() => {
      // Si falla, usar planes por defecto
      console.log('Usando planes por defecto');
    });
  }, []);

  // Usar planes del backend si están disponibles, sino usar los por defecto
  const displayPlans = plans.length > 0 ? plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    description: plan.description,
    features: getFeaturesByPlanId(plan.id),
    recommended: plan.id === 'pro'
  })) : defaultPlans;

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#0c272d] dark:text-gray-100 mb-4">
          Planes de Suscripción
        </h2>
        <p className="text-lg text-[#0c272d]/70 dark:text-gray-400 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a las necesidades de tu organización
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-yellow-800 dark:text-yellow-400 text-center">
            No se pudieron cargar los planes del servidor. Mostrando planes por defecto.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {displayPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl p-8 ${
              plan.recommended
                ? 'border-[#14a67e] ring-2 ring-[#14a67e]/20'
                : 'border-[#9fdbc2]/20 dark:border-gray-700/50'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#14a67e] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recomendado
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100 mb-2">
                {plan.name}
              </h3>
              <p className="text-[#0c272d]/70 dark:text-gray-400 mb-4">
                {plan.description}
              </p>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-[#14a67e]">
                  ${plan.price.toLocaleString()}
                </span>
                <span className="text-lg text-[#0c272d]/70 dark:text-gray-400 ml-2">
                  {plan.currency}
                </span>
              </div>
              <p className="text-sm text-[#0c272d]/50 dark:text-gray-500 mt-1">
                por mes
              </p>
            </div>

            <div className="mb-8">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={`${plan.id}-feature-${featureIndex}`} className="flex items-center">
                    <Check className="w-5 h-5 text-[#14a67e] mr-3 flex-shrink-0" />
                    <span className="text-[#0c272d] dark:text-gray-100">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <PaymentButton
              planId={plan.id}
              buttonText={plan.recommended ? 'Comenzar Ahora' : `Seleccionar ${plan.name}`}
              variant={plan.recommended ? 'primary' : 'secondary'}
              size="lg"
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-[#0c272d]/70 dark:text-gray-400">
          ¿Necesitas algo personalizado?{' '}
          <a 
            href="mailto:sales@flowmatic.com" 
            className="text-[#14a67e] hover:underline font-semibold"
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
};

// Helper function to get features based on plan ID
function getFeaturesByPlanId(planId: string): string[] {
  const featuresMap: Record<string, string[]> = {
    basic: [
      'Hasta 5 proyectos',
      'Gestión básica de tareas',
      'Soporte por email',
      'Dashboard básico'
    ],
    pro: [
      'Proyectos ilimitados',
      'Gestión avanzada de tareas',
      'Soporte prioritario',
      'Dashboard completo',
      'Reportes detallados',
      'Integraciones'
    ],
    enterprise: [
      'Todo lo del Plan Pro',
      'Usuarios ilimitados',
      'API personalizada',
      'Soporte 24/7',
      'Consultoría incluida',
      'Implementación personalizada'
    ]
  };

  return featuresMap[planId] || [
    'Funcionalidades estándar',
    'Soporte incluido',
    'Dashboard básico'
  ];
}