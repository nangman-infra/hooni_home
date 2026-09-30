"use client"

import { useEffect, useRef } from "react"
import { NET, TUNNELS } from "@/components/trace/content"

/* Everything on this screen is a character in a grid.

   The canvas is divided into terminal cells. A slow field of noise lights cells with the classic
   density ramp ( .:-=+*#%@ ), which is what the drifting clouds of glyphs are. On top of that the
   network is drawn in the same cells: every site a box of box-drawing characters with every machine
   named inside it, the tunnels as orthogonal runs of ─ and │, and the traffic as a bright glyph
   walking cell to cell along them. The pointer disturbs the field like a finger on a CRT.

   Glyphs are pre-drawn once per level into an atlas and stamped with drawImage; fillText for seven
   thousand cells a frame would not hold 60fps, drawImage does. */

const RAMP = " .:-=+*#%@"
const BOX = "┌┐└┘─│├┤┬┴┼"
const PKT = "■"
const LEVELS = 6

type Box = { id: string; c: number; r: number; w: number; h: number; label: string; cidr: string; rows: string[] }
type Path = { cells: [number, number][]; kind: number }

export function Grid() {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = ref.current
        if (!cv) return
        const ctx = cv.getContext("2d", { alpha: false })
        if (!ctx) return
        const still = matchMedia("(prefers-reduced-motion: reduce)")
        const MONO = getComputedStyle(document.body).getPropertyValue("--mo").trim() || "ui-monospace, monospace"

        let w = 0, h = 0, dpr = 1, cw = 9, ch = 16, cols = 0, rows = 0, narrow = false
        let atlas: HTMLCanvasElement | null = null
        let glyphs = ""
        const gi = new Map<string, number>()
        let boxes: Box[] = []
        let paths: Path[] = []
        // the static part of the drawing: glyph index and level per cell, -1 = nothing
        let scene = new Int16Array(0), sceneLv = new Uint8Array(0)
        let raf = 0, last = 0, t = 0
        let mx = -1, my = -1, tmx = -1, tmy = -1
        // packets: which path, how far along, direction, speed
        const P = 90
        const pp = new Int16Array(P), pu = new Float32Array(P), pv = new Float32Array(P), pd = new Int8Array(P)

        const bake = () => {
            glyphs = RAMP.slice(1) + BOX + PKT + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-_/:*() "
            gi.clear()
            for (let i = 0; i < glyphs.length; i++) gi.set(glyphs[i], i)
            const a = document.createElement("canvas")
            a.width = Math.ceil(cw * dpr) * glyphs.length
            a.height = Math.ceil(ch * dpr) * LEVELS
            const ac = a.getContext("2d")
            if (!ac) return
            ac.font = `${Math.round(ch * 0.78 * dpr)}px ${MONO}`
            ac.textBaseline = "middle"
            ac.textAlign = "center"
            const CW = Math.ceil(cw * dpr), CH = Math.ceil(ch * dpr)
            // the phosphor: dim grey-green at the bottom of the ramp, full green at the top, white beyond
            const tone = ["rgba(110,140,118,0.34)", "rgba(120,160,130,0.5)", "rgba(126,231,135,0.62)", "rgba(126,231,135,0.86)", "rgba(190,255,196,1)", "rgba(236,246,238,1)"]
            for (let l = 0; l < LEVELS; l++) {
                ac.fillStyle = tone[l]
                for (let i = 0; i < glyphs.length; i++) ac.fillText(glyphs[i], i * CW + CW / 2, l * CH + CH / 2)
            }
            atlas = a
        }

        /* the network, laid out in cells on the right of the grid (or the top, on a phone) */
        const layout = () => {
            boxes = []
            paths = []
            const byId = Object.fromEntries(NET.map((s) => [s.id, s]))
            const mk = (id: string, c: number, r: number, w: number, full: boolean, compact: boolean): Box => {
                const s = byId[id]
                const rowsOut: string[] = []
                if (!compact) {
                    for (const hst of s.hosts) {
                        const name = hst.name.slice(0, w - 4)
                        if (full && hst.addr) {
                            const room = w - 4 - name.length - 1
                            const addr = room >= hst.addr.length ? hst.addr : ""
                            rowsOut.push(name + " ".repeat(Math.max(1, w - 4 - name.length - addr.length)) + addr)
                        } else rowsOut.push(name)
                    }
                } else rowsOut.push(`${s.hosts.length} hosts`)
                return { id, c, r, w, h: rowsOut.length + 2, label: s.label, cidr: s.cidr, rows: rowsOut }
            }
            if (!narrow) {
                const c0 = Math.floor(cols * 0.47)
                const W = cols - c0 - 2
                const bw = Math.floor(W / 2) - 1
                const full = bw >= 46, compact = bw < 24
                const cA = c0, cB = c0 + bw + 3
                const y = mk("yongdu", cA, 2, bw, full, compact)
                const s = mk("seokchon", cA, y.r + y.h + 2, bw, full, compact)
                const d = mk("daejeon", cA, s.r + s.h + 2, bw, full, compact)
                const g = mk("goyang", cB, 2, bw, full, compact)
                const a = mk("aws", cB, g.r + g.h + 2, bw, full, compact)
                boxes = [y, s, d, g, a]
            } else {
                const bw = cols - 4
                const compact = bw < 30
                let r = 1
                for (const id of ["seokchon", "daejeon", "aws", "yongdu", "goyang"]) {
                    const b = mk(id, 2, r, bw, false, compact)
                    boxes.push(b)
                    r += b.h + 1
                }
            }
            // the tunnels as runs of cells between box edges
            const at = Object.fromEntries(boxes.map((b) => [b.id, b]))
            const vert = (a: Box, b: Box, kind: number, col: number) => {
                const cells: [number, number][] = []
                const top = a.r < b.r ? a : b, bot = a.r < b.r ? b : a
                for (let r = top.r + top.h; r < bot.r; r++) cells.push([col, r])
                if (cells.length) paths.push({ cells, kind })
            }
            const horiz = (a: Box, b: Box, kind: number, row: number) => {
                const cells: [number, number][] = []
                const left = a.c < b.c ? a : b, right = a.c < b.c ? b : a
                for (let c = left.c + left.w; c < right.c; c++) cells.push([c, row])
                if (cells.length) paths.push({ cells, kind })
            }
            for (const l of TUNNELS) {
                const A = at[l.a], B = at[l.b]
                if (!A || !B) continue
                if (A.c === B.c) vert(A, B, l.kind, A.c + Math.floor(A.w / 2) + (l.kind === 1 ? 0 : 0))
                else {
                    // a horizontal run between the two columns, at a row both boxes span if possible
                    const r0 = Math.max(A.r, B.r) + 1, r1 = Math.min(A.r + A.h, B.r + B.h) - 2
                    if (r1 >= r0) horiz(A, B, l.kind, Math.floor((r0 + r1) / 2))
                    else {
                        // no shared row: go across at the lower box's first row, then up to the higher box
                        const low = A.r > B.r ? A : B, high = A.r > B.r ? B : A
                        const row = low.r + 1
                        const cells: [number, number][] = []
                        const left = A.c < B.c ? A : B, right = A.c < B.c ? B : A
                        const col = high === left ? left.c + left.w - 2 : right.c + 1
                        for (let r = high.r + high.h; r < row; r++) cells.push([col, r])
                        if (left === high) for (let c = left.c + left.w; c < right.c; c++) cells.push([c, row])
                        else for (let c = right.c - 1; c >= left.c + left.w; c--) cells.push([c, row])
                        paths.push({ cells, kind: l.kind })
                    }
                }
            }
            for (let i = 0; i < P; i++) {
                pp[i] = paths.length ? i % paths.length : 0
                pu[i] = Math.random()
                pv[i] = 0.08 + Math.random() * 0.12
                pd[i] = i % 2 ? 1 : -1
            }
            // paint the static scene into the cell buffers
            scene = new Int16Array(cols * rows).fill(-1)
            sceneLv = new Uint8Array(cols * rows)
            const blank = (c: number, r: number) => { if (c >= 0 && r >= 0 && c < cols && r < rows) scene[r * cols + c] = -2 }
            for (const b of boxes) for (let r = b.r - 1; r <= b.r + b.h; r++) for (let c = b.c - 1; c <= b.c + b.w; c++) blank(c, r)
            for (const p of paths) for (const [c, r] of p.cells) for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) blank(c + dc, r + dr)
            const put = (c: number, r: number, g: string, lv: number) => {
                if (c < 0 || r < 0 || c >= cols || r >= rows) return
                const k = gi.get(g)
                if (k === undefined) return
                scene[r * cols + c] = k
                sceneLv[r * cols + c] = lv
            }
            const text = (c: number, r: number, s: string, lv: number) => { for (let i = 0; i < s.length; i++) if (s[i] !== " ") put(c + i, r, s[i], lv) }
            for (const p of paths) for (const [c, r] of p.cells) put(c, r, p.cells.length > 1 && p.cells[0][0] === p.cells[1][0] ? "│" : "─", 1)
            for (const b of boxes) {
                const on = b.id === "seokchon"
                const lv = on ? 3 : 2
                put(b.c, b.r, "┌", lv); put(b.c + b.w - 1, b.r, "┐", lv)
                put(b.c, b.r + b.h - 1, "└", lv); put(b.c + b.w - 1, b.r + b.h - 1, "┘", lv)
                for (let c = b.c + 1; c < b.c + b.w - 1; c++) { put(c, b.r, "─", lv); put(c, b.r + b.h - 1, "─", lv) }
                for (let r = b.r + 1; r < b.r + b.h - 1; r++) { put(b.c, r, "│", lv); put(b.c + b.w - 1, r, "│", lv) }
                text(b.c + 2, b.r, ` ${b.label} `, on ? 5 : 4)
                const cid = ` ${b.cidr} `
                if (b.w - 4 - b.label.length - 2 > cid.length) text(b.c + b.w - 2 - cid.length, b.r, cid, 2)
                b.rows.forEach((row, i) => text(b.c + 2, b.r + 1 + i, row, on ? 4 : 3))
                // where a tunnel meets the box, the wall becomes a junction
                for (const p of paths) {
                    const [c0, r0] = p.cells[0], [c1, r1] = p.cells[p.cells.length - 1]
                    for (const [c, r] of [[c0, r0 - 1], [c0, r0 + 1], [c1, r1 - 1], [c1, r1 + 1]]) if (r === b.r || r === b.r + b.h - 1) if (c > b.c && c < b.c + b.w - 1) put(c, r, r === b.r ? "┴" : "┬", lv)
                    for (const [c, r] of [[c0 - 1, r0], [c0 + 1, r0], [c1 - 1, r1], [c1 + 1, r1]]) if (c === b.c || c === b.c + b.w - 1) if (r > b.r && r < b.r + b.h - 1) put(c, r, c === b.c ? "┤" : "├", lv)
                }
            }
        }

        const size = () => {
            dpr = Math.min(devicePixelRatio || 1, 2)
            narrow = innerWidth < 900
            // the cell grows with the window so the grid stays about 160 columns wide: a bigger
            // monitor gets a bigger terminal font, not four times the cells to draw every frame
            cw = Math.max(7, Math.round(innerWidth / 160))
            ch = Math.round(cw * 1.78)
            w = Math.floor(innerWidth * dpr)
            h = Math.floor(innerHeight * dpr)
            cv.width = w
            cv.height = h
            cv.style.width = `${innerWidth}px`
            cv.style.height = `${innerHeight}px`
            cols = Math.floor(innerWidth / cw)
            rows = Math.floor(innerHeight / ch)
            bake()
            layout()
        }

        // value noise, three octaves: enough for clouds, cheap enough for every cell every frame
        const hash = (x: number, y: number) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n) }
        const sm = (t: number) => t * t * (3 - 2 * t)
        const vn = (x: number, y: number) => {
            const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi)
            const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
            return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
        }
        const noise = (x: number, y: number) => vn(x, y) * 0.6 + vn(x * 2.1 + 7, y * 2.1 + 3) * 0.28 + vn(x * 4.3 + 19, y * 4.3 + 11) * 0.12

        const paint = (dt: number) => {
            t += dt
            if (mx >= 0) { mx += (tmx - mx) * Math.min(1, dt * 4); my += (tmy - my) * Math.min(1, dt * 4) } else { mx = tmx; my = tmy }
            ctx.fillStyle = "#070907"
            ctx.fillRect(0, 0, w, h)
            if (!atlas) return
            const CW = Math.ceil(cw * dpr), CH = Math.ceil(ch * dpr)
            const vel = Number(document.documentElement.style.getPropertyValue("--vel") || 0)
            const hop = Number(document.documentElement.dataset.hop || 0)
            // the field: clouds on the sides, a hole where the words are, thinner once you leave the top
            const deep = Math.min(1, hop * 0.5)
            const holeL = narrow ? 0 : 0.03, holeR = narrow ? 1 : 0.46
            const flow = t * 0.09
            for (let r = 0; r < rows; r++) {
                const yy = r / rows
                for (let c = 0; c < cols; c++) {
                    const k = r * cols + c
                    let g = scene[k], lv = sceneLv[k]
                    if (g === -2) continue
                    if (g < 0) {
                        const xx = c / cols
                        let v = noise(xx * 3.2 + flow, yy * 1.9 - flow * 0.6)
                        // fade the field out where the copy sits, and past the topology in a phone's top
                        let mask = 1
                        if (!narrow && xx > holeL && xx < holeR) mask = Math.max(0, (Math.abs(xx - (holeL + holeR) / 2) / ((holeR - holeL) / 2)) ** 3)
                        if (narrow && yy > 0.42) mask = 0
                        v = (v - 0.56) * 2.6 * mask * (1 - deep * 0.6) + vel * 0.35 * mask
                        if (mx >= 0) {
                            const dx = (xx - mx) * (cols / rows) * 1.6, dy = yy - my
                            const d = Math.hypot(dx, dy)
                            v += Math.max(0, 0.22 - d) * 3
                        }
                        if (v <= 0.1) continue
                        const i = Math.min(RAMP.length - 2, Math.floor(v * (RAMP.length - 1)))
                        g = i
                        lv = Math.min(3, Math.floor(v * 4))
                    }
                    ctx.drawImage(atlas, g * CW, lv * CH, CW, CH, c * CW, r * CH, CW, CH)
                }
            }
            // the traffic
            const pk = gi.get(PKT) ?? 0
            for (let i = 0; i < P; i++) {
                const p = paths[pp[i]]
                if (!p) continue
                pu[i] += pv[i] * dt * (0.6 + vel * 1.5)
                if (pu[i] > 1) pu[i] -= 1
                const u = pd[i] > 0 ? pu[i] : 1 - pu[i]
                const [c, r] = p.cells[Math.min(p.cells.length - 1, Math.floor(u * p.cells.length))]
                ctx.drawImage(atlas, pk * CW, (p.kind === 2 ? 5 : 4) * CH, CW, CH, c * CW, r * CH, CW, CH)
            }
        }

        const draw = (now: number) => {
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
            last = now
            paint(dt)
            raf = requestAnimationFrame(draw)
        }
        const move = (e: PointerEvent) => { tmx = e.clientX / innerWidth; tmy = e.clientY / innerHeight }
        const leave = () => { tmx = -1; tmy = -1; mx = -1; my = -1 }
        const onResize = () => { size(); if (still.matches) paint(0.016) }

        size()
        addEventListener("resize", onResize)
        if (still.matches) {
            paint(0.016)
        } else {
            addEventListener("pointermove", move, { passive: true })
            document.addEventListener("pointerleave", leave)
            raf = requestAnimationFrame(draw)
        }
        return () => {
            cancelAnimationFrame(raf)
            removeEventListener("resize", onResize)
            removeEventListener("pointermove", move)
            document.removeEventListener("pointerleave", leave)
        }
    }, [])

    return <canvas className="px-grid" ref={ref} aria-hidden="true" />
}
