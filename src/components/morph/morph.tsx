"use client"

import { useEffect, useRef } from "react"
import { mulberry } from "@/components/particle/tree"
import { EDUCATION } from "@/components/trace/content"
import { SAMPLES, awardFig, backFig, certFig, eduFig, fanFig, focusFig, frameFig, rackFig, stackFig, timeFig, type Fig } from "@/components/morph/figures"

/* One set of grains, and a figure for every section.

   Each section keeps an empty room beside its words (or, for a project, its drawing or picture).
   The grains stand in the room of the section you are on, as that section's figure; scrolling to
   the next one carries them across and re-forms them there. The page is quiet apart from that:
   one figure at a time, one accent colour, and nothing behind the type.

   The grains answer the hand directly — they move aside under the pointer in the same frame, and a
   click sends a ring through them — and otherwise do only what their figure does: run along its
   lines, circle its rings, or stand still. */

const ACC = "240,179,62" // the one accent; morph.css has the same colour as --accent
const INK = "236,236,238"
const BA = [0.1, 0.2, 0.34, 0.5, 0.7, 0.95]
const STAGGER = 0.55
const HOLD = 7 // seconds a route stays picked out
const BEAT = [1, 0.79, 1.31] // the first figure has three of them, each on its own beat (times HOLD), so they do not keep step
const PACE = 2.2 // sections a second, at most, that the grains cover when the page moves

export function Morph({ progress }: Readonly<{ progress: number }>) {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = ref.current
        if (!cv) return
        const g = cv.getContext("2d")
        if (!g) return
        const still = matchMedia("(prefers-reduced-motion: reduce)")
        const css = getComputedStyle(document.body)
        const KR = css.getPropertyValue("--kr").trim() || "system-ui, sans-serif", MO = css.getPropertyValue("--mo").trim() || "ui-monospace, monospace", UI = css.getPropertyValue("--ui").trim() || "system-ui, sans-serif"

        let w = 0, h = 0, dpr = 1, N = 0, builtFor = 0
        let figs: Fig[] = [], stages: HTMLElement[] = [], mids: number[] = []
        let ox = new Float32Array(0), oy = ox, vx = ox, vy = ox, rs = ox, wv = ox
        let bk: Float32Array[] = []
        let raf = 0, last = 0, t = 0, SS = -1
        let ptx = -1e5, pty = -1e5
        const pulses: { x: number; y: number; t: number }[] = []
        let QX = 0, QY = 0, QF = 1 // where a grain is, and how visible
        let GR = 2 // how far the first figure has grown (over 1.16: all of it)
        let BORN: number | null = null // when the cables came in on the first figure: its routes count their turns from then
        const LIT: number[] = [] // the routes picked out just now
        const sm = (a: number, b: number, x: number) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k) }
        // a light with `blink` under 1 breathes, slowly and each at its own pace; from 1 it is busy — idle a while, then a burst of
        // quick blinks; one without it is steady
        const glow = (b: number | undefined, tt: number) => {
            if (b === undefined) return 1
            if (b < 1) return 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(tt * (0.8 + 1.8 * b) + b * 40))
            if (Math.sin(tt * (0.35 + 0.5 * b) + b * 31) + 0.7 * Math.sin(tt * (1.1 + 0.4 * b) + b * 7) < 0.6) return 0.3
            return Math.sin(tt * (11 + 7 * b) + b * 50) > -0.2 ? 1 : 0.15
        }
        // the point at u (0–1) along curve c of a figure laid in box B → QX, QY; and how long the curve is there, in device px
        const onCurve = (f: Fig, B: number[], c: number, u: number) => {
            const cu = f.curves[c], q = Math.max(0, Math.min(1, u)) * (SAMPLES - 1), i0 = Math.min(SAMPLES - 2, Math.floor(q)), k = q - i0
            QX = B[0] + (cu[i0 * 2] + (cu[i0 * 2 + 2] - cu[i0 * 2]) * k) * B[2]; QY = B[1] + (cu[i0 * 2 + 1] + (cu[i0 * 2 + 3] - cu[i0 * 2 + 1]) * k) * B[3]
        }
        const span = (f: Fig, B: number[], c: number) => { const cu = f.curves[c]; let L = 0; for (let q = 1; q < SAMPLES; q++) L += Math.hypot((cu[q * 2] - cu[q * 2 - 2]) * B[2], (cu[q * 2 + 1] - cu[q * 2 - 1]) * B[3]); return L }

        const build = () => {
            N = innerWidth < 700 ? 3600 : 9000
            builtFor = innerWidth
            const rand = mulberry(11), hist = histRoom(), ends = endWays()
            endSig = signEnds(ends)
            histSig = sign(hist)
            const fa = frameFig(N, rand), fb = frameFig(N, rand)
            figs = [rackFig(N, rand), stackFig(N, rand), timeFig(N, rand, now(), hist), focusFig(N, rand), fa, fb, fa, fb, fa, fanFig(N, rand), awardFig(N, rand), eduFig(N, rand, progress, EDUCATION.start, EDUCATION.end), certFig(N, rand), backFig(N, rand, ends)]
            ox = new Float32Array(N); oy = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N); rs = new Float32Array(N); wv = new Float32Array(N)
            for (let i = 0; i < N; i++) { rs[i] = rand(); wv[i] = (rand() - 0.5) * 0.36 }
            bk = Array.from({ length: BA.length * 2 }, () => new Float32Array(N * 3))
        }
        const now = () => { const d = new Date(); return d.getFullYear() + d.getMonth() / 12 + (d.getDate() - 1) / 365 }
        // the History list's lines, as heights in the room of its figure, so each bar stands level with its line.
        // Only when the two stand side by side; on a phone they are stacked and the figure keeps its own spacing.
        let histSig = ""
        // (layout offsets, summed up to the page, not client rects: the lines come in with a small slide, and a rect
        // taken mid-slide is lower than the line will be)
        const at0 = (el: HTMLElement) => { let x = 0, y = 0; for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) { x += e.offsetLeft; y += e.offsetTop } return { x, y } }
        const histRoom = () => {
            const sec = document.querySelector('main section[data-hop="2"]'), st = sec?.querySelector<HTMLElement>(".mo-stage")
            const when = sec ? Array.from(sec.querySelectorAll<HTMLElement>(".pa-hist .pa-when")) : []
            if (!st?.offsetHeight || !when.length) return undefined
            const s0 = at0(st), w0 = at0(when[0])
            if (w0.x + when[0].offsetWidth > s0.x) return undefined
            return { ar: st.offsetWidth / st.offsetHeight, ys: when.map((el) => (at0(el).y + el.offsetHeight / 2 - s0.y) / st.offsetHeight) }
        }
        // the foot of each way to reach him in the last section, in the units of the room under them (its height), so the
        // trunk there can branch into them
        let endSig = ""
        const endWays = () => {
            const sec = document.querySelector('main section[data-hop="13"]'), st = sec?.querySelector<HTMLElement>(".mo-stage")
            const ways = sec ? Array.from(sec.querySelectorAll<HTMLElement>(".pa-way")) : []
            if (!st?.offsetHeight || !ways.length) return undefined
            const s0 = at0(st), H = st.offsetHeight
            return ways.map((el) => { const p = at0(el); return [(p.x + el.offsetWidth / 2 - s0.x) / H, (p.y + el.offsetHeight - s0.y) / H] as [number, number] })
        }
        const signEnds = (e?: [number, number][]) => (e ? e.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(";") : "")
        const sign = (h?: { ar: number; ys: number[] }) => (h ? `${h.ar.toFixed(2)}:${h.ys.map((y) => y.toFixed(3)).join(",")}` : "")
        const measure = () => {
            // the list can change its lines (a font arriving, a width that wraps a row): then the timeline is drawn again to match
            if (figs.length) { const h = histRoom(), sig = sign(h); if (sig !== histSig) { histSig = sig; figs[2] = timeFig(N, mulberry(12), now(), h) } }
            if (figs.length) { const e = endWays(), sig = signEnds(e); if (sig !== endSig) { endSig = sig; figs[13] = backFig(N, mulberry(13), e) } }
            const secs = Array.from(document.querySelectorAll<HTMLElement>("main section[data-hop]"))
            mids = secs.map((el) => { const r = el.getBoundingClientRect(); return r.top + scrollY + r.height / 2 })
            stages = secs.map((el) => el.querySelector<HTMLElement>(".mo-stage") ?? el)
        }
        const size = () => {
            dpr = Math.min(devicePixelRatio || 1, 2)
            w = Math.floor(innerWidth * dpr); h = Math.floor(innerHeight * dpr)
            cv.width = w; cv.height = h; cv.style.width = `${innerWidth}px`; cv.style.height = `${innerHeight}px`
            if (!figs.length || innerWidth !== builtFor) build()
            measure()
        }
        // where the page is, counted in sections: k when section k is centred in the window
        const where = () => {
            const y = scrollY + innerHeight / 2, n = mids.length
            if (n < 2 || y <= mids[0]) return 0
            for (let k = 0; k + 1 < n; k++) if (y < mids[k + 1]) return k + (y - mids[k]) / (mids[k + 1] - mids[k])
            return n - 1
        }
        // the room a figure stands in, in device px: the section's stage, or what is inside it
        const room = (k: number, R: number[]) => {
            const el = stages[k], of = el && figs[k].frame ? (el.firstElementChild ?? el) : el
            if (!of) { R[0] = w * 0.3; R[1] = h * 0.3; R[2] = w * 0.4; R[3] = h * 0.4; return }
            const r = of.getBoundingClientRect()
            R[0] = r.left * dpr; R[1] = r.top * dpr; R[2] = r.width * dpr; R[3] = r.height * dpr
        }
        // the box of a figure inside its room
        const box = (f: Fig, R: number[], B: number[]) => { const bw = Math.min(R[2], R[3] * f.ar), bh = bw / f.ar; B[0] = R[0] + (R[2] - bw) / 2; B[1] = R[1] + (R[3] - bh) / 2; B[2] = bw; B[3] = bh }
        // a point on a rounded rectangle, d along it, pushed out by off
        const PAD = 12, RAD = 16
        const around = (R: number[], u: number, off: number) => {
            const pad = PAD * dpr, r = RAD * dpr, x0 = R[0] - pad, y0 = R[1] - pad, W = R[2] + 2 * pad, H = R[3] + 2 * pad
            const sw = Math.max(1, W - 2 * r), sh = Math.max(1, H - 2 * r), qa = (Math.PI * r) / 2
            let d = u * (2 * (sw + sh) + 4 * qa)
            const arc = (cx: number, cy: number, a0: number) => { const a = a0 + d / r; QX = cx + Math.cos(a) * (r + off); QY = cy + Math.sin(a) * (r + off) }
            if (d < sw) { QX = x0 + r + d; QY = y0 - off; return } d -= sw
            if (d < qa) return arc(x0 + W - r, y0 + r, -Math.PI / 2); d -= qa
            if (d < sh) { QX = x0 + W + off; QY = y0 + r + d; return } d -= sh
            if (d < qa) return arc(x0 + W - r, y0 + H - r, 0); d -= qa
            if (d < sw) { QX = x0 + W - r - d; QY = y0 + H + off; return } d -= sw
            if (d < qa) return arc(x0 + r, y0 + H - r, Math.PI / 2); d -= qa
            if (d < sh) { QX = x0 - off; QY = y0 + H - r - d; return } d -= sh
            arc(x0 + r, y0 + r, Math.PI)
        }
        // where grain i of figure f is at time tt → QX, QY, and QF (how visible: grains fade at the ends of an open line)
        const at = (f: Fig, R: number[], B: number[], i: number, tt: number) => {
            QF = 1
            if (f.frame) { let u = (f.x[i] + tt * f.cs[i]) % 1; if (u < 0) u += 1; around(R, u, f.y[i] * dpr); return }
            const c = f.cv[i]
            if (c < 0) { QX = B[0] + f.x[i] * B[2]; QY = B[1] + f.y[i] * B[3]; return }
            let u = (f.cu[i] + tt * f.cs[i]) % 1
            if (u < 0) u += 1
            if (!f.closed[c] && f.cs[i] !== 0) QF = Math.min(1, u / 0.05, (1 - u) / 0.05)
            const q = u * (SAMPLES - 1), i0 = Math.min(SAMPLES - 2, Math.floor(q)), k = q - i0, cu = f.curves[c]
            QX = B[0] + (cu[i0 * 2] + (cu[i0 * 2 + 2] - cu[i0 * 2]) * k + f.x[i]) * B[2]
            QY = B[1] + (cu[i0 * 2 + 1] + (cu[i0 * 2 + 3] - cu[i0 * 2 + 1]) * k + f.y[i]) * B[3]
        }
        const trace = (f: Fig, B: number[], c: number) => {
            const cu = f.curves[c], p = new Path2D()
            p.moveTo(B[0] + cu[0] * B[2], B[1] + cu[1] * B[3])
            for (let q = 1; q < SAMPLES; q++) p.lineTo(B[0] + cu[q * 2] * B[2], B[1] + cu[q * 2 + 1] * B[3])
            return p
        }
        const dot = (x: number, y: number, r: number, acc: boolean, ring: boolean, al: number) => {
            if (acc) { g.fillStyle = `rgba(${ACC},${(0.16 * al).toFixed(3)})`; g.beginPath(); g.arc(x, y, r * 3.4, 0, 6.283); g.fill() }
            g.beginPath(); g.arc(x, y, r, 0, 6.283)
            if (ring) { g.strokeStyle = `rgba(${acc ? ACC : INK},${(0.95 * al).toFixed(3)})`; g.lineWidth = dpr; g.stroke() } else { g.fillStyle = `rgba(${acc ? ACC : INK},${(0.95 * al).toFixed(3)})`; g.fill() }
        }
        // the parts of a figure that are drawn rather than made of grains: hairlines, nodes, words
        const chrome = (f: Fig, R: number[], B: number[], al: number, tt: number) => {
            if (al < 0.02) return
            g.lineCap = "round"; g.lineJoin = "round"
            if (f.frame) {
                const pad = PAD * dpr, W = R[2] + 2 * pad, H = R[3] + 2 * pad, L = 2 * (W + H)
                g.beginPath(); g.roundRect(R[0] - pad, R[1] - pad, W, H, RAD * dpr)
                g.strokeStyle = `rgba(${INK},${(0.14 * al).toFixed(3)})`; g.lineWidth = dpr; g.stroke()
                // one lit stretch going round
                g.setLineDash([L * 0.07, L]); g.lineDashOffset = -((tt * 0.05) % 1) * L * 1.07
                g.strokeStyle = `rgba(${ACC},${(0.8 * al).toFixed(3)})`; g.lineWidth = dpr * 1.1; g.stroke(); g.setLineDash([])
                return
            }
            const seen = (far?: number) => (f.grows && far !== undefined ? sm(far, far + 0.12, GR) : 1)
            for (const l of f.lines) { g.strokeStyle = `rgba(${l.acc ? ACC : INK},${(l.a * al * seen(l.at)).toFixed(3)})`; g.lineWidth = dpr * 0.8; g.stroke(trace(f, B, l.c)) }
            LIT.length = 0
            if (f.paths.length && (!f.grows || BORN !== null)) {
                // routes are picked out now and then: one comes up, a packet runs along it with the way it has come lit behind it,
                // there is a flash where it gets to, and it fades. On the first figure the first one starts as the cables come in.
                // The one under the pointer stays lit.
                const from = f.grows ? (BORN ?? 0) : 0
                for (let j = 0, many = f.grows ? BEAT.length : 1; j < many; j++) {
                    const turn = (tt - from) / (HOLD * BEAT[j]) - j / many, ph = turn % 1
                    let lit = (Math.floor(turn) * 7 + j * 23) % f.paths.length, show = turn < 0 ? 0 : sm(0, 0.1, ph) * (1 - sm(0.85, 1, ph)), along = sm(0.06, 0.7, ph), trail = along, hit = sm(0.68, 0.72, ph) * (1 - sm(0.72, 0.9, ph))
                    if (!j && ptx > R[0] && ptx < R[0] + R[2] && pty > R[1] && pty < R[1] + R[3]) { let bd = 1e9; for (let q = 0; q < f.paths.length; q++) { const n = f.nodes[q], d = Math.hypot(B[0] + n.x * B[2] - ptx, B[1] + n.y * B[3] - pty); if (d < bd) { bd = d; lit = q } } show = 1; along = (tt * 0.2) % 1; trail = 1; hit = 0 }
                    if (show < 0.02) continue
                    LIT.push(lit)
                    const c = f.paths[lit], L = span(f, B, c)
                    g.setLineDash([L * trail + 0.5, L + 1]); g.strokeStyle = `rgba(${ACC},${(0.85 * al * show).toFixed(3)})`; g.lineWidth = dpr * 1.3; g.stroke(trace(f, B, c)); g.setLineDash([])
                    for (let k = 0; k < 3; k++) { onCurve(f, B, c, along - k * 0.014); dot(QX, QY, dpr * (2.4 - k * 0.5), true, false, al * show * (1 - k * 0.3)) }
                    if (hit > 0.02) { onCurve(f, B, c, 1); dot(QX, QY, dpr * (1.6 + 3 * hit), true, true, al * hit) }
                }
            }
            f.nodes.forEach((n, q) => { const lit = LIT.includes(q); dot(B[0] + n.x * B[2], B[1] + n.y * B[3], n.r * dpr * (lit ? 1.8 : 1), !!n.acc || lit, !!n.ring, al * seen(n.at) * glow(n.blink, tt)) })
            g.textBaseline = "middle"
            for (const l of f.labels) {
                const ko = /[가-힣]/.test(l.t)
                g.font = l.big ? `200 ${Math.round(Math.min(44, B[2] / dpr / 9) * dpr)}px ${UI}` : ko ? `${Math.round(11 * dpr)}px ${KR}` : `${Math.round(9.5 * dpr)}px ${MO}`
                if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = l.big || ko ? "0px" : `${1.1 * dpr}px`
                g.textAlign = l.al
                g.fillStyle = l.big ? `rgba(${INK},${(0.95 * al).toFixed(3)})` : `rgba(${l.acc ? ACC : "141,141,148"},${al.toFixed(3)})`
                g.fillText(l.t, B[0] + l.x * B[2], B[1] + l.y * B[3])
            }
        }

        const RA = [0, 0, 0, 0], RB = [0, 0, 0, 0], BXA = [0, 0, 0, 0], BXB = [0, 0, 0, 0]
        const paint = (dt: number) => {
            t += dt
            const calm = still.matches, tt = calm ? 0 : t
            const target = where(), whole = Math.floor(target), S = whole + sm(0.2, 0.8, target - whole)
            // the grains follow the page at their own pace, not the hand's: about a section a second, more only when they are far behind
            const lag = S - SS, pace = (PACE + 2.4 * Math.max(0, Math.abs(lag) - 1)) * dt
            SS = SS < 0 || calm ? S : SS + Math.max(-pace, Math.min(pace, lag * Math.min(1, dt * 8)))
            const k = Math.max(0, Math.min(figs.length - 2, Math.floor(SS))), mm = Math.max(0, Math.min(1, SS - k))
            const A = figs[k], Bf = figs[k + 1]
            room(k, RA); box(A, RA, BXA)
            if (mm > 0) { room(k + 1, RB); box(Bf, RB, BXB) }
            const arrive = calm ? 1 : sm(0, 0.7, t), stiff = calm ? 0 : 14 + 76 * sm(0, 1.2, t), damp = Math.exp(-dt * (5 + 11 * sm(0, 1.2, t)))

            // arriving: the first figure is built up, slowly, then fast, then slowly
            GR = calm || t > 3 ? 2 : 1.17 * sm(0.15, 2.6, t)
            if (BORN === null && GR >= 0.9) BORN = calm ? -HOLD / 2 : t
            g.clearRect(0, 0, w, h)
            g.globalCompositeOperation = "source-over"
            chrome(A, RA, BXA, (1 - sm(0.1, 0.4, mm)) * arrive, tt)
            if (mm > 0) chrome(Bf, RB, BXB, sm(0.6, 0.9, mm) * arrive, tt)

            for (let i = pulses.length - 1; i >= 0; i--) if (t - pulses[i].t > 1.4) pulses.splice(i, 1)
            const np = pulses.length, hasPtr = ptx > -1e4, Rp = 120 * dpr, band = 90 * dpr
            const cnt = new Int32Array(BA.length * 2)
            for (let i = 0; i < N; i++) {
                at(A, RA, BXA, i, tt)
                let x = QX, y = QY, al = A.a[i] * QF, s = A.s[i], acc = A.acc[i]
                if (GR < 1.17 && A.at) al *= sm(A.at[i] - 0.06, A.at[i] + 0.04, GR)
                if (mm > 0) {
                    at(Bf, RB, BXB, i, tt)
                    let mi = Math.max(0, Math.min(1, mm * (1 + STAGGER) - STAGGER * rs[i]))
                    mi = mi * mi * (3 - 2 * mi)
                    const dx = QX - x, dy = QY - y, bow = Math.sin(Math.PI * mi) * wv[i]
                    x += dx * mi - dy * bow; y += dy * mi + dx * bow
                    al += (Bf.a[i] * QF - al) * mi; s += (Bf.s[i] - s) * mi
                    if (mi > 0.5) acc = Bf.acc[i]
                }
                if (!calm) {
                    let fx = -stiff * ox[i], fy = -stiff * oy[i]
                    const px = x + ox[i], py = y + oy[i]
                    if (hasPtr) { const dx = px - ptx, dy = py - pty, d = Math.hypot(dx, dy); if (d < Rp && d > 0.5) { const push = (1 - d / Rp) ** 2 * 5200 * dpr; fx += (dx / d) * push; fy += (dy / d) * push } }
                    for (let q = 0; q < np; q++) { const P = pulses[q], dx = px - P.x, dy = py - P.y, d = Math.hypot(dx, dy) || 1, off = Math.abs(d - (t - P.t) * 1150 * dpr); if (off < band) { const push = (1 - off / band) * 5200 * dpr * (1 - (t - P.t) / 1.4); fx += (dx / d) * push; fy += (dy / d) * push } }
                    vx[i] = (vx[i] + fx * dt) * damp; vy[i] = (vy[i] + fy * dt) * damp
                    ox[i] += vx[i] * dt; oy[i] += vy[i] * dt
                    x += ox[i]; y += oy[i]
                }
                al *= arrive
                if (al < 0.03 || x < -8 || x > w + 8 || y < -8 || y > h + 8) continue
                const b = (al < 0.15 ? 0 : al < 0.27 ? 1 : al < 0.42 ? 2 : al < 0.6 ? 3 : al < 0.82 ? 4 : 5) + (acc ? BA.length : 0), arr = bk[b], n = cnt[b]++
                const sz = Math.max(1, s * dpr * 1.15)
                arr[n * 3] = x - sz / 2; arr[n * 3 + 1] = y - sz / 2; arr[n * 3 + 2] = sz
            }
            g.globalCompositeOperation = "lighter"
            for (let b = 0; b < BA.length * 2; b++) {
                if (!cnt[b]) continue
                const arr = bk[b]
                g.fillStyle = `rgba(${b < BA.length ? INK : ACC},${BA[b % BA.length]})`
                g.beginPath()
                for (let j = 0; j < cnt[b]; j++) g.rect(arr[j * 3], arr[j * 3 + 1], arr[j * 3 + 2], arr[j * 3 + 2])
                g.fill()
            }
            g.globalCompositeOperation = "source-over"
        }

        const draw = (now: number) => {
            const dt = last ? Math.min(0.034, (now - last) / 1000) : 0.016
            last = now
            paint(dt)
            raf = requestAnimationFrame(draw)
        }
        // reduced motion: no loop. The figure for where the page is gets drawn when the page moves.
        let due = 0
        const once = () => { if (!due) due = requestAnimationFrame(() => { due = 0; paint(0) }) }
        const onResize = () => { size(); if (still.matches) once() }
        const move = (e: PointerEvent) => { if (e.pointerType === "mouse") { ptx = e.clientX * dpr; pty = e.clientY * dpr } }
        const leave = () => { ptx = pty = -1e5 }
        const down = (e: PointerEvent) => { if (e.pointerType === "mouse" && pulses.length < 4) pulses.push({ x: e.clientX * dpr, y: e.clientY * dpr, t }) }
        const ro = new ResizeObserver(() => { measure(); if (still.matches) once() })
        let alive = true

        // the figures' words are set in the page's own faces, so wait for them
        document.fonts.ready.catch(() => null).then(() => {
            if (!alive) return
            size()
            const main = document.querySelector("main")
            if (main) ro.observe(main)
            addEventListener("resize", onResize)
            if (still.matches) { once(); addEventListener("scroll", once, { passive: true }) }
            else {
                addEventListener("pointermove", move, { passive: true })
                addEventListener("pointerdown", down, { passive: true })
                document.addEventListener("pointerleave", leave)
                raf = requestAnimationFrame(draw)
            }
        })
        return () => {
            alive = false
            cancelAnimationFrame(raf); cancelAnimationFrame(due)
            ro.disconnect()
            removeEventListener("resize", onResize)
            removeEventListener("scroll", once)
            removeEventListener("pointermove", move)
            removeEventListener("pointerdown", down)
            document.removeEventListener("pointerleave", leave)
        }
    }, [progress])

    return <canvas className="mo-canvas" ref={ref} aria-hidden="true" />
}
