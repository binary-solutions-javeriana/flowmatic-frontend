import React from 'react';
import { Award, Users, Globe, Target, Heart, Lightbulb, Shield, BookOpen } from 'lucide-react';

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
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#9fdbc2]/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-[#0c272d]">About Us</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-3xl mx-auto">
            We are a team passionate about transforming project management in educational institutions, 
            combining academic experience with technological innovation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-[#0c272d]">Our Story</h3>
            <p className="text-[#0c272d]/70 text-lg leading-relaxed">
              Flowmatic was born in 2025 when a group of educators and technologists came together with a clear vision: 
              to create tools that truly understand the unique needs of educational institutions.
            </p>
            <p className="text-[#0c272d]/70 text-lg leading-relaxed">
              After years of working in universities and seeing the limitations of generic solutions, 
              we decided to build a platform designed specifically for the academic world.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0c272d]">Mission</h4>
                <p className="text-[#0c272d]/60">Empower educational institutions with intuitive and secure technology</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#9fdbc2]/20 to-[#14a67e]/10 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={index} className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center mx-auto">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-[#0c272d]">{achievement.number}</div>
                      <div className="text-sm font-medium text-[#0c272d]">{achievement.label}</div>
                      <div className="text-xs text-[#0c272d]/60">{achievement.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0c272d] mb-4">Our Team</h3>
            <p className="text-xl text-[#0c272d]/70">
              Leaders with experience in education, technology and project management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 text-center space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${member.background} flex items-center justify-center text-white text-xl font-bold`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#0c272d]">{member.name}</h4>
                    <p className="text-[#14a67e] font-medium text-sm">{member.role}</p>
                    <p className="text-[#0c272d]/60 text-sm mt-1">{member.expertise}</p>
                  </div>
                  <p className="text-[#0c272d]/70 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        

        <div className="bg-gradient-to-r from-[#9fdbc2]/10 to-[#14a67e]/10 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-bold text-[#0c272d] mb-6">Our Commitment</h3>
          <p className="text-xl text-[#0c272d]/70 max-w-4xl mx-auto leading-relaxed mb-8">
            We are committed to continuing to innovate and improve our solutions, 
            always listening to our educational community and adapting to their changing needs. 
            Education is the future, and we are here to drive it forward with the best technology.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#0c272d]/60">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#14a67e]" />
              <span>FERPA Compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#14a67e]" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#14a67e]" />
              <span>ISO 27001 Certification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#14a67e]" />
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;


