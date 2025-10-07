import React from 'react';
import { BarChart3, Calendar, CheckCircle, Lock, MessageCircle, Settings, Target } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#9fdbc2]/5 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-[#0c272d]">Everything Your Institution Needs</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-2xl mx-auto">
            Powerful features designed specifically for educational project management and collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Institutional Authentication</h3>
            <p className="text-[#0c272d]/70 mb-6">Seamless SSO/LDAP integration with role-based access control for administrators, teachers, and students.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Single Sign-On (SSO)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>LDAP Integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Role Management</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Project Management</h3>
            <p className="text-[#0c272d]/70 mb-6">Create, organize, and track academic and research projects with comprehensive timeline and resource management.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Project Templates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Resource Allocation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Timeline Tracking</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Task & Phase Management</h3>
            <p className="text-[#0c272d]/70 mb-6">Kanban boards, Gantt charts, and calendar views for comprehensive task tracking and deadline management.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Kanban Boards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Gantt Charts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Priority Management</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Internal Communication</h3>
            <p className="text-[#0c272d]/70 mb-6">Project-based messaging channels with mentions, file sharing, and real-time collaboration features.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Project Channels</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>User Mentions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>File Sharing</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Analytics & Reporting</h3>
            <p className="text-[#0c272d]/70 mb-6">Comprehensive progress tracking with automated reports, delay indicators, and exportable analytics.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Progress Charts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>PDF/Excel Export</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Performance Metrics</span>
              </li>
            </ul>
          </div>

          <div className="group bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#0c272d] mb-4">Support Panel</h3>
            <p className="text-[#0c272d]/70 mb-6">Integrated support system with incident management, system monitoring, and SLA tracking for IT teams.</p>
            <ul className="space-y-2 text-sm text-[#0c272d]/60">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>Incident Management</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>System Monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-[#14a67e]" />
                <span>SLA Tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;


