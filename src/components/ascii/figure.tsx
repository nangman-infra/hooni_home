"use client"

import { useEffect, useRef } from "react"
import { SHAPES, type ShapeName } from "@/components/ascii/shapes"

/* A figure drawn in characters.

   The section's density field is sampled once per cell and each cell becomes the character whose
   weight matches — light to dense:  . : + * ? % S # @  — in one grey, evenly spaced, the way the
   reference sets its art. A little dither before quantising keeps the gradients from banding.

   As the figure scrolls into view it resolves: it starts as the previous section's shape and as
   the noise, and settles on its own as it comes up the screen, so moving down the page is watching
   one figure become the next. The field also carries a slow time, so a settled figure still lives. */

const RAMP = " .:+*?%S#@"
const CW = 12, CH = 15 // the cell, in CSS px

export function Figure({ shape, from, rows = 26, label }: Readonly<{ shape: ShapeName; from?: ShapeName; rows?: number; label: string }>) {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = ref.current
        if (!cv) return
        const ctx = cv.getContext("2d", { alpha: true })
        if (!ctx) return
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches
        const MONO = getComputedStyle(cv).fontFamily
        const F = SHAPES[shape], F0 = from ? SHAPES[from] : null
        let cols = 0, dpr = 1, atlas: HTMLCanvasElement | null = null
        let raf = 0, t = 0, last = 0, p = still ? 1 : 0, seen = 0, on = false
        const hash = (a: number, b: number) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n) }

        const size = () => {
            dpr = Math.min(devicePixelRatio || 1, 2)
            const wcss = cv.parentElement?.clientWidth || 640
            cols = Math.max(24, Math.floor(wcss / CW))
            cv.width = Math.ceil(cols * CW * dpr); cv.height = Math.ceil(rows * CH * dpr)
            cv.style.width = `${cols * CW}px`; cv.style.height = `${rows * CH}px`
            const a = document.createElement("canvas")
            a.width = Math.ceil(CW * dpr) * RAMP.length; a.height = Math.ceil(CH * dpr)
            const ac = a.getContext("2d")
            if (!ac) return
            ac.font = `${Math.round(11 * dpr)}px ${MONO}`
            ac.textBaseline = "middle"; ac.textAlign = "center"
            ac.fillStyle = "#8b8b90"
            for (let i = 1; i < RAMP.length; i++) ac.fillText(RAMP[i], i * Math.ceil(CW * dpr) + (CW * dpr) / 2, (CH * dpr) / 2)
            atlas = a
        }

        const paint = () => {
            if (!atlas) return
            const cw = Math.ceil(CW * dpr), ch = Math.ceil(CH * dpr)
            ctx.clearRect(0, 0, cv.width, cv.height)
            const A = (cols * CW) / (rows * CH)
            const frame = Math.floor(t * 10)
            for (let r = 0; r < rows; r++) {
                const y = 1 - (2 * (r + 0.5)) / rows
                for (let c = 0; c < cols; c++) {
                    const x = ((2 * (c + 0.5)) / cols - 1) * A
                    let d = F(x, y, t, A)
                    if (F0 && p < 1) d = F0(x, y, t, A) * (1 - p) + d * p
                    d += (hash(c * 1.7, r * 2.3) - 0.5) * 0.1
                    // while it is still resolving, some cells have not decided yet
                    if (p < 1 && hash(c + frame * 0.37, r - frame * 0.61) < (1 - p) * 0.35) d = 0.15 + hash(c, r + frame) * 0.5
                    if (d < 0.08) continue
                    const i = Math.min(RAMP.length - 1, Math.max(1, Math.floor(d * (RAMP.length - 1) + 0.5)))
                    ctx.drawImage(atlas, i * cw, 0, cw, ch, c * cw, r * ch, cw, ch)
                }
            }
        }
        const loop = (now: number) => {
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
            last = now
            t += dt
            p = Math.min(1, p + dt / 1.6)
            paint()
            raf = on ? requestAnimationFrame(loop) : 0
        }
        const io = new IntersectionObserver(([e]) => {
            const was = on
            on = e.isIntersecting
            if (on && e.intersectionRatio > 0.15) seen = 1
            if (on && !was && !still) { last = 0; raf = requestAnimationFrame(loop) }
            if (!on && raf) { cancelAnimationFrame(raf); raf = 0 }
        }, { threshold: [0, 0.15, 0.5] })
        const ro = new ResizeObserver(() => { size(); paint() })

        size()
        if (still) { p = 1; paint() }
        io.observe(cv)
        ro.observe(cv.parentElement ?? cv)
        return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); void seen }
    }, [shape, from, rows])

    return <canvas ref={ref} className="as-fig" role="img" aria-label={label} />
}
