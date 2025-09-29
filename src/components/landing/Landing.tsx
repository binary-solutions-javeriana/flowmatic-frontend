'use client';

import React from 'react';
import Nav from './Nav';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Benefits from './Benefits';
import Pricing from './Pricing';
import CTA from './CTA';
import Footer from './Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <About />
      <Features />
      <Benefits />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;


