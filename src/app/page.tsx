"use client"

import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Summary } from "@/components/summary";
import { History } from "@/components/history";
import { TechStack } from "@/components/tech-stack";
import { Projects } from "@/components/projects";
import { Experience } from "@/components/experience";
import { Awards } from "@/components/awards";
import { Education } from "@/components/education";
import { Certifications } from "@/components/certifications";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    // MAIN: Standard Relative Flow
    // Hero is FIXED (in its component or here).
    // Resume has MARGIN-TOP to start below the hero.
    // min-h-[200vh] ensures there is enough scroll space for the transition.
    <main className="relative bg-background text-foreground antialiased selection:bg-foreground selection:text-background min-h-[200vh]">
      <Nav />

      {/* 
        1. Hero Section (Fixed Background)
        - Needs to be fixed to stay behind.
        - inset-0 ensures it covers the viewport.
        - z-0 to sit behind the resume.
      */}
      <div className="fixed inset-0 h-screen w-full z-0">
        <Hero />
      </div>

      {/* 
        2. Resume Content (Slides Over)
        - margin-top-[100vh] ensures it starts exactly below the fold
        - z-10 to slide OVER the hero
        - bg-background to cover it
        - shadow to create depth separation
      */}
      <div id="experience" className="relative z-10 bg-background w-full mt-[100vh] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-0 mb-0">
        <div className="bg-background">

          <Summary />
          <History />
          <TechStack />
          <Projects />
          <Experience />
          <Awards />
          <Education />
          <Certifications />
        </div>

        {/* Footer in its own solid container to cover bottom */}
        {/* Extended padding-bottom ensures overscroll doesn't reveal hero */}
        <div className="bg-background relative z-20">
          <Footer />
        </div>
      </div>
    </main>
  );
}
