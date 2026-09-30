import Image from "next/image"
import type { ComponentType, CSSProperties, ReactNode } from "react"
import { Globe, Mail } from "lucide-react"
import "./particle.css"
import { Pulse } from "@/components/trace/pulse"
import { Organism } from "@/components/particle/organism"
import { Fig } from "@/components/particle/fig"
import { HybridScene } from "@/components/hybrid-scene"
import { LabScene } from "@/components/lab-scene"
import { StreamScene } from "@/components/stream-scene"
import { GitHubBrandIcon, LinkedInBrandIcon, BlogIcon } from "@/components/icons"
import { ME, PHASES, HISTORY, FOCUS, PROJECTS, EXPERIENCE, AWARD, EDUCATION, CERTS, BUILD } from "@/components/trace/content"

/* The organism.

   The picture is a cloud of particles the camera moves through; the words stand on the centre
   line in front of it, set like a caption beside a print — small, light, with room around them.
   Every section is centred on the same axis, so the page reads as one column with the field
   passing behind it. */

const TITLES = ["", "Summary", "History", "Core Focus", "Project 1", "Project 2", "Project 3", "Project 4", "Project 5", "Experience", "Awards", "Education", "Certifications", "Contact"]
const pad = (n: number) => String(n).padStart(2, "0")
const ICON: Record<string, ReactNode> = { GitHub: <GitHubBrandIcon />, LinkedIn: <LinkedInBrandIcon />, Blog: <BlogIcon />, Email: <Mail aria-hidden="true" />, Repo: <GitHubBrandIcon />, Live: <Globe aria-hidden="true" /> }
// the projects that are drawn rather than photographed: the glass diagrams, with their packets
const DRAWN: Record<string, ComponentType> = { "nangman-hybrid-network": HybridScene, "personal-workspace-lab": LabScene, "ai-tcp-udp-streaming": StreamScene }
// the statement is set in two lines, broken after "구축하고"
const SAY = ME.statement.split(/(?<=구축하고)\s/)

const L = ({ i, children, className = "" }: { i: number; children: ReactNode; className?: string }) =>
    <div className={`pa-l ${className}`} style={{ "--i": i } as CSSProperties}>{children}</div>

// the four ways out, as marks: small under the name, large at the end
const Ways = ({ big, from = 0 }: { big?: boolean; from?: number }) => (
    <nav className={`pa-ways ${big ? "pa-ways--big" : ""}`} aria-label="Links">
        {ME.links.map((l, i) => (
            <a key={l.label} className="pa-way pa-l" style={{ "--i": from + i * 1.2 } as CSSProperties} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={l.label} title={l.label}>
                {ICON[l.label]}
            </a>
        ))}
    </nav>
)

function Stop({ n, id, className = "", children }: Readonly<{ n: number; id?: string; className?: string; children: ReactNode }>) {
    return (
        <section className={`pa-hop ${className}`} data-hop={n} data-title={TITLES[n]} id={id}>
            <div className="pa-in">
                <L i={0} className="pa-tag"><span>{pad(n)}</span><i /><span>{TITLES[n]}</span></L>
                {children}
            </div>
        </section>
    )
}

function progress(start: string, end: string) {
    const [sy, sm] = start.split(".").map(Number), [ey, em] = end.split(".").map(Number)
    const now = new Date()
    const done = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm)
    return Math.min(1, Math.max(0, done / ((ey - sy) * 12 + (em - sm))))
}

export function ParticlePage() {
    return (
        <div className="pa-site">
            <Pulse />
            <Organism />
            <header className="pa-top" aria-hidden="true"><span>{ME.name}</span><span>{ME.role}</span></header>

            <main>
                <section className="pa-hop pa-open" data-hop={0} data-title="" id="top">
                    <div className="pa-in">
                        <h1 className="pa-name">
                            <span className="pa-ko" style={{ "--i": 0 } as CSSProperties}>{ME.name}</span>
                            <span className="pa-la" style={{ "--i": 1 } as CSSProperties}>{ME.latin}</span>
                        </h1>
                        <p className="pa-role" style={{ "--i": 2 } as CSSProperties}>{ME.role}</p>
                        <Ways from={3} />
                        <p className="pa-cue" style={{ "--i": 8 } as CSSProperties} aria-hidden="true"><i /></p>
                    </div>
                </section>

                <Stop n={1}>
                    <L i={1}><p className="pa-say">{SAY.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</p></L>
                    <L i={3}><p className="pa-phase">{PHASES.map((p, i) => <span key={p}>{i > 0 && <i />}{p}</span>)}</p></L>
                </Stop>

                <Stop n={2}>
                    <ol className="pa-hist">
                        {HISTORY.map((h, i) => (
                            <li key={h.text} className="pa-l" style={{ "--i": i + 2 } as CSSProperties}><span className="pa-when">{h.date}</span><span>{h.text}</span></li>
                        ))}
                    </ol>
                </Stop>

                <Stop n={3} id="skills">
                    <L i={1}><h2 className="pa-head">Core Focus</h2></L>
                    <div className="pa-cols">
                        {FOCUS.map((c, ci) => (
                            <div key={c.name} className="pa-col">
                                <L i={2 + ci}><h3>{c.name}</h3></L>
                                <ul>{c.items.map((it, i) => <li key={it} className="pa-l" style={{ "--i": 3 + ci + i * 1.5 } as CSSProperties}>{it}</li>)}</ul>
                            </div>
                        ))}
                    </div>
                </Stop>

                {PROJECTS.map((p, k) => {
                    const Drawn = DRAWN[p.id]
                    return (
                    <Stop key={p.id} n={4 + k} id={k === 0 ? "projects" : undefined}>
                        <L i={1}><p className="pa-kicker">{p.kicker}</p></L>
                        <L i={2}><h2 className={p.ko ? "pa-head pa-head--ko" : "pa-head"}>{p.title}</h2></L>
                        {p.image && (
                            <L i={3} className="pa-shot"><Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(min-width: 60rem) 44rem, 100vw" unoptimized /></L>
                        )}
                        {Drawn && <Fig><Drawn /></Fig>}
                        <L i={4}><p className="pa-sum">{p.summary}</p></L>
                        <ul className="pa-dec">{p.decisions.map((d, i) => <li key={d} className="pa-l" style={{ "--i": 6 + i * 1.5 } as CSSProperties}>{d}</li>)}</ul>
                        <L i={11}><p className="pa-stack">{p.stack.join("  ·  ")}</p></L>
                        {p.links.length > 0 && <L i={12}><p className="pa-links">{p.links.map((l) => <a key={l.href} className="pa-way" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title}: ${l.label}`} title={l.label}>{ICON[l.label]}</a>)}</p></L>}
                    </Stop>
                    )
                })}

                <Stop n={9} id="experience">
                    <L i={1}><h2 className="pa-head">Experience</h2></L>
                    <div className="pa-exp">
                        {EXPERIENCE.map((e, k) => (
                            <article key={e.title} className="pa-l" style={{ "--i": 2 + k * 2.5 } as CSSProperties}>
                                <p className="pa-when">{e.period}</p>
                                <h3>{e.title}{e.sub && <em>{e.sub}</em>}</h3>
                                <p className="pa-role-s">{e.role}</p>
                                <ul>{e.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                            </article>
                        ))}
                    </div>
                </Stop>

                <Stop n={10} id="awards">
                    <L i={1}><p className="pa-grade">{AWARD.grade}</p></L>
                    <L i={3}><p className="pa-award">{AWARD.name}</p></L>
                    <L i={4}><p className="pa-when">{AWARD.issuer} · {AWARD.date}</p></L>
                </Stop>

                <Stop n={11} id="education">
                    <L i={1}><h2 className="pa-head pa-head--tight">{EDUCATION.school}</h2></L>
                    <L i={3}><p className="pa-edu-m">{EDUCATION.major}</p><p className="pa-edu-s">{EDUCATION.minor}</p></L>
                    <L i={4}><p className="pa-edu-st">{EDUCATION.status}</p><p className="pa-when">{EDUCATION.grade}</p></L>
                    <L i={6} className="pa-bar"><i style={{ "--p": `${Math.round(progress(EDUCATION.start, EDUCATION.end) * 100)}%` } as CSSProperties} /></L>
                    <L i={7}><p className="pa-when pa-when--split"><span>{EDUCATION.start}</span><span>{EDUCATION.end}, expected</span></p></L>
                </Stop>

                <Stop n={12} id="certifications">
                    <L i={1}><h2 className="pa-head">Certifications</h2></L>
                    <ul className="pa-certs">{CERTS.map((c, i) => <li key={c.name} className="pa-l" style={{ "--i": 2 + i * 1.5 } as CSSProperties}><span>{c.name}</span><em>{c.issuer}</em></li>)}</ul>
                </Stop>

                <Stop n={13}>
                    <Ways big from={1} />
                    <L i={7}><p className="pa-mail">{ME.email}</p></L>
                    <L i={8}><p className="pa-build">{BUILD}</p></L>
                </Stop>
            </main>
        </div>
    )
}
