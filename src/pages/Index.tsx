// src/pages/Index.tsx
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import PipelineAnimation from "@/components/landing/PipelineAnimation";
import ProblemSection from "@/components/landing/ProblemSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import MetricsBar from "@/components/landing/MetricsBar";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-canvas font-satoshi scroll-smooth">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Added ID for the "Solutions" navbar link to scroll to */}
        <section id="solutions">
          <PipelineAnimation />
          <ProblemSection />
        </section>

        {/* Added ID for the "Features" navbar link to scroll to */}
        <section id="features">
          <FeatureGrid />
          <MetricsBar />
        </section>

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;