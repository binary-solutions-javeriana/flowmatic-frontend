'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const Testimonials: React.FC = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const testimonials = [
    {
      name: 'Dr. María González',
      role: 'Dean of Engineering',
      institution: 'Universidad Nacional',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      quote: 'Flowmatic has transformed how we manage research projects across our departments. The SSO integration was seamless and our faculty adoption rate exceeded 95% in the first month.',
      rating: 5
    },
    {
      name: 'Prof. Carlos Ramírez',
      role: 'IT Director',
      institution: 'Pontificia Universidad',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      quote: 'The analytics and reporting features have given us unprecedented visibility into project progress. We\'ve reduced project delays by 40% since implementation.',
      rating: 5
    },
    {
      name: 'Dra. Ana Martínez',
      role: 'Research Coordinator',
      institution: 'Universidad de los Andes',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      quote: 'Managing multi-campus research initiatives used to be a nightmare. Flowmatic\'s centralized platform has streamlined our entire workflow and improved collaboration.',
      rating: 5
    },
    {
      name: 'Prof. Roberto Silva',
      role: 'Academic Vice President',
      institution: 'EAFIT University',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      quote: 'The support panel and incident management features are game-changers. Our IT team can now respond to issues 3x faster with better tracking.',
      rating: 5
    },
    {
      name: 'Dra. Patricia Rojas',
      role: 'Department Head',
      institution: 'Universidad Javeriana',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      quote: 'Excellent platform for academic project management. The Kanban and Gantt views help our students understand project planning in a practical, visual way.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#9fdbc2]/5 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold text-[#0c272d]">Trusted by Leading Institutions</h2>
          <p className="text-xl text-[#0c272d]/70 max-w-2xl mx-auto">
            See what academic leaders are saying about Flowmatic
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-[#9fdbc2]/20 hover:border-[#14a67e]/30 transition-all duration-500 hover:shadow-2xl h-full group"
                  >
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#14a67e] text-[#14a67e]" />
                      ))}
                    </div>

                    <Quote className="w-10 h-10 text-[#9fdbc2] mb-4 group-hover:text-[#14a67e] transition-colors" />
                    
                    <p className="text-[#0c272d]/80 mb-6 leading-relaxed italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    <div className="flex items-center space-x-4 mt-auto">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-[#9fdbc2]/30 group-hover:ring-[#14a67e]/50 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#14a67e] rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#0c272d]">{testimonial.name}</div>
                        <div className="text-sm text-[#0c272d]/60">{testimonial.role}</div>
                        <div className="text-sm text-[#14a67e] font-medium">{testimonial.institution}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient overlays for carousel effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
        >
          {[
            { value: '500+', label: 'Universities' },
            { value: '50K+', label: 'Active Users' },
            { value: '98%', label: 'Satisfaction' },
            { value: '24/7', label: 'Support' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center space-y-2"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-[#14a67e] to-[#9fdbc2] bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-[#0c272d]/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

