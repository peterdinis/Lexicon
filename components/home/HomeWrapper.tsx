"use client";

import { FC } from "react";
import Navigation from "../shared/Navigation";
import HeroWrapper from "./HeroWrapper";
import FeaturesWrapper from "./FeaturesWrapper";
import Footer from "../shared/Footer";
import StatsWrapper from "./StatsWrapper";
import CTAWrapper from "./CTAWrapper";

const HomeWrapper: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroWrapper />

      {/* Features Section */}
      <FeaturesWrapper />

      {/* Stats Section */}
      <StatsWrapper />

      {/* CTA Section */}
      <CTAWrapper />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomeWrapper;
