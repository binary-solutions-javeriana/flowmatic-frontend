'use client';

import React from 'react';
import { Shield, Zap, Globe, Award, TrendingUp, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative image */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop"
          alt="Team collaboration"
          fill
          className="w-full h-full object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold text-[#0c272d]"
            >
              Why Organizations Choose Flowmatic
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl text-[#0c272d]/70"
            >
              Built specifically for academic environments with enterprise-grade security and intuitive collaboration tools.
            </motion.p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e]/20 to-[#9fdbc2]/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:from-[#14a67e]/30 group-hover:to-[#9fdbc2]/30 transition-all"
                >
                  <Zap className="w-6 h-6 text-[#14a67e]" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2 text-lg">Seamless Integration</h3>
                  <p className="text-[#0c272d]/70">Connect with existing institutional systems through SSO/LDAP without disrupting current workflows.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e]/20 to-[#9fdbc2]/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:from-[#14a67e]/30 group-hover:to-[#9fdbc2]/30 transition-all"
                >
                  <Globe className="w-6 h-6 text-[#14a67e]" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2 text-lg">Multi-Campus Support</h3>
                  <p className="text-[#0c272d]/70">Scale across multiple campuses and departments with centralized management and decentralized access.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e]/20 to-[#9fdbc2]/20 flex items-center justify-center flex-shrink-0 mt-1 group-hover:from-[#14a67e]/30 group-hover:to-[#9fdbc2]/30 transition-all"
                >
                  <Shield className="w-6 h-6 text-[#14a67e]" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-[#0c272d] mb-2 text-lg">Privacy & Compliance</h3>
                  <p className="text-[#0c272d]/70">FERPA compliant with advanced security features to protect sensitive academic information.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Background image with overlay */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=800&fit=crop"
                alt="Team success"
                fill
                className="w-full h-full object-cover opacity-20"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#9fdbc2]/40 to-[#14a67e]/20"></div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative bg-gradient-to-br from-[#9fdbc2]/20 to-[#14a67e]/10 rounded-3xl p-8 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 space-y-4 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#14a67e]" />
                    <span className="text-sm text-[#0c272d]/70 font-medium">User Satisfaction</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="text-2xl font-bold text-[#14a67e]"
                  >
                    98%
                  </motion.span>
                </div>
                <div className="w-full bg-[#9fdbc2]/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '98%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-3 rounded-full relative"
                  >
                    <motion.div
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    />
                  </motion.div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center space-y-2 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 hover:shadow-xl transition-all cursor-pointer"
                >
                  <Users2 className="w-8 h-8 text-[#14a67e] mx-auto" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-[#0c272d]/70 font-medium">Institutions</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center space-y-2 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 hover:shadow-xl transition-all cursor-pointer"
                >
                  <TrendingUp className="w-8 h-8 text-[#14a67e] mx-auto" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent">50K+</div>
                  <div className="text-sm text-[#0c272d]/70 font-medium">Active Users</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;


