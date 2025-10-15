'use client';

import React from 'react';
import { BarChart3, Calendar, CheckCircle, Lock, MessageCircle, Settings, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#9fdbc2]/5 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#9fdbc2]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#14a67e]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold text-[#0c272d]">Everything Your Institution Needs</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-2xl mx-auto">
            Powerful features designed specifically for educational project management and collaboration
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <Lock className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Institutional Authentication</h3>
              <p className="text-[#0c272d]/70 mb-6">Seamless SSO/LDAP integration with role-based access control for administrators, teachers, and students.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Single Sign-On (SSO)</span>
                </motion.li>
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>LDAP Integration</span>
                </motion.li>
                <motion.li
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Role Management</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Project Management</h3>
              <p className="text-[#0c272d]/70 mb-6">Create, organize, and track academic and research projects with comprehensive timeline and resource management.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Project Templates</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Resource Allocation</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Timeline Tracking</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <Calendar className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Task & Phase Management</h3>
              <p className="text-[#0c272d]/70 mb-6">Kanban boards, Gantt charts, and calendar views for comprehensive task tracking and deadline management.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Kanban Boards</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Gantt Charts</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Priority Management</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Internal Communication</h3>
              <p className="text-[#0c272d]/70 mb-6">Project-based messaging channels with mentions, file sharing, and real-time collaboration features.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Project Channels</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>User Mentions</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>File Sharing</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Analytics & Reporting</h3>
              <p className="text-[#0c272d]/70 mb-6">Comprehensive progress tracking with automated reports, delay indicators, and exportable analytics.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Progress Charts</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>PDF/Excel Export</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Performance Metrics</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -10 }}
            className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:shadow-lg"
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Support Panel</h3>
              <p className="text-[#0c272d]/70 mb-6">Integrated support system with incident management, system monitoring, and SLA tracking for IT teams.</p>
              <ul className="space-y-2 text-sm text-[#0c272d]/60">
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>Incident Management</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>System Monitoring</span>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                  <span>SLA Tracking</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;


