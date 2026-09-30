import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import "./pixel.css"
import { Pulse } from "@/components/trace/pulse"
import { Grid } from "@/components/pixel/grid"
import { Dots } from "@/components/pixel/dots"
import { Prompt } from "@/components/pixel/prompt"
import { ME, PATH, PHASES, HISTORY, FOCUS, PROJECTS, EXPERIENCE, AWARD, EDUCATION, CERTS, BUILD } from "@/components/trace/content"

/* The terminal.

   The whole page is one shell session on the host this site runs on. Every section is a command
   and its output; the output is typed as you scroll, and the headline of each is drawn as a grid
   of characters. Behind it all, the network stands as boxes of box-drawing characters with the
   traffic walking along the lines between them — the same grid, the same glyphs. */

const TITLES = ["trace", "summary", "history", "core-focus", "project-1", "project-2", "project-3", "project-4", "project-5", "experience", "awards", "education", "certifications", "contact"]
const CMDS = ["", "cat summary.txt", "history --since 2024", "ls core-focus/", "", "", "", "", "", "cat experience.log", "cat awards", "cat education", "ls certs/", "contact --me"]
const pad = (n: number) => String(n).padStart(2, "0")

// a single line of output: typed left to right as the section comes into view
const Ln = ({ i, children, dim, className = "" }: { i: number; children: ReactNode; dim?: boolean; className?: string }) =>
    <p className={`px-ln ${dim ? "px-dim" : ""} ${className}`} style={{ "--i": i } as CSSProperties}>{children}</p>
// a block of output: revealed top to bottom
const Blk = ({ i, children, className = "" }: { i: number; children: ReactNode; className?: string }) =>
    <div className={`px-blk ${className}`} style={{ "--i": i } as CSSProperties}>{children}</div>

function Cmd({ n, id, cmd, children }: Readonly<{ n: number; id?: string; cmd: string; children: ReactNode }>) {
    return (
        <section className="px-hop" data-hop={n} data-title={TITLES[n]} id={id}>
            <div className="px-in">
                <p className="px-cmd" style={{ "--i": 0 } as CSSProperties}><i>$</i> {cmd}</p>
                {children}
            </div>
        </section>
    )
}

// how much of the degree has run, in blocks
function bar(start: string, end: string, width: number) {
    const [sy, sm] = start.split(".").map(Number), [ey, em] = end.split(".").map(Number)
    const now = new Date()
    const done = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm)
    const p = Math.min(1, Math.max(0, done / ((ey - sy) * 12 + (em - sm))))
    const n = Math.round(p * width)
    return { bar: "█".repeat(n) + "░".repeat(width - n), pct: Math.round(p * 100) }
}

export function PixelPage() {
    const edu = bar(EDUCATION.start, EDUCATION.end, 24)
    return (
        <div className="px-site">
            <Pulse />
            <Grid />
            <Prompt titles={TITLES} />
            <div className="px-crt" aria-hidden="true" />

            <main>
                {/* 00 — boot: the request reaches the host, then the name resolves */}
                <section className="px-hop px-open" data-hop={0} data-title="trace" id="top">
                    <div className="px-in">
                        <ol className="px-boot">
                            {PATH.map((p, i) => (
                                <li key={p.hop} style={{ "--i": i } as CSSProperties}>
                                    <span className="px-t">{String(i * 7 + 3).padStart(3, "0")}ms</span>
                                    <b>{p.hop}</b> {p.site.padEnd(9)} {p.host}{p.addr ? `  ${p.addr}` : ""} <i># {p.note}</i>
                                </li>
                            ))}
                        </ol>
                        <h1 className="px-name">
                            <Dots text={ME.name} cell={8} rows={15} weight={800} className="px-name-ko" delay={1100} />
                            <span className="px-name-la" style={{ "--i": 6 } as CSSProperties}>{ME.latin}</span>
                        </h1>
                        <p className="px-role" style={{ "--i": 7 } as CSSProperties}>{ME.role}</p>
                        <p className="px-cursor" aria-hidden="true"><i>$</i> <span /></p>
                    </div>
                </section>

                <Cmd n={1} cmd={CMDS[1]}>
                    <Blk i={1} className="px-say">{ME.statement}</Blk>
                    <Ln i={4} className="px-phase">{PHASES.map((p) => `[${p.toLowerCase()}]`).join("  ")}</Ln>
                </Cmd>

                <Cmd n={2} cmd={CMDS[2]}>
                    <Dots text="2024 → 2026" cell={5} rows={8} weight={800} className="px-head" />
                    <ul className="px-list">
                        {HISTORY.map((h, i) => (
                            <li key={h.text} className="px-ln" style={{ "--i": i + 2 } as CSSProperties}>
                                <span className="px-t">{h.date}</span>{h.text}
                            </li>
                        ))}
                    </ul>
                </Cmd>

                <Cmd n={3} cmd={CMDS[3]} id="skills">
                    <Dots text="Core Focus" cell={5} rows={8} weight={800} className="px-head" />
                    <div className="px-cols">
                        {FOCUS.map((c, ci) => (
                            <div key={c.name} className="px-col">
                                <Ln i={2 + ci * 5} className="px-dir">{c.name.toLowerCase()}/</Ln>
                                {c.items.map((it, i) => <Ln key={it} i={3 + ci * 5 + i}><span className="px-tree">{i === c.items.length - 1 ? "└─" : "├─"}</span>{it}</Ln>)}
                            </div>
                        ))}
                    </div>
                </Cmd>

                {PROJECTS.map((p, k) => (
                    <Cmd key={p.id} n={4 + k} cmd={`cat projects/${pad(k + 1)}-${p.id}.md`} id={k === 0 ? "projects" : undefined}>
                        <div className="px-proj">
                            <div className="px-proj-t">
                                <Ln i={1} dim># {p.kicker}</Ln>
                                {p.ko
                                    ? <Blk i={2} className="px-head-ko">{p.title}</Blk>
                                    : <Dots text={p.title} cell={4} rows={7} weight={800} className="px-head px-head--proj" />}
                                <Blk i={4} className="px-sum">{p.summary}</Blk>
                                <Ln i={7} dim>## decisions</Ln>
                                <ul className="px-dec">
                                    {p.decisions.map((d, i) => <li key={d} className="px-blk" style={{ "--i": 8 + i * 2 } as CSSProperties}>- {d}</li>)}
                                </ul>
                                <Ln i={14} dim>tags: {p.stack.map((s) => `#${s.replace(/\s+/g, "-").toLowerCase()}`).join(" ")}</Ln>
                                {p.links.length > 0 && (
                                    <Ln i={15} className="px-links">
                                        {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">[{l.label.toLowerCase()}]</a>)}
                                    </Ln>
                                )}
                            </div>
                            {p.image && (
                                <Blk i={3} className="px-shot">
                                    <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(min-width: 60rem) 44vw, 100vw" unoptimized />
                                    <span className="px-cap"># {p.image.src.split("/").pop()}</span>
                                </Blk>
                            )}
                        </div>
                    </Cmd>
                ))}

                <Cmd n={9} cmd={CMDS[9]} id="experience">
                    <Dots text="Experience" cell={5} rows={8} weight={800} className="px-head" />
                    <div className="px-exp">
                        {EXPERIENCE.map((e, k) => (
                            <article key={e.title}>
                                <Ln i={2 + k * 5} className="px-exp-h"><span className="px-t">{e.period}</span><b>{e.title}</b>{e.sub && <i> {e.sub}</i>} <em>— {e.role}</em></Ln>
                                {e.points.map((pt, i) => <Blk key={pt} i={3 + k * 5 + i}>- {pt}</Blk>)}
                            </article>
                        ))}
                    </div>
                </Cmd>

                <Cmd n={10} cmd={CMDS[10]} id="awards">
                    <Dots text={AWARD.grade} cell={7} rows={9} weight={800} className="px-head px-head--big" />
                    <Ln i={3}>{AWARD.name}</Ln>
                    <Ln i={4} dim>{AWARD.issuer} · {AWARD.date}</Ln>
                </Cmd>

                <Cmd n={11} cmd={CMDS[11]} id="education">
                    <Dots text={EDUCATION.school} cell={4} rows={7} weight={800} className="px-head px-head--proj" />
                    <Ln i={3}>{EDUCATION.major}</Ln>
                    <Ln i={4} dim>{EDUCATION.minor}</Ln>
                    <Ln i={5}>{EDUCATION.status}</Ln>
                    <Ln i={6} dim>{EDUCATION.grade}</Ln>
                    <Ln i={8} className="px-prog"><span className="px-t">{EDUCATION.start}</span>{edu.bar} {edu.pct}%<span className="px-t px-t--r">{EDUCATION.end}</span></Ln>
                </Cmd>

                <Cmd n={12} cmd={CMDS[12]} id="certifications">
                    <Dots text="Certifications" cell={5} rows={8} weight={800} className="px-head" />
                    <ul className="px-list">
                        {CERTS.map((c, i) => (
                            <li key={c.name} className="px-ln" style={{ "--i": i + 2 } as CSSProperties}><b>{c.name}</b><span className="px-dim">  {c.issuer}</span></li>
                        ))}
                    </ul>
                </Cmd>

                <Cmd n={13} cmd={CMDS[13]}>
                    <ul className="px-out">
                        {ME.links.map((l, i) => (
                            <li key={l.label} className="px-ln" style={{ "--i": i + 1 } as CSSProperties}>
                                <span className="px-t">{l.label.toLowerCase().padEnd(9)}</span>
                                <a href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">{l.href.replace(/^mailto:/, "").replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/%[0-9A-F]{2}/g, "").replace(/\/in\/.*$/, "/in/heishooni")}</a>
                            </li>
                        ))}
                    </ul>
                    <Ln i={7} dim className="px-build"># {BUILD}</Ln>
                    <p className="px-cursor px-cursor--end" aria-hidden="true"><i>$</i> <span /></p>
                </Cmd>
            </main>
        </div>
    )
}
