"use client"

import { useEffect, useRef } from "react"

/* A headline drawn as a grid of characters.

   The text is rasterised once at cell resolution — one sample per cell — and every cell that the
   letterform covers becomes a glyph, so the headline is made of the same stuff as the field behind
   it. It does not fade in: each cell starts as noise and settles on its glyph a beat after the cell
   before it, the way a slow terminal resolves a screen. Any script works, because the sampling is
   done on the browser's own rendering of the text, so 정희훈 and JEONG come out of the same code. */

const RAMP = ".:-=+*#%@"

export function Dots({ text, cell = 7, rows = 8, weight = 700, className, delay = 0, tone = "#7ee787" }: Readonly<{
    text: string; cell?: number; rows?: number; weight?: number; className?: string; delay?: number; tone?: string
}>) {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = ref.current
        if (!cv) return
        const ctx = cv.getContext("2d")
        if (!ctx) return
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches
        const dpr = Math.min(devicePixelRatio || 1, 2)
        const fam = getComputedStyle(cv).fontFamily
        // the cell is a little wider than tall, the way terminal cells are
        const CW = cell, CH = Math.round(cell * 1.55)
        // the headline is so many glyph rows tall; the font size follows from that
        const fontPx = rows * CH
        // measure at full size, then sample
        const m = document.createElement("canvas")
        const mc = m.getContext("2d")
        if (!mc) return
        mc.font = `${weight} ${fontPx}px ${fam}`
        const parts = text.split("\n")
        const width = Math.max(...parts.map((p) => mc.measureText(p).width))
        const cols = Math.ceil(width / CW) + 2
        const rowsN = Math.ceil((fontPx * 1.12 * parts.length) / CH) + 1
        m.width = cols * CW
        m.height = rowsN * CH
        mc.font = `${weight} ${fontPx}px ${fam}`
        mc.fillStyle = "#fff"
        mc.textBaseline = "top"
        parts.forEach((p, i) => mc.fillText(p, CW, i * fontPx * 1.12 + CH * 0.3))
        const img = mc.getImageData(0, 0, m.width, m.height).data
        // coverage per cell, 0..1
        const cov = new Float32Array(cols * rowsN)
        for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
            let s = 0, n = 0
            for (let y = 0; y < CH; y += 2) for (let x = 0; x < CW; x += 2) {
                const k = ((r * CH + y) * m.width + (c * CW + x)) * 4 + 3
                s += img[k] || 0; n++
            }
            cov[r * cols + c] = s / n / 255
        }
        cv.width = cols * CW * dpr
        cv.height = rowsN * CH * dpr
        cv.style.width = `${cols * CW}px`
        cv.style.height = "auto"
        cv.style.maxWidth = "100%"
        ctx.scale(dpr, dpr)
        ctx.font = `${Math.round(CH * 0.8)}px ${fam}`
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        const seed = new Float32Array(cols * rowsN).map(() => Math.random())
        const t0 = performance.now() + delay
        let raf = 0
        const paint = (now: number) => {
            const el = (now - t0) / 1000
            ctx.clearRect(0, 0, cols * CW, rowsN * CH)
            let done = true
            for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
                const k = r * cols + c
                const v = cov[k]
                if (v < 0.12) continue
                // each cell resolves at its own moment, sweeping left to right with some scatter
                const at = still ? -1 : (c / cols) * 0.9 + seed[k] * 0.5
                const settled = el >= at + 0.25
                if (!settled) done = false
                let g: string
                if (el < at) continue
                else if (!settled) g = RAMP[Math.floor(((el * 23 + seed[k] * 97) % 1) * RAMP.length)]
                else g = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]
                ctx.fillStyle = settled ? tone : "rgba(126,231,135,0.5)"
                ctx.globalAlpha = settled ? 0.45 + v * 0.55 : 0.7
                ctx.fillText(g, c * CW + CW / 2, r * CH + CH / 2)
            }
            ctx.globalAlpha = 1
            if (!done) raf = requestAnimationFrame(paint)
        }
        raf = requestAnimationFrame(paint)
        return () => cancelAnimationFrame(raf)
    }, [text, cell, rows, weight, delay, tone])

    return <canvas ref={ref} className={className} role="img" aria-label={text} />
}
