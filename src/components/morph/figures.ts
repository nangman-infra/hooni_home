import { CERTS, EXPERIENCE, FOCUS, HISTORY, ME } from "@/components/trace/content"

/* The figures. One per section, each a drawing made of the same grains: where every grain sits (or
   which line it runs along), the hairlines under them, the nodes on them, and a few words.

   Everything is authored in a box whose height is 1 and whose width is `ar`, then stored with x
   divided by `ar`, so the engine can lay the box into whatever room the page gives it. */

export type Node = { x: number; y: number; r: number; acc?: boolean; ring?: boolean }
export type Label = { x: number; y: number; t: string; al: CanvasTextAlign; big?: boolean; acc?: boolean }
export type Line = { c: number; a: number; acc?: boolean }
export type Fig = {
    frame: boolean; ar: number
    x: Float32Array; y: Float32Array; a: Float32Array; s: Float32Array; acc: Uint8Array
    cv: Int16Array; cu: Float32Array; cs: Float32Array // the curve a grain runs along (-1: it stays put), where on it, how fast
    curves: Float32Array[]; closed: boolean[]
    lines: Line[]; nodes: Node[]; labels: Label[]
    paths: number[] // curves that can be picked out: on the tree, root to each tip
}

export const SAMPLES = 72
type Pt = [number, number]
type Rand = () => number

function make(n: number, ar: number, rand: Rand, frame = false) {
    const f: Fig = {
        frame, ar, x: new Float32Array(n), y: new Float32Array(n), a: new Float32Array(n), s: new Float32Array(n), acc: new Uint8Array(n),
        cv: new Int16Array(n).fill(-1), cu: new Float32Array(n), cs: new Float32Array(n), curves: [], closed: [], lines: [], nodes: [], labels: [], paths: [],
    }
    let i = 0
    const g = () => (rand() + rand() + rand() - 1.5) * 0.82
    // a grain at a place
    const put = (x: number, y: number, a: number, s = 1, acc = 0) => { if (i >= n) return; f.x[i] = x / ar; f.y[i] = y; f.a[i] = a; f.s[i] = s; f.acc[i] = acc; i++ }
    // a grain running along a curve, a little off its centre
    const run = (c: number, u: number, speed: number, off: number, a: number, s = 1, acc = 0) => { if (i >= n) return; f.cv[i] = c; f.cu[i] = u; f.cs[i] = speed; f.x[i] = (g() * off) / ar; f.y[i] = g() * off; f.a[i] = a; f.s[i] = s; f.acc[i] = acc; i++ }
    // a polyline, resampled evenly along its length
    const curve = (pts: Pt[], closed = false) => {
        const len = [0]
        for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
        const out = new Float32Array(SAMPLES * 2), total = len[len.length - 1] || 1
        let k = 1
        for (let q = 0; q < SAMPLES; q++) {
            const d = (q / (SAMPLES - 1)) * total
            while (k < pts.length - 1 && len[k] < d) k++
            const w = (d - len[k - 1]) / (len[k] - len[k - 1] || 1)
            out[q * 2] = (pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * w) / ar; out[q * 2 + 1] = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * w
        }
        f.curves.push(out); f.closed.push(closed)
        return f.curves.length - 1
    }
    const node = (x: number, y: number, r: number, acc = false, ring = false) => f.nodes.push({ x: x / ar, y, r, acc, ring })
    const label = (x: number, y: number, t: string, al: CanvasTextAlign = "center", big = false, acc = false) => f.labels.push({ x: x / ar, y, t, al, big, acc })
    // whatever is left over is dust in the air round the drawing
    const dust = () => { while (i < n) put(ar * (0.5 + g() * 0.42), 0.5 + g() * 0.4, 0.1 + rand() * 0.12, 0.8) }
    return { f, put, run, curve, node, label, dust, g, count: (share: number) => Math.round(n * share) }
}
const circle = (cx: number, cy: number, r: number, from = 0, to = Math.PI * 2, steps = 96): Pt[] => Array.from({ length: steps + 1 }, (_, k) => { const a = from + ((to - from) * k) / steps; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt })
const hermite = (p0: Pt, a0: number, p1: Pt, a1: number, pull: number, steps = 18): Pt[] => {
    const m0: Pt = [Math.sin(a0) * pull, -Math.cos(a0) * pull], m1: Pt = [Math.sin(a1) * pull, -Math.cos(a1) * pull]
    return Array.from({ length: steps + 1 }, (_, k) => {
        const t = k / steps, t2 = t * t, t3 = t2 * t, h0 = 2 * t3 - 3 * t2 + 1, h1 = t3 - 2 * t2 + t, h2 = -2 * t3 + 3 * t2, h3 = t3 - t2
        return [h0 * p0[0] + h1 * m0[0] + h2 * p1[0] + h3 * m1[0], h0 * p0[1] + h1 * m0[1] + h2 * p1[1] + h3 * m1[1]] as Pt
    })
}

/* the name, set in grains */
export function nameFig(n: number, rand: Rand, text: string, font: string): Fig {
    const W = 900, H = 300, ar = W / H
    const b = make(n, ar, rand)
    const cv = document.createElement("canvas")
    cv.width = W; cv.height = H
    const g = cv.getContext("2d", { willReadFrequently: true })
    if (!g) { b.dust(); return b.f }
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"
    let size = 250
    g.font = `500 ${size}px ${font}`
    size = Math.min(size, (size * W * 0.94) / g.measureText(text).width)
    g.font = `500 ${size}px ${font}`
    g.fillText(text, W / 2, H / 2 + size * 0.04)
    const d = g.getImageData(0, 0, W, H).data
    let area = 0
    for (let q = 3; q < d.length; q += 4) if (d[q] > 128) area++
    if (!area) { b.dust(); return b.f }
    // an even scatter, not a random one: a jittered grid over the letters, so no stroke clumps or thins
    const want = b.count(0.95), cell = Math.sqrt(area / want)
    let made = 0
    for (let pass = 0; pass < 3 && made < want; pass++) for (let y = (pass * cell) / 3; y < H && made < want; y += cell) for (let x = (pass * cell) / 3; x < W && made < want; x += cell) {
        const px = x + rand() * cell, py = y + rand() * cell
        if (px >= W || py >= H || d[(Math.floor(py) * W + Math.floor(px)) * 4 + 3] <= 128) continue
        b.put((px / W) * ar, py / H, 0.5 + rand() * 0.45, 0.72 + rand() * 0.4); made++
    }
    b.dust()
    return b.f
}

/* a tree: every tip has a route back to the root, and the grains run the routes */
export function treeFig(n: number, rand: Rand): Fig {
    const ar = 1.02, b = make(n, ar, rand)
    const segs: Pt[][] = [], tips: { p: Pt; path: Pt[] }[] = [], forks: Pt[] = []
    const grow = (p0: Pt, aIn: number, ang: number, len: number, depth: number, path: Pt[]) => {
        const p1: Pt = [p0[0] + Math.sin(ang) * len, p0[1] - Math.cos(ang) * len]
        const seg = hermite(p0, aIn, p1, ang, len * 1.05)
        segs.push(seg)
        const here = path.concat(seg)
        if (depth === 0) { tips.push({ p: p1, path: here }); return }
        forks.push(p1)
        const spread = (0.34 + 0.2 * rand()) * (0.78 + depth * 0.075)
        grow(p1, ang, ang - spread * (0.85 + rand() * 0.3), len * (0.7 + rand() * 0.08), depth - 1, here)
        grow(p1, ang, ang + spread * (0.85 + rand() * 0.3), len * (0.7 + rand() * 0.08), depth - 1, here)
    }
    grow([0, 0], 0, 0, 0.3, 5, [])
    // fit the whole thing into the box
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9
    for (const s of segs) for (const p of s) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]) }
    const k = Math.min((ar * 0.9) / (x1 - x0), 0.92 / (y1 - y0)), ox = ar / 2 - ((x0 + x1) / 2) * k, oy = 0.5 - ((y0 + y1) / 2) * k
    const fit = (p: Pt): Pt => [p[0] * k + ox, p[1] * k + oy]
    for (const s of segs) b.f.lines.push({ c: b.curve(s.map(fit)), a: 0.2 })
    for (const t of tips) { b.f.paths.push(b.curve(t.path.map(fit))); const p = fit(t.p); b.node(p[0], p[1], 1.5) }
    for (const p of forks) { const q = fit(p); b.node(q[0], q[1], 1) }
    for (let q = b.count(0.66); q > 0; q--) b.run(b.f.paths[Math.floor(rand() * tips.length)], rand(), 0.028 + rand() * 0.04, 0.0035, 0.45 + rand() * 0.5, 0.8 + rand() * 0.6)
    for (let q = b.count(0.28); q > 0; q--) { const p = fit(tips[Math.floor(rand() * tips.length)].p); b.put(p[0] + b.g() * 0.035, p[1] + b.g() * 0.03, 0.2 + rand() * 0.45, 0.8 + rand() * 0.5) }
    b.dust()
    return b.f
}

/* the history as it ran: one bar per line of it, on one time axis */
export function timeFig(n: number, rand: Rand, now: number): Fig {
    const ar = 1.3, b = make(n, ar, rand), T0 = 2024, T1 = 2027
    const ym = (s: string) => { const [y, m, d] = s.trim().split(".").map(Number); return y + ((m || 1) - 1) / 12 + ((d || 1) - 1) / 365 }
    const X = (t: number) => ar * (0.05 + (0.9 * (t - T0)) / (T1 - T0))
    const rows = HISTORY.map((h, i) => {
        const [a, z] = h.date.split("~"), start = ym(a)
        return { y: 0.12 + i * 0.094, start, end: z === undefined ? start : z.trim() ? ym(z) + 1 / 12 : Infinity, point: z === undefined }
    })
    const total = rows.reduce((q, r) => q + Math.max(0.12, Math.min(r.end, T1) - r.start), 0)
    b.f.lines.push({ c: b.curve([[X(T0), 0.9], [X(T1), 0.9]]), a: 0.22 })
    for (let y = T0; y <= T1; y++) { b.f.lines.push({ c: b.curve([[X(y), 0.885], [X(y), 0.915]]), a: 0.4 }); b.label(X(y), 0.955, String(y)) }
    b.f.lines.push({ c: b.curve([[X(now), 0.06], [X(now), 0.9]]), a: 0.35, acc: true })
    b.label(X(now), 0.03, `${Math.floor(now)}.${String(Math.floor((now % 1) * 12) + 1).padStart(2, "0")}`, "center", false, true)
    for (const r of rows) {
        const share = b.count((0.9 * Math.max(0.12, Math.min(r.end, T1) - r.start)) / total)
        if (r.point) { b.node(X(r.start), r.y, 3.2, true, true); for (let q = share; q > 0; q--) b.put(X(r.start) + b.g() * 0.03, r.y + b.g() * 0.03, 0.4 + rand() * 0.5, 1, rand() < 0.35 ? 1 : 0); continue }
        const live = r.end === Infinity, done = Math.min(r.end, now), past = b.curve([[X(r.start), r.y], [X(done), r.y]])
        b.f.lines.push({ c: past, a: 0.3 })
        b.node(X(r.start), r.y, 1.7)
        if (live) b.node(X(now), r.y, 2.3, true); else if (r.end <= now) b.node(X(r.end), r.y, 1.7)
        let ahead = -1
        if (!live && r.end > now) { ahead = b.curve([[X(now), r.y], [X(r.end), r.y]]); b.f.lines.push({ c: ahead, a: 0.12 }); b.node(X(r.end), r.y, 1.4) }
        const split = ahead < 0 ? 1 : (done - r.start) / (r.end - r.start)
        // what is still running flows toward now; what is over stands still
        for (let q = share; q > 0; q--) {
            if (rand() < split) b.run(past, rand(), live ? 0.03 + rand() * 0.03 : 0, 0.0045, 0.45 + rand() * 0.5)
            else b.run(ahead, rand(), 0, 0.0045, 0.14 + rand() * 0.14)
        }
    }
    b.dust()
    return b.f
}

/* three hubs, four things each */
export function focusFig(n: number, rand: Rand): Fig {
    const ar = 1.25, b = make(n, ar, rand), cx = ar / 2, cy = 0.53
    const hubs = FOCUS.map((c, i) => { const a = -Math.PI / 2 + (i * Math.PI * 2) / FOCUS.length; return { a, x: cx + Math.cos(a) * 0.2, y: cy + Math.sin(a) * 0.2, c } })
    const spokes: number[] = [], rims: number[] = []
    hubs.forEach((h, i) => {
        const o = hubs[(i + 1) % hubs.length]
        rims.push(b.curve([[h.x, h.y], [o.x, o.y]]))
        b.f.lines.push({ c: rims[rims.length - 1], a: 0.16 })
        b.node(h.x, h.y, 2.8)
        b.label(h.x + Math.cos(h.a) * 0.245, h.y + Math.sin(h.a) * 0.245, h.c.name.toUpperCase())
        h.c.items.forEach((_, j) => {
            const a = h.a + (j - (h.c.items.length - 1) / 2) * 0.62, sx = h.x + Math.cos(a) * 0.17, sy = h.y + Math.sin(a) * 0.17
            spokes.push(b.curve([[h.x, h.y], [sx, sy]]))
            b.f.lines.push({ c: spokes[spokes.length - 1], a: 0.24 })
            b.node(sx, sy, 1.6)
            for (let q = b.count(0.22 / 12); q > 0; q--) b.put(sx + b.g() * 0.022, sy + b.g() * 0.022, 0.3 + rand() * 0.5)
        })
        for (let q = b.count(0.17 / 3); q > 0; q--) { const a = rand() * 6.283, r = 0.034 + b.g() * 0.006; b.put(h.x + Math.cos(a) * r, h.y + Math.sin(a) * r, 0.5 + rand() * 0.45) }
    })
    for (let q = b.count(0.42); q > 0; q--) b.run(spokes[Math.floor(rand() * spokes.length)], rand(), 0.05 + rand() * 0.06, 0.004, 0.4 + rand() * 0.5)
    for (let q = b.count(0.14); q > 0; q--) b.run(rims[Math.floor(rand() * rims.length)], rand(), 0.03 + rand() * 0.03, 0.004, 0.25 + rand() * 0.35)
    b.dust()
    return b.f
}

/* a frame: the grains run round whatever the section shows — a drawing, a picture */
export function frameFig(n: number, rand: Rand): Fig {
    const b = make(n, 1, rand, true)
    for (let i = 0; i < n; i++) {
        // a thin line of grains, and a wider haze of fainter ones round it
        const loose = rand() < 0.62
        b.f.cv[i] = 0; b.f.x[i] = rand(); b.f.y[i] = loose ? Math.abs(b.g()) * 15 + 2 : b.g() * 1.1; b.f.cs[i] = 0.004 + rand() * 0.008
        b.f.a[i] = loose ? 0.05 + rand() * 0.13 : 0.22 + rand() * 0.4; b.f.s[i] = 0.75 + rand() * 0.4
    }
    return b.f
}

/* what came in from three places and goes on as one */
export function fanFig(n: number, rand: Rand): Fig {
    const ar = 1.35, b = make(n, ar, rand)
    const merge: Pt = [0.82, 0.5], out: Pt = [1.2, 0.5], ys = [0.2, 0.5, 0.8]
    const paths = EXPERIENCE.map((e, i) => {
        const p: Pt = [0.14, ys[i]], bend = Array.from({ length: 25 }, (_, k) => { const t = k / 24, s = t * t * (3 - 2 * t); return [p[0] + (merge[0] - p[0]) * t, p[1] + (merge[1] - p[1]) * s] as Pt })
        b.node(p[0], p[1], 2.4)
        b.label(p[0] - 0.035, p[1] - 0.06, e.title, "left")
        for (let q = b.count(0.05); q > 0; q--) { const a = rand() * 6.283, r = 0.03 + b.g() * 0.006; b.put(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, 0.45 + rand() * 0.45) }
        const c = b.curve(bend.concat([out]))
        b.f.lines.push({ c, a: 0.2 })
        return c
    })
    b.node(merge[0], merge[1], 1.8)
    b.node(out[0], out[1], 3.4, true)
    b.label(out[0], out[1] + 0.085, ME.name, "center", false, true)
    for (let q = b.count(0.08); q > 0; q--) { const a = rand() * 6.283, r = 0.04 + b.g() * 0.008; b.put(out[0] + Math.cos(a) * r, out[1] + Math.sin(a) * r, 0.5 + rand() * 0.45, 1, rand() < 0.5 ? 1 : 0) }
    for (let q = b.count(0.7); q > 0; q--) b.run(paths[Math.floor(rand() * paths.length)], rand(), 0.05 + rand() * 0.05, 0.0055, 0.4 + rand() * 0.55)
    b.dust()
    return b.f
}

/* one point, and what circles it */
export function awardFig(n: number, rand: Rand): Fig {
    const b = make(n, 1, rand)
    for (let q = b.count(0.3); q > 0; q--) b.put(0.5 + b.g() * 0.035, 0.5 + b.g() * 0.035, 0.5 + rand() * 0.5, 1, rand() < 0.4 ? 1 : 0)
    for (const [r, share, sp] of [[0.19, 0.26, 0.018], [0.33, 0.3, -0.011]] as const) {
        const c = b.curve(circle(0.5, 0.5, r), true)
        b.f.lines.push({ c, a: 0.12 })
        for (let q = b.count(share); q > 0; q--) b.run(c, rand(), sp * (0.7 + rand() * 0.6), 0.006, 0.3 + rand() * 0.55)
    }
    b.node(0.5, 0.5, 4, true)
    b.dust()
    return b.f
}

/* how far the degree has run */
export function eduFig(n: number, rand: Rand, p: number, from: string, to: string): Fig {
    const b = make(n, 1, rand), r = 0.37, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * p
    const done = b.curve(circle(0.5, 0.5, r, a0, a1)), rest = b.curve(circle(0.5, 0.5, r, a1, a0 + Math.PI * 2))
    b.f.lines.push({ c: done, a: 0.42 }, { c: rest, a: 0.1 })
    for (let q = b.count(0.74); q > 0; q--) b.run(done, rand(), 0, 0.008, 0.45 + rand() * 0.5)
    for (let q = b.count(0.14); q > 0; q--) b.run(rest, rand(), 0, 0.006, 0.12 + rand() * 0.14)
    b.node(0.5 + Math.cos(a0) * r, 0.5 + Math.sin(a0) * r, 1.8)
    b.node(0.5 + Math.cos(a1) * r, 0.5 + Math.sin(a1) * r, 3.2, true)
    b.label(0.5, 0.49, `${Math.round(p * 100)}%`, "center", true)
    b.label(0.5, 0.6, `${from} → ${to}`)
    b.dust()
    return b.f
}

/* three marks */
export function certFig(n: number, rand: Rand): Fig {
    const ar = 2.5, b = make(n, ar, rand), r = 0.22
    CERTS.forEach((_, i) => {
        const x = ar * (0.17 + i * 0.33), y = 0.5
        const ring = b.curve(circle(x, y, r), true), tick = b.curve([[x - 0.1, y + 0.005], [x - 0.03, y + 0.075], [x + 0.11, y - 0.08]])
        b.f.lines.push({ c: ring, a: 0.2 }, { c: tick, a: 0.5 })
        for (let q = b.count(0.2); q > 0; q--) b.run(ring, rand(), 0.012 + rand() * 0.01, 0.006, 0.35 + rand() * 0.5)
        for (let q = b.count(0.1); q > 0; q--) b.run(tick, rand(), 0, 0.005, 0.55 + rand() * 0.45)
    })
    b.dust()
    return b.f
}

/* the end: everything settles into one line */
export function lineFig(n: number, rand: Rand): Fig {
    const ar = 6, b = make(n, ar, rand)
    const c = b.curve(Array.from({ length: 121 }, (_, k) => { const t = k / 120; return [t * ar, 0.5 + 0.1 * Math.sin(t * Math.PI * 3) * Math.sin(t * Math.PI)] as Pt }))
    b.f.lines.push({ c, a: 0.18 })
    for (let q = b.count(0.86); q > 0; q--) b.run(c, rand(), 0.012 + rand() * 0.016, 0.035, 0.3 + rand() * 0.6)
    for (let i = 0; i < n; i++) if (b.f.cv[i] < 0 && b.f.a[i] === 0) { b.f.x[i] = rand(); b.f.y[i] = 0.5 + b.g() * 0.3; b.f.a[i] = 0.1 + rand() * 0.1; b.f.s[i] = 0.8 }
    return b.f
}
