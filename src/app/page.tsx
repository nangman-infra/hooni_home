"use client"

import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { LightField } from "@/components/light-field";
import { Scene } from "@/components/scene";
import { Spine } from "@/components/spine";
import { Summary } from "@/components/summary";
import { History } from "@/components/history";
import { TechStack } from "@/components/tech-stack";
import { ProjectScene, projectCount } from "@/components/projects";
import { Experience } from "@/components/experience";
import { Awards } from "@/components/awards";
import { Education } from "@/components/education";
import { Certifications } from "@/components/certifications";
import { Footer } from "@/components/footer";

// One full-screen scene per section; projects get one scene each.
const scenes: { id?: string; title: string; node: React.ReactNode }[] = [
  { title: "Summary", node: <Summary /> },
  { title: "History", node: <History /> },
  { id: "skills", title: "Core Focus", node: <TechStack /> },
  ...Array.from({ length: projectCount }, (_, i) => ({ id: i === 0 ? "projects" : undefined, title: `Project ${i + 1}`, node: <ProjectScene index={i} /> })),
  { id: "experience", title: "Experience", node: <Experience /> },
  { id: "awards", title: "Awards", node: <Awards /> },
  { id: "education", title: "Education", node: <Education /> },
  { id: "certifications", title: "Certifications", node: <Certifications /> },
  { title: "Contact", node: <Footer /> },
]

export default function Home() {
  return (
    // Hero is fixed behind; the scenes slide over it (mt-[100vh]). Below 1024px the hero flows normally.
    <main className="relative bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      <Nav />
      <div className="fixed inset-0 h-screen w-full z-0 max-lg:relative max-lg:inset-auto max-lg:h-auto">
        <Hero />
      </div>
      <div id="resume" className="relative z-10 w-full mt-[100vh] max-lg:mt-0 scroll-mt-20 bg-background shadow-[0_-30px_80px_-40px_var(--lift)] max-lg:shadow-none">
        {/* the same ground of light the hero stands on, carried under the whole resume */}
        <div className="fixed inset-0 z-0 pointer-events-none"><LightField calm /></div>
        {scenes.map((s, i) => (
          <Scene key={i} id={s.id} title={s.title}>{s.node}</Scene>
        ))}
      </div>
      <Spine />
    </main>
  );
}
