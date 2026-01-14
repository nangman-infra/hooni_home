import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/domains/home/components/HeroSection";
import { AboutSection } from "@/domains/home/components/AboutSection";
import { FeatureSection } from "@/domains/home/components/FeatureSection";
import { BlogSection } from "@/domains/home/components/BlogSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <BlogSection />
      <FeatureSection />
      <AboutSection />
      <Footer />
    </>
  );
}
