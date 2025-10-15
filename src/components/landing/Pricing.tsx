'use client';

import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Shield, Users, Globe, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import ContactForm from './ContactForm';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const monthlyPrice = 150000;
  const annualPrice = 1200000;
  const monthlySavings = (monthlyPrice * 12) - annualPrice;
  const monthlyEquivalent = Math.round(annualPrice / 12);

  const tiers = [
    {
      name: 'Free',
      subtitle: 'Perfect to get started',
      price: 0,
      period: 'Always free',
      description: 'Ideal for small teams and basic academic projects',
      icon: BookOpen,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900',
      popular: false,
      features: [
        'Up to 3 active projects',
        'Maximum 10 users',
        'Basic Kanban boards',
        'Limited internal chat',
        'Storage: 1GB',
        'Basic reports',
        'Email support',
        'Google Workspace integration'
      ],
      limitations: [
        'No SSO/LDAP authentication',
        'No report export',
        'No advanced analytics'
      ]
    },
    {
      name: 'Professional',
      subtitle: 'For growing institutions',
      price: isAnnual ? monthlyEquivalent : monthlyPrice,
      originalPrice: isAnnual ? monthlyPrice : null,
      period: isAnnual ? '/month (billed annually)' : '/month',
      description: 'Complete solution for departments and faculties',
      icon: Zap,
      color: 'from-[#14a67e] to-[#9fdbc2]',
      bgColor: 'bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5',
      borderColor: 'border-[#14a67e]/30',
      textColor: 'text-[#0c272d]',
      popular: true,
      features: [
        'Unlimited projects',
        'Up to 100 users',
        'Complete SSO/LDAP authentication',
        'Advanced Kanban + Gantt boards',
        'Internal chat with mentions',
        'Storage: 50GB',
        'Advanced reports with export',
        'Detailed analytics and metrics',
        'Granular role management',
        'Multiple integrations',
        'Priority 24/7 support',
        'Daily automatic backup'
      ],
      bonusFeatures: [
        'Integrated calendar view',
        'Custom notifications',
        'Complete REST API'
      ]
    },
    {
      name: 'Enterprise',
      subtitle: 'For complete universities',
      price: isAnnual ? Math.round(monthlyEquivalent * 1.8) : Math.round(monthlyPrice * 1.8),
      originalPrice: isAnnual ? Math.round(monthlyPrice * 1.8) : null,
      period: isAnnual ? '/month (billed annually)' : '/month',
      description: 'Enterprise solution for multiple campuses',
      icon: Crown,
      color: 'from-purple-600 to-blue-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-blue-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-900',
      popular: false,
      features: [
        'Everything from Professional, plus:',
        'Unlimited users',
        'Multiple campuses/locations',
        'Storage: 500GB',
        'Integrated support panel',
        '99.9% guaranteed SLA',
        'System monitoring',
        'Incident management',
        'Advanced FERPA compliance',
        'Complete audit',
        'Custom onboarding',
        'Dedicated account manager'
      ],
      bonusFeatures: [
        'Institutional ERP integration',
        'Custom executive dashboards',
        'AI-powered predictive analytics',
        'Assisted data migration'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#9fdbc2]/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#9fdbc2]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#14a67e]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold text-[#0c272d]">Plans Designed for Educational Institutions</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-3xl mx-auto">
            From basic academic projects to enterprise management of multiple campuses. 
            Find the perfect plan for your institution.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center space-x-4 mt-8"
          >
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-[#14a67e]' : 'text-[#0c272d]/60'}`}>Monthly</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-[#14a67e]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14a67e] focus:ring-offset-2"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`inline-block h-4 w-4 transform rounded-full bg-[#14a67e] ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </motion.button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-[#14a67e]' : 'text-[#0c272d]/60'}`}>Annual</span>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center space-x-1 bg-[#14a67e]/10 text-[#14a67e] px-2 py-1 rounded-full text-xs font-medium"
                >
                  <Star className="w-3 h-3" />
                  <span>Save ${monthlySavings.toLocaleString('es-CO')} COP</span>
                </motion.span>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const IconComponent = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: tier.popular ? 1.02 : 1.05 }}
                className={`relative ${tier.bgColor} rounded-3xl p-8 border-2 ${tier.borderColor} ${
                  tier.popular ? 'ring-4 ring-[#14a67e]/20 scale-105' : ''
                } hover:shadow-2xl transition-all duration-500`}
              >
                {tier.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Most Popular</span>
                    </motion.div>
                  </motion.div>
                )}

                <div className="text-center space-y-4 mb-8">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>
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
                        {tier.price === 0 ? 'Free' : `$${tier.price.toLocaleString('es-CO')}`}
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
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Premium Features:</h4>
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
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Limitations:</h4>
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      tier.popular
                        ? 'bg-[#14a67e] text-white hover:bg-[#14a67e]/90 shadow-lg hover:shadow-xl'
                        : index === 0
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {index === 0 ? 'Start Free' : index === 1 ? 'Start Free Trial' : 'Contact Sales'}
                  </motion.button>
                </div>

                {index === 1 && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    30 days free • No credit card required
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center space-y-8"
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Shield className="w-8 h-8 text-[#14a67e]" />
              </motion.div>
              <h4 className="font-semibold text-[#0c272d]">Guaranteed Security</h4>
              <p className="text-sm text-gray-600 text-center">FERPA compliance and end-to-end encryption</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="w-8 h-8 text-[#14a67e]" />
              </motion.div>
              <h4 className="font-semibold text-[#0c272d]">Specialized Support</h4>
              <p className="text-sm text-gray-600 text-center">Expert team in educational institutions</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Globe className="w-8 h-8 text-[#14a67e]" />
              </motion.div>
              <h4 className="font-semibold text-[#0c272d]">Total Scalability</h4>
              <p className="text-sm text-gray-600 text-center">Grow with your institution without limits</p>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Contact Form */}
            <ContactForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;


