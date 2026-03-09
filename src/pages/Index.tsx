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
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <Hero />
      <PipelineAnimation />
      <ProblemSection />
      <FeatureGrid />
      <MetricsBar />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
