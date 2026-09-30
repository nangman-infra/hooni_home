import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import { Mail } from "lucide-react"
import "./ascii.css"
import { Pulse } from "@/components/trace/pulse"
import { Figure } from "@/components/ascii/figure"
import type { ShapeName } from "@/components/ascii/shapes"
import { GitHubBrandIcon, LinkedInBrandIcon, BlogIcon } from "@/components/icons"
import { ME, PHASES, HISTORY, FOCUS, PROJECTS, EXPERIENCE, AWARD, EDUCATION, CERTS, BUILD } from "@/components/trace/content"

/* Fourteen posters, one per section, all on one spine: a small pill naming the section, one large
   serif line, a figure drawn in characters, and a caption or two beneath. The figure is the only
   thing that changes shape from section to section; everything else keeps still. */

const TITLES = ["", "Summary", "History", "Core Focus", "Project 1", "Project 2", "Project 3", "Project 4", "Project 5", "Experience", "Awards", "Education", "Certifications", "Contact"]
const SHAPE: ShapeName[] = ["wave", "sphere", "ring", "orbits", "topology", "arcs", "globe", "cube", "stream", "stack", "burst", "gate", "tiles", "ripple"]
const pad = (n: number) => String(n).padStart(2, "0")
const ICON: Record<string, ReactNode> = { GitHub: <GitHubBrandIcon />, LinkedIn: <LinkedInBrandIcon />, Blog: <BlogIcon />, Email: <Mail aria-hidden="true" /> }

const Ways = ({ big }: { big?: boolean }) => (
    <nav className={`as-ways ${big ? "as-ways--big" : ""}`} aria-label="Links">
        {ME.links.map((l) => (
            <a key={l.label} className="as-way" href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={l.label} title={l.label}>{ICON[l.label]}</a>
        ))}
    </nav>
)

function Stop({ n, id, pill, head, ko, cols = 2, children }: Readonly<{ n: number; id?: string; pill?: string; head: ReactNode; ko?: boolean; cols?: 1 | 2 | 3; children: ReactNode }>) {
    return (
        <section className="as-hop" data-hop={n} data-title={TITLES[n]} id={id}>
            <div className="as-in">
                <span className="as-pill as-l" style={{ "--i": 0 } as CSSProperties}>{pill ?? `${pad(n)} — ${TITLES[n]}`}</span>
                <h2 className={`as-h ${ko ? "as-h--ko" : ""} as-l`} style={{ "--i": 1 } as CSSProperties}>{head}</h2>
                <div className="as-figwrap as-l" style={{ "--i": 2 } as CSSProperties}><Figure shape={SHAPE[n]} from={SHAPE[n - 1]} label={`${TITLES[n]} figure`} /></div>
                <div className={`as-foot as-foot--${cols} as-l`} style={{ "--i": 3 } as CSSProperties}>{children}</div>
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

export function AsciiPage() {
    const edu = Math.round(progress(EDUCATION.start, EDUCATION.end) * 100)
    return (
        <div className="as-site">
            <Pulse />
            <div className="as-guides" aria-hidden="true" />
            <header className="as-top" aria-hidden="true"><span>{ME.name}</span><span>{ME.role}</span></header>

            <main>
                <section className="as-hop as-open" data-hop={0} data-title="" id="top">
                    <div className="as-in">
                        <span className="as-pill as-l" style={{ "--i": 0 } as CSSProperties}>{ME.role}</span>
                        <h1 className="as-h as-h--ko as-l" style={{ "--i": 1 } as CSSProperties}>{ME.name}<span className="as-sub">{ME.latin}</span></h1>
                        <div className="as-figwrap as-l" style={{ "--i": 2 } as CSSProperties}><Figure shape="wave" label="opening figure" /></div>
                        <div className="as-foot as-foot--2 as-l" style={{ "--i": 3 } as CSSProperties}>
                            <p className="as-ko">{ME.statement}</p>
                            <div className="as-right"><Ways /></div>
                        </div>
                    </div>
                </section>

                <Stop n={1} head={<>Design.<br />Build. Operate.</>}>
                    <p className="as-ko as-lead">{ME.statement}</p>
                    <p className="as-mono as-right">{PHASES.join("  ·  ")}</p>
                </Stop>

                <Stop n={2} head={<>2024 — 2026</>}>
                    <ul className="as-list">{HISTORY.slice(0, 4).map((h) => <li key={h.text}><span className="as-mono">{h.date}</span><span className="as-ko">{h.text}</span></li>)}</ul>
                    <ul className="as-list">{HISTORY.slice(4).map((h) => <li key={h.text}><span className="as-mono">{h.date}</span><span className="as-ko">{h.text}</span></li>)}</ul>
                </Stop>

                <Stop n={3} id="skills" head="Core Focus" cols={3}>
                    {FOCUS.map((c) => (
                        <div key={c.name}><p className="as-mono as-cap">{c.name}</p><ul className="as-plain">{c.items.map((it) => <li key={it}>{it}</li>)}</ul></div>
                    ))}
                </Stop>

                {PROJECTS.map((p, k) => (
                    <Stop key={p.id} n={4 + k} id={k === 0 ? "projects" : undefined} pill={p.kicker} head={p.title} ko={p.ko}>
                        <p className="as-ko as-lead">{p.summary}</p>
                        <ul className="as-plain as-ko">{p.decisions.map((d) => <li key={d}>{d}</li>)}</ul>
                        <p className="as-mono as-span">{p.stack.join("  ·  ")}{p.links.map((l) => <a key={l.href} className="as-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}</p>
                        {p.image && <div className="as-shot as-span"><Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(min-width: 60rem) 36rem, 100vw" unoptimized /></div>}
                    </Stop>
                ))}

                <Stop n={9} id="experience" head="Experience" cols={1}>
                    {EXPERIENCE.map((e) => (
                        <article key={e.title} className="as-exp">
                            <p className="as-mono">{e.period}</p>
                            <div>
                                <h3>{e.title}{e.sub && <em>{e.sub}</em>} <span className="as-mono">{e.role}</span></h3>
                                <ul className="as-plain as-ko">{e.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                            </div>
                        </article>
                    ))}
                </Stop>

                <Stop n={10} id="awards" head={AWARD.grade} ko>
                    <p className="as-ko as-lead">{AWARD.name}</p>
                    <p className="as-mono as-right">{AWARD.issuer} · {AWARD.date}</p>
                </Stop>

                <Stop n={11} id="education" head={EDUCATION.school}>
                    <div><p className="as-lead">{EDUCATION.major}</p><p>{EDUCATION.minor}</p><p className="as-strong">{EDUCATION.status}</p><p className="as-mono">{EDUCATION.grade}</p></div>
                    <div className="as-bar"><i style={{ "--p": `${edu}%` } as CSSProperties} /><p className="as-mono as-between"><span>{EDUCATION.start}</span><span>{edu}%</span><span>{EDUCATION.end}</span></p></div>
                </Stop>

                <Stop n={12} id="certifications" head="Certifications" cols={3}>
                    {CERTS.map((c) => <div key={c.name}><p className="as-strong">{c.name}</p><p className="as-mono as-cap">{c.issuer}</p></div>)}
                </Stop>

                <Stop n={13} head="Contact" cols={1}>
                    <div className="as-center"><Ways big /><p className="as-mono">{ME.email}</p><p className="as-mono as-cap">{BUILD}</p></div>
                </Stop>
            </main>
        </div>
    )
}
