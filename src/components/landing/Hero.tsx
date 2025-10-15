'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Shield, Users, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9fdbc2]/10 to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-[#9fdbc2]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#14a67e]/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-[#9fdbc2]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#9fdbc2]/30 hover:border-[#14a67e]/50 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-[#14a67e] group-hover:rotate-12 transition-transform" />
              <span className="text-sm text-[#0c272d] font-medium">Secure Institutional Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl lg:text-6xl font-bold text-[#0c272d] leading-tight"
            >
              Streamline Your
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent"
              >
                {' '}Educational Projects
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-[#0c272d]/70 leading-relaxed max-w-lg"
            >
              Comprehensive project management platform designed for educational institutions.
              Seamlessly integrate authentication, collaboration, and progress tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="#pricing" className="group bg-[#14a67e] text-white px-8 py-4 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center space-x-2">
                <span className="font-semibold">See Pricings</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="group bg-white/50 backdrop-blur-sm text-[#0c272d] px-8 py-4 rounded-xl hover:bg-white/70 transition-all duration-300 border border-[#9fdbc2]/30 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center space-x-2">
                <span>Watch Demo</span>
                <TrendingUp className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex items-center space-x-8 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5 text-[#14a67e]" />
                <span className="text-[#0c272d]/70">SSO/LDAP Integration</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5 text-[#14a67e]" />
                <span className="text-[#0c272d]/70">Enterprise Ready</span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Background decorative image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=800&fit=crop"
                alt="Educational collaboration"
                className="w-full h-full object-cover opacity-10 blur-sm"
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white/30 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-[#9fdbc2]/20 relative z-10 hover:shadow-3xl hover:border-[#14a67e]/30 transition-all"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0c272d]">Project Dashboard</h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-[#14a67e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <BookOpen className="w-8 h-8 text-[#14a67e] mb-2" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-2xl font-bold text-[#0c272d]"
                    >
                      24
                    </motion.div>
                    <div className="text-sm text-[#0c272d]/60">Active Projects</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <Users className="w-8 h-8 text-[#14a67e] mb-2" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="text-2xl font-bold text-[#0c272d]"
                    >
                      156
                    </motion.div>
                    <div className="text-sm text-[#0c272d]/60">Team Members</div>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#0c272d]/70">Project Completion</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="text-sm font-semibold text-[#14a67e]"
                    >
                      78%
                    </motion.span>
                  </div>
                  <div className="w-full bg-[#9fdbc2]/20 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] h-3 rounded-full relative overflow-hidden"
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
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


