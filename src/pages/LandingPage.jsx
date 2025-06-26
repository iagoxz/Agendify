
import React from 'react';

import HeroSection from '../components/landingPage/HeroSection';
import FeatureSection from '../components/landingPage/FeatureSection';
import BenefitsSection from '../components/landingPage/BenefitsSection';
import TestimonialsSection from '../components/landingPage/TestemonialsSection';
import CtaSection from '../components/landingPage/CtaSection';

function LandingPage() {
  return (
    <> 
      <HeroSection />
      <FeatureSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

export default LandingPage;