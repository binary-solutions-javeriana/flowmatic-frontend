import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Shield, Users, Globe, BookOpen } from 'lucide-react';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const monthlyPrice = 150000;
  const annualPrice = 1200000;
  const monthlySavings = (monthlyPrice * 12) - annualPrice;
  const monthlyEquivalent = Math.round(annualPrice / 12);

  const tiers = [
    {
      name: 'Gratuito',
      subtitle: 'Perfecto para empezar',
      price: 0,
      period: 'Siempre gratis',
      description: 'Ideal para equipos pequeños y proyectos académicos básicos',
      icon: BookOpen,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900',
      popular: false,
      features: [
        'Hasta 3 proyectos activos',
        'Máximo 10 usuarios',
        'Tableros Kanban básicos',
        'Chat interno limitado',
        'Almacenamiento: 1GB',
        'Reportes básicos',
        'Soporte por email',
        'Integración con Google Workspace'
      ],
      limitations: [
        'Sin autenticación SSO/LDAP',
        'Sin exportación de reportes',
        'Sin análisis avanzados'
      ]
    },
    {
      name: 'Profesional',
      subtitle: 'Para instituciones en crecimiento',
      price: isAnnual ? monthlyEquivalent : monthlyPrice,
      originalPrice: isAnnual ? monthlyPrice : null,
      period: isAnnual ? '/mes (facturado anualmente)' : '/mes',
      description: 'Solución completa para departamentos y facultades',
      icon: Zap,
      color: 'from-[#14a67e] to-[#9fdbc2]',
      bgColor: 'bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5',
      borderColor: 'border-[#14a67e]/30',
      textColor: 'text-[#0c272d]',
      popular: true,
      features: [
        'Proyectos ilimitados',
        'Hasta 100 usuarios',
        'Autenticación SSO/LDAP completa',
        'Tableros Kanban + Gantt avanzados',
        'Chat interno con menciones',
        'Almacenamiento: 50GB',
        'Reportes avanzados con exportación',
        'Análisis y métricas detalladas',
        'Gestión de roles granular',
        'Integraciones múltiples',
        'Soporte prioritario 24/7',
        'Backup automático diario'
      ],
      bonusFeatures: [
        'Vista de calendario integrada',
        'Notificaciones personalizadas',
        'API REST completa'
      ]
    },
    {
      name: 'Empresarial',
      subtitle: 'Para universidades completas',
      price: isAnnual ? Math.round(monthlyEquivalent * 1.8) : Math.round(monthlyPrice * 1.8),
      originalPrice: isAnnual ? Math.round(monthlyPrice * 1.8) : null,
      period: isAnnual ? '/mes (facturado anualmente)' : '/mes',
      description: 'Solución enterprise para múltiples campus',
      icon: Crown,
      color: 'from-purple-600 to-blue-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-blue-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-900',
      popular: false,
      features: [
        'Todo lo de Profesional, más:',
        'Usuarios ilimitados',
        'Múltiples campus/sedes',
        'Almacenamiento: 500GB',
        'Panel de soporte integrado',
        'SLA garantizado 99.9%',
        'Monitoreo de sistemas',
        'Gestión de incidentes',
        'Cumplimiento FERPA avanzado',
        'Auditoría completa',
        'Onboarding personalizado',
        'Gerente de cuenta dedicado'
      ],
      bonusFeatures: [
        'Integración con ERP institucional',
        'Dashboards ejecutivos personalizados',
        'Análisis predictivo con IA',
        'Migración de datos asistida'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#9fdbc2]/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-[#0c272d]">Planes Diseñados para Instituciones Educativas</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-3xl mx-auto">
            Desde proyectos académicos básicos hasta gestión enterprise de múltiples campus. 
            Encuentra el plan perfecto para tu institución.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-[#14a67e]' : 'text-[#0c272d]/60'}`}>Mensual</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-[#14a67e]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14a67e] focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#14a67e] transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isAnnual ? 'text-[#14a67e]' : 'text-[#0c272d]/60'}`}>Anual</span>
              {isAnnual && (
                <span className="inline-flex items-center space-x-1 bg-[#14a67e]/10 text-[#14a67e] px-2 py-1 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3" />
                  <span>Ahorra ${monthlySavings.toLocaleString('es-CO')} COP</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative ${tier.bgColor} rounded-3xl p-8 border-2 ${tier.borderColor} ${
                  tier.popular ? 'ring-4 ring-[#14a67e]/20 scale-105' : ''
                } hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Más Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-4 mb-8">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${tier.textColor}`}>{tier.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tier.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-1">
                      {tier.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${tier.originalPrice.toLocaleString('es-CO')}
                        </span>
                      )}
                      <span className={`text-4xl font-bold ${tier.textColor}`}>
                        {tier.price === 0 ? 'Gratis' : `$${tier.price.toLocaleString('es-CO')}`}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-gray-600 text-sm">{tier.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-[#14a67e] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.bonusFeatures && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Características Premium:</h4>
                      <ul className="space-y-2">
                        {tier.bonusFeatures.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-[#14a67e] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tier.limitations && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Limitaciones:</h4>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start space-x-2">
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0 mt-0.5"></div>
                            <span className="text-sm text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                      tier.popular
                        ? 'bg-[#14a67e] text-white hover:bg-[#14a67e]/90 shadow-lg'
                        : index === 0
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {index === 0 ? 'Empezar Gratis' : index === 1 ? 'Iniciar Prueba Gratuita' : 'Contactar Ventas'}
                  </button>
                </div>

                {index === 1 && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    30 días gratis • Sin tarjeta de crédito
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center space-y-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-3">
              <Shield className="w-8 h-8 text-[#14a67e]" />
              <h4 className="font-semibold text-[#0c272d]">Seguridad Garantizada</h4>
              <p className="text-sm text-gray-600 text-center">Cumplimiento FERPA y encriptación de extremo a extremo</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Users className="w-8 h-8 text-[#14a67e]" />
              <h4 className="font-semibold text-[#0c272d]">Soporte Especializado</h4>
              <p className="text-sm text-gray-600 text-center">Equipo experto en instituciones educativas</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Globe className="w-8 h-8 text-[#14a67e]" />
              <h4 className="font-semibold text-[#0c272d]">Escalabilidad Total</h4>
              <p className="text-sm text-gray-600 text-center">Crece con tu institución sin límites</p>
            </div>
          </div>

          <div className="bg-[#9fdbc2]/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#0c272d] mb-4">¿Necesitas un plan personalizado?</h3>
            <p className="text-gray-700 mb-6">
              Para universidades con más de 1000 usuarios o requisitos especiales, 
              ofrecemos soluciones completamente personalizadas.
            </p>
            <button className="bg-[#14a67e] text-white px-8 py-3 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Contactar Especialista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


