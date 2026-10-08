import Image from "next/image"
import type { ComponentType, CSSProperties, ReactNode } from "react"
import { Globe, Mail } from "lucide-react"
import "../particle/particle.css"
import "./morph.css"
import { Pulse } from "@/components/trace/pulse"
import { Morph } from "@/components/morph/morph"
import { Fig } from "@/components/particle/fig"
import { HybridScene } from "@/components/hybrid-scene"
import { LabScene } from "@/components/lab-scene"
import { StreamScene } from "@/components/stream-scene"
import { GitHubBrandIcon, LinkedInBrandIcon, BlogIcon } from "@/components/icons"
import { ME, PHASES, HISTORY, FOCUS, PROJECTS, EXPERIENCE, AWARD, EDUCATION, CERTS, BUILD } from "@/components/trace/content"

/* Words on the left, one figure on the right.

   Every section is the same two things: a short column of type, and a room beside it that the
   grains fill with that section's figure — or, for a project, its drawing or its picture, which the
   grains frame. Nothing sits behind the type. The type system is the particle site's (particle.css);
   morph.css only lays it out. */

const TITLES = ["", "Summary", "History", "Core Focus", "Project 1", "Project 2", "Project 3", "Project 4", "Project 5", "Experience", "Awards", "Education", "Certifications", "Contact"]
const pad = (n: number) => String(n).padStart(2, "0")
const ICON: Record<string, ReactNode> = { GitHub: <GitHubBrandIcon />, LinkedIn: <LinkedInBrandIcon />, Blog: <BlogIcon />, Email: <Mail aria-hidden="true" />, Repo: <GitHubBrandIcon />, Live: <Globe aria-hidden="true" /> }
const DRAWN: Record<string, ComponentType> = { "nangman-hybrid-network": HybridScene, "personal-workspace-lab": LabScene, "ai-tcp-udp-streaming": StreamScene }
const SAY = ME.statement.split(/(?<=구축하고)\s/)

const L = ({ i, children, className = "" }: { i: number; children: ReactNode; className?: string }) =>
    <div className={`pa-l ${className}`} style={{ "--i": i } as CSSProperties}>{children}</div>

const Ways = ({ big, from = 0 }: { big?: boolean; from?: number }) => (
    <nav className={`pa-ways ${big ? "pa-ways--big" : ""}`} aria-label="Links">
        {ME.links.map((l, i) => (
            <a key={l.label} className="pa-way pa-l" style={{ "--i": from + i * 1.2 } as CSSProperties} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={l.label} title={l.label}>
                {ICON[l.label]}
            </a>
        ))}
    </nav>
)

function Stop({ n, media, children }: Readonly<{ n: number; media?: ReactNode; children: ReactNode }>) {
    return (
        <section className="pa-hop mo-hop" data-hop={n} data-title={TITLES[n]} id={`s-${n}`}>
            <div className="pa-in">
                <L i={0} className="pa-tag"><span>{pad(n)}</span><i /><span>{TITLES[n]}</span></L>
                {children}
            </div>
            <div className={media ? "mo-stage mo-stage--media" : "mo-stage"} aria-hidden={media ? undefined : true}>{media}</div>
        </section>
    )
}

function progress(start: string, end: string) {
    const [sy, sm] = start.split(".").map(Number), [ey, em] = end.split(".").map(Number)
    const now = new Date()
    const done = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm)
    return Math.min(1, Math.max(0, done / ((ey - sy) * 12 + (em - sm))))
}

export function MorphPage() {
    return (
        <div className="pa-site mo-site">
            <Pulse />
            <Morph progress={progress(EDUCATION.start, EDUCATION.end)} />
            <nav className="mo-idx" aria-label="Sections">
                {TITLES.map((title, i) => <a key={i} href={`#s-${i}`} data-k={i} aria-label={title || ME.name} title={title || ME.name}><i /></a>)}
            </nav>

            <main>
                <section className="pa-hop mo-hop mo-mid pa-open" data-hop={0} data-title="" id="s-0">
                    <div className="mo-stage mo-stage--top" aria-hidden="true" />
                    <div className="pa-in">
                        <h1 className="mo-name pa-l" style={{ "--i": 0 } as CSSProperties}>{ME.latin}</h1>
                        <p className="pa-role" style={{ "--i": 1 } as CSSProperties}>{ME.role}</p>
                        <Ways from={2} />
                    </div>
                    <p className="pa-cue" style={{ "--i": 7 } as CSSProperties} aria-hidden="true"><i /></p>
                </section>

                <Stop n={1}>
                    <L i={1}><p className="pa-say">{SAY.map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</p></L>
                    <L i={3}><p className="pa-phase">{PHASES.map((p, i) => <span key={p}>{i > 0 && <i />}{p}</span>)}</p></L>
                </Stop>

                <Stop n={2}>
                    <ol className="pa-hist">
                        {HISTORY.map((h, i) => (
                            <li key={h.text} className="pa-l" style={{ "--i": i + 1 } as CSSProperties}><span className="pa-when">{h.date}</span><span>{h.text}</span></li>
                        ))}
                    </ol>
                </Stop>

                <Stop n={3}>
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
                    const media = Drawn
                        ? <Fig><Drawn /></Fig>
                        : p.image && <div className="pa-shot"><Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(min-width: 60rem) 40rem, 100vw" unoptimized /></div>
                    return (
                        <Stop key={p.id} n={4 + k} media={media}>
                            <L i={1}><p className="pa-kicker">{p.kicker}</p></L>
                            <L i={2}><h2 className={p.ko ? "pa-head pa-head--ko" : "pa-head"}>{p.title}</h2></L>
                            <L i={4}><p className="pa-sum">{p.summary}</p></L>
                            <ul className="pa-dec">{p.decisions.map((d, i) => <li key={d} className="pa-l" style={{ "--i": 6 + i * 1.5 } as CSSProperties}>{d}</li>)}</ul>
                            <L i={11}><p className="pa-stack">{p.stack.join("  ·  ")}</p></L>
                            {p.links.length > 0 && <L i={12}><p className="pa-links">{p.links.map((l) => <a key={l.href} className="pa-way" href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title}: ${l.label}`} title={l.label}>{ICON[l.label]}</a>)}</p></L>}
                        </Stop>
                    )
                })}

                <Stop n={9}>
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

                <Stop n={10}>
                    <L i={1}><p className="pa-grade">{AWARD.grade}</p></L>
                    <L i={3}><p className="pa-award">{AWARD.name}</p></L>
                    <L i={4}><p className="pa-when">{AWARD.issuer} · {AWARD.date}</p></L>
                </Stop>

                <Stop n={11}>
                    <L i={1}><h2 className="pa-head pa-head--tight">{EDUCATION.school}</h2></L>
                    <L i={3}><p className="pa-edu-m">{EDUCATION.major}</p><p className="pa-edu-s">{EDUCATION.minor}</p></L>
                    <L i={4}><p className="pa-edu-st">{EDUCATION.status}</p><p className="pa-when">{EDUCATION.grade}</p></L>
                </Stop>

                <Stop n={12}>
                    <L i={1}><h2 className="pa-head">Certifications</h2></L>
                    <ul className="pa-certs">{CERTS.map((c, i) => <li key={c.name} className="pa-l" style={{ "--i": 2 + i * 1.5 } as CSSProperties}><span>{c.name}</span><em>{c.issuer}</em></li>)}</ul>
                </Stop>

                <section className="pa-hop mo-hop mo-mid mo-last" data-hop={13} data-title="Contact" id="s-13">
                    <div className="pa-in">
                        <L i={0} className="pa-tag"><span>13</span><i /><span>Contact</span></L>
                        <Ways big from={1} />
                    </div>
                    <div className="mo-stage mo-stage--end" aria-hidden="true" />
                    <L i={8}><p className="pa-build">{BUILD}</p></L>
                </section>
            </main>
        </div>
    )
}
