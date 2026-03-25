"use client";

import CTASection from "./CTASection";
import FeatureCardsSection from "./FeatureCardsSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import IntegrationsSection from "./IntegrationsSection";
import WhySection from "./WhySection";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSection />
      <FeatureCardsSection />
      <WhySection />
      <HowItWorksSection />
      <IntegrationsSection />
      <CTASection />
    </div>
  );
}