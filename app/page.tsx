import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import Footer from "@/components/shared/Footer";
import Navigation from "@/components/shared/Navigation";
import { NextPage } from "next";

const Homepage: NextPage = () => {
  return (
    <div className="h-full pt-32">
      <Navigation />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Homepage;
