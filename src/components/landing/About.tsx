'use client';

import React from 'react';
import { Award, Users, Globe, Target, Heart, Lightbulb, Shield, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Juan David Ramirez',
      role: 'CEO',
      expertise: 'Educational Management',
      avatar: 'JR',
      description: '15+ years in university administration',
      background: 'from-[#14a67e] to-[#9fdbc2]'
    },
    {
      name: 'Juan Pablo Cañon',
      role: 'CPO',
      expertise: 'Product Owner',
      avatar: 'JP',
      description: 'Ex-Google, specialist in educational systems',
      background: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Daniel Perez',
      role: 'Head of development',
      expertise: 'Software Architecture',
      avatar: 'DP',
      description: 'Ex-Google, UX/UI Design',
      background: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Jonathan Isaac Jurado',
      role: 'Head of Security',
      expertise: 'Educational Cybersecurity',
      avatar: 'JI',
      description: 'CISSP Certified, FERPA specialist',
      background: 'from-orange-500 to-orange-600'
    }
  ];


  const achievements = [
    {
      icon: Award,
      number: '500+',
      label: 'Educational Institutions',
      description: 'Universities and colleges trust us'
    },
    {
      icon: Users,
      number: '50K+',
      label: 'Active Users',
      description: 'Students, teachers and administrators'
    },
    {
      icon: Globe,
      number: '15+',
      label: 'Countries',
      description: 'Presence in Latin America and Spain'
    },
    {
      icon: Target,
      number: '98%',
      label: 'Satisfaction',
      description: 'Customer satisfaction index'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#9fdbc2]/5 relative overflow-hidden">
      {/* Background decorative image */}
      <div className="absolute inset-0 opacity-5">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop"
          alt="Education background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold text-[#0c272d]">About Us</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-3xl mx-auto">
            We are a team passionate about transforming project management in educational institutions, 
            combining academic experience with technological innovation.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-[#0c272d]"
            >
              Our Story
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[#0c272d]/70 text-lg leading-relaxed"
            >
              Flowmatic was born in 2025 when a group of educators and technologists came together with a clear vision: 
              to create tools that truly understand the unique needs of educational institutions.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[#0c272d]/70 text-lg leading-relaxed"
            >
              After years of working in universities and seeing the limitations of generic solutions, 
              we decided to build a platform designed specifically for the academic world.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ x: 10 }}
              className="flex items-center space-x-4 pt-4 cursor-pointer group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center group-hover:shadow-lg"
              >
                <BookOpen className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-[#0c272d]">Mission</h4>
                <p className="text-[#0c272d]/60">Empower educational institutions with intuitive and secure technology</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Background image */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=800&fit=crop"
                alt="Achievement"
                className="w-full h-full object-cover opacity-10"
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#9fdbc2]/20 to-[#14a67e]/10 rounded-3xl p-8 relative backdrop-blur-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 text-center space-y-2 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mx-auto"
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent">
                        {achievement.number}
                      </div>
                      <div className="text-sm font-medium text-[#0c272d]">{achievement.label}</div>
                      <div className="text-xs text-[#0c272d]/60">{achievement.description}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-[#0c272d] mb-4">Our Team</h3>
            <p className="text-xl text-[#0c272d]/70">
              Leaders with experience in education, technology and project management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl text-center space-y-4 relative overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#14a67e]/5 to-[#9fdbc2]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${member.background} flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-2xl transition-shadow`}
                    >
                      {member.avatar}
                    </motion.div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#0c272d]">{member.name}</h4>
                      <p className="text-[#14a67e] font-medium text-sm">{member.role}</p>
                      <p className="text-[#0c272d]/60 text-sm mt-1">{member.expertise}</p>
                    </div>
                    <p className="text-[#0c272d]/70 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-[#9fdbc2]/10 to-[#14a67e]/10 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <img
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=600&fit=crop"
              alt="Commitment"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-[#0c272d] mb-6"
            >
              Our Commitment
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl text-[#0c272d]/70 max-w-4xl mx-auto leading-relaxed mb-8"
            >
              We are committed to continuing to innovate and improve our solutions, 
              always listening to our educational community and adapting to their changing needs. 
              Education is the future, and we are here to drive it forward with the best technology.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-[#0c272d]/60"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-full hover:bg-white/70 transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#14a67e]" />
                <span>FERPA Compliance</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-full hover:bg-white/70 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#14a67e]" />
                <span>24/7 Support</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-full hover:bg-white/70 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#14a67e]" />
                <span>ISO 27001 Certification</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center space-x-2 bg-white/50 px-4 py-2 rounded-full hover:bg-white/70 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#14a67e]" />
                <span>Global Community</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;


