import React from 'react';
import { Award, Users, Globe, Target, Heart, Lightbulb, Shield, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Dr. María González',
      role: 'CEO & Fundadora',
      expertise: 'Gestión Educativa',
      avatar: 'MG',
      description: '15+ años en administración universitaria',
      background: 'from-[#14a67e] to-[#9fdbc2]'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      expertise: 'Arquitectura de Software',
      avatar: 'CR',
      description: 'Ex-Google, especialista en sistemas educativos',
      background: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Ana Martínez',
      role: 'Head of Education',
      expertise: 'Pedagogía Digital',
      avatar: 'AM',
      description: 'Doctora en Educación, consultora UNESCO',
      background: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Jorge Silva',
      role: 'Head of Security',
      expertise: 'Ciberseguridad Educativa',
      avatar: 'JS',
      description: 'Certificado CISSP, especialista en FERPA',
      background: 'from-orange-500 to-orange-600'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Pasión por la Educación',
      description: 'Creemos que la tecnología debe servir a la misión educativa, no complicarla.'
    },
    {
      icon: Shield,
      title: 'Seguridad Primero',
      description: 'La privacidad y seguridad de los datos académicos son nuestra máxima prioridad.'
    },
    {
      icon: Lightbulb,
      title: 'Innovación Constante',
      description: 'Desarrollamos soluciones que evolucionan con las necesidades educativas.'
    },
    {
      icon: Users,
      title: 'Colaboración Efectiva',
      description: 'Facilitamos la comunicación y trabajo en equipo en entornos académicos.'
    }
  ];

  const achievements = [
    {
      icon: Award,
      number: '500+',
      label: 'Instituciones Educativas',
      description: 'Universidades y colegios confían en nosotros'
    },
    {
      icon: Users,
      number: '50K+',
      label: 'Usuarios Activos',
      description: 'Estudiantes, profesores y administrativos'
    },
    {
      icon: Globe,
      number: '15+',
      label: 'Países',
      description: 'Presencia en Latinoamérica y España'
    },
    {
      icon: Target,
      number: '98%',
      label: 'Satisfacción',
      description: 'Índice de satisfacción del cliente'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#9fdbc2]/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-[#0c272d]">Quiénes Somos</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-3xl mx-auto">
            Somos un equipo apasionado por transformar la gestión de proyectos en instituciones educativas, 
            combinando experiencia académica con innovación tecnológica.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-[#0c272d]">Nuestra Historia</h3>
            <p className="text-[#0c272d]/70 text-lg leading-relaxed">
              Flowmatic nació en 2019 cuando un grupo de educadores y tecnólogos se unieron con una visión clara: 
              crear herramientas que realmente entiendan las necesidades únicas de las instituciones educativas.
            </p>
            <p className="text-[#0c272d]/70 text-lg leading-relaxed">
              Después de años trabajando en universidades y viendo las limitaciones de las soluciones genéricas, 
              decidimos construir una plataforma diseñada específicamente para el mundo académico.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#0c272d]">Misión</h4>
                <p className="text-[#0c272d]/60">Empoderar instituciones educativas con tecnología intuitiva y segura</p>
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
            <h3 className="text-3xl font-bold text-[#0c272d] mb-4">Nuestro Equipo</h3>
            <p className="text-xl text-[#0c272d]/70">
              Líderes con experiencia en educación, tecnología y gestión de proyectos
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

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0c272d] mb-4">Nuestros Valores</h3>
            <p className="text-xl text-[#0c272d]/70">
              Los principios que guían cada decisión y desarrollo en Flowmatic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#0c272d]">{value.title}</h4>
                  <p className="text-[#0c272d]/70 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#9fdbc2]/10 to-[#14a67e]/10 rounded-3xl p-12 text-center">
          <h3 className="text-3xl font-bold text-[#0c272d] mb-6">Nuestro Compromiso</h3>
          <p className="text-xl text-[#0c272d]/70 max-w-4xl mx-auto leading-relaxed mb-8">
            Nos comprometemos a seguir innovando y mejorando nuestras soluciones, 
            siempre escuchando a nuestra comunidad educativa y adaptándonos a sus necesidades cambiantes. 
            La educación es el futuro, y estamos aquí para impulsarla con la mejor tecnología.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#0c272d]/60">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#14a67e]" />
              <span>Cumplimiento FERPA</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#14a67e]" />
              <span>Soporte 24/7</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#14a67e]" />
              <span>Certificación ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#14a67e]" />
              <span>Comunidad Global</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;


