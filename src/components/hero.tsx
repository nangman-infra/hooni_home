"use client"

import "./hero.css"
import Link from "next/link"
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react"
import { ArrowDown, Mail } from "lucide-react"
import { GitHubBrandIcon, LinkedInBrandIcon, BlogIcon } from "@/components/icons"
import { Topology, TopologyMobile, TOPO_ASPECT } from "@/components/topology"
import { LightField } from "@/components/light-field"

const EMAIL = "heishooni@gmail.com"

// The left column arrives the way a card is handed over: the name writes itself, then the role, a
// hairline rule, the signature, and last the four ways to get in touch. It is one timeline worked
// out here, with a fixed jitter so the server and the browser agree on every delay, played by CSS.
const LINES = [
    { id: "first", text: "Jeong", ms: 70, pause: 120 },
    { id: "last", text: "Hee Hoon", ms: 70, pause: 0 },
] as const
type LineId = (typeof LINES)[number]["id"]
type Ch = { c: string; t: number; k: number; last?: boolean }

const jitter = (i: number) => { const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453; return x - Math.floor(x) }

const TYPE = (() => {
    let t = 900, n = 0
    const lines = {} as Record<LineId, Ch[]>
    for (const line of LINES) {
        const chars: Ch[] = []
        for (const c of line.text) {
            chars.push({ c, t: Math.round(t), k: 0 })
            t += c === " " ? line.ms * 0.6 : line.ms * (0.86 + 0.28 * jitter(n++))
        }
        // each caret shows until the next character lands; the line's last one holds through the pause
        const typed = chars.filter((ch) => ch.c !== " ")
        typed.forEach((ch, i) => { ch.k = Math.round((i + 1 < typed.length ? typed[i + 1].t : t + line.pause) - ch.t) })
        lines[line.id] = chars
        t += line.pause
    }
    const all = LINES.flatMap((l) => lines[l.id]).filter((ch) => ch.c !== " ")
    all[all.length - 1].last = true
    // the name finishes, then the rest of the plate arrives in one piece
    return { lines, rest: Math.round(t) + 220, end: Math.round(t) + 220 }
})()

// Words stay whole (a line only breaks between them); each letter inks in and carries the caret
// for as long as it is the newest one.
function Typed({ id }: Readonly<{ id: LineId }>) {
    const words: Ch[][] = [[]]
    for (const ch of TYPE.lines[id]) {
        if (ch.c === " ") words.push([])
        else words[words.length - 1].push(ch)
    }
    return words.map((w, i) => (
        <Fragment key={i}>
            {i > 0 && " "}
            <span className="tw">
                {w.map((ch, j) => (
                    <span key={j} className={ch.last ? "tc last" : "tc"} style={{ "--at": `${ch.t}ms`, "--hold": `${ch.k}ms` } as CSSProperties}>{ch.c}</span>
                ))}
            </span>
        </Fragment>
    ))
}

// The hero: the name writes itself on the left while the network stands in glass on the right, both
// over the light field that gives the panes something to show. Scroll stays native — the resume
// slides over the fixed hero.
//
// The plate: the name writes itself, then the role, a hairline rule, the
// signature, and last the four ways to get in touch. One timeline worked out here with a fixed
// jitter so the server and the browser agree on every delay, played by CSS.
export function Hero() {
    const ref = useRef<HTMLElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)
    const [mailOpen, setMailOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // The mail button opens a small card with the address and a copy button; it closes on an
    // outside click or Escape.
    useEffect(() => {
        if (!mailOpen) return
        const onDown = (e: PointerEvent) => { if (!ctaRef.current?.contains(e.target as Node)) setMailOpen(false) }
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMailOpen(false) }
        document.addEventListener("pointerdown", onDown)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("pointerdown", onDown)
            document.removeEventListener("keydown", onKey)
        }
    }, [mailOpen])

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
        } catch {
            // Clipboard blocked: the address is visible and selectable, so there is nothing more to do.
        }
    }

    // Once the resume has slid over the hero, stop the packet loops: nothing is visible.
    useEffect(() => {
        const el = ref.current
        if (!el) return
        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => el.classList.toggle("is-parked", window.scrollY > window.innerHeight))
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", onScroll)
        }
    }, [])

    return (
        <section ref={ref} className="hero">
            <LightField hush />
            <div className="hero-stage">
                <div className="hero-left">
            <h1 className="hero-name" aria-label="Jeong Hee Hoon">
                <span className="hero-name-line" aria-hidden="true"><Typed id="first" /></span>
                <span className="hero-name-line" aria-hidden="true"><Typed id="last" /></span>
            </h1>
            <div className="hero-rest" style={{ "--at": `${TYPE.rest}ms` } as CSSProperties}>
                <p className="hero-role">Network &amp; cloud infrastructure engineer</p>
                <span className="hero-divider" aria-hidden="true" />
                <p className="hero-sig">&ldquo;I value loyalty and trust and I stand by them&rdquo;</p>

                <div className="hero-cta" ref={ctaRef}>
                <Link href="https://github.com/heishooni" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub"><GitHubBrandIcon /></Link>
                <Link href="https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn"><LinkedInBrandIcon /></Link>
                <Link href="https://heishooni.tistory.com/" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Blog"><BlogIcon /></Link>
                <button type="button" className="icon-btn" aria-label="Email" aria-expanded={mailOpen} data-print={EMAIL} onClick={() => setMailOpen((o) => !o)}><Mail aria-hidden="true" /></button>
                {mailOpen && (
                    <div className="hero-mail" role="dialog" aria-label="Email address">
                        <span className="hero-mail-addr">{EMAIL}</span>
                        <button type="button" className="hero-copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
                    </div>
                )}
                    </div>
            </div>
                    <div className="hero-topo-m lg:hidden"><TopologyMobile /></div>
                </div>

                <div className="hero-topo max-lg:hidden" style={{ aspectRatio: TOPO_ASPECT }}><Topology /></div>
                <div className="hero-cap hero-cap--scroll" style={{ "--at": `${TYPE.end + 400}ms` } as CSSProperties}><span>Scroll</span><ArrowDown className="h-3.5 w-3.5 animate-bounce" /></div>
            </div>
        </section>
    )
}
