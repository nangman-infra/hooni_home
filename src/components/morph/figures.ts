import { CERTS, EXPERIENCE, FOCUS, HISTORY, ME, PHASES } from "@/components/trace/content"

/* The figures. One per section, each a drawing made of the same grains: where every grain sits (or
   which line it runs along), the hairlines under them, the nodes on them, and a few words.

   Everything is authored in a box whose height is 1 and whose width is `ar`, then stored with x
   divided by `ar`, so the engine can lay the box into whatever room the page gives it. */

export type Node = { x: number; y: number; r: number; acc?: boolean; ring?: boolean; at?: number }
export type Label = { x: number; y: number; t: string; al: CanvasTextAlign; big?: boolean; acc?: boolean }
export type Line = { c: number; a: number; acc?: boolean; at?: number }
export type Fig = {
    frame: boolean; ar: number
    x: Float32Array; y: Float32Array; a: Float32Array; s: Float32Array; acc: Uint8Array
    cv: Int16Array; cu: Float32Array; cs: Float32Array // the curve a grain runs along (-1: it stays put), where on it, how fast
    curves: Float32Array[]; closed: boolean[]
    lines: Line[]; nodes: Node[]; labels: Label[]
    paths: number[] // curves that can be picked out: on the tree, root to each tip
    grows?: boolean // drawn from its root outward when the page arrives: a line, a node (`at`) or a grain shows once the growth has reached it
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
    const node = (x: number, y: number, r: number, acc = false, ring = false, at?: number) => f.nodes.push({ x: x / ar, y, r, acc, ring, at })
    const label = (x: number, y: number, t: string, al: CanvasTextAlign = "center", big = false, acc = false) => f.labels.push({ x: x / ar, y, t, al, big, acc })
    // whatever is left over is dust in the air round the drawing
    const dust = () => { while (i < n) put(ar * (0.5 + g() * 0.42), 0.5 + g() * 0.4, 0.1 + rand() * 0.12, 0.8) }
    return { f, put, run, curve, node, label, dust, g, count: (share: number) => Math.round(n * share) }
}
const circle = (cx: number, cy: number, r: number, from = 0, to = Math.PI * 2, steps = 96): Pt[] => Array.from({ length: steps + 1 }, (_, k) => { const a = from + ((to - from) * k) / steps; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt })
const ellipse = (cx: number, cy: number, rx: number, ry: number, rot = 0, steps = 96): Pt[] => Array.from({ length: steps + 1 }, (_, k) => { const a = (k / steps) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)] as Pt })
const rrect = (x: number, y: number, w: number, h: number, r: number): Pt[] => [...circle(x + w - r, y + r, r, -Math.PI / 2, 0, 6), ...circle(x + w - r, y + h - r, r, 0, Math.PI / 2, 6), ...circle(x + r, y + h - r, r, Math.PI / 2, Math.PI, 6), ...circle(x + r, y + r, r, Math.PI, Math.PI * 1.5, 6), [x + w - r, y]]
const hermite = (p0: Pt, a0: number, p1: Pt, a1: number, pull: number, steps = 18): Pt[] => {
    const m0: Pt = [Math.sin(a0) * pull, -Math.cos(a0) * pull], m1: Pt = [Math.sin(a1) * pull, -Math.cos(a1) * pull]
    return Array.from({ length: steps + 1 }, (_, k) => {
        const t = k / steps, t2 = t * t, t3 = t2 * t, h0 = 2 * t3 - 3 * t2 + 1, h1 = t3 - 2 * t2 + t, h2 = -2 * t3 + 3 * t2, h3 = t3 - t2
        return [h0 * p0[0] + h1 * m0[0] + h2 * p1[0] + h3 * m1[0], h0 * p0[1] + h1 * m0[1] + h2 * p1[1] + h3 * m1[1]] as Pt
    })
}

/* the tree of the first screen: every tip has a route back to the root, and the grains run the routes.
   It is the grand one — a wide crown of sixty-four tips in blossom, some of it in the accent — and it
   grows: each branch, fork and grain knows how far from the root it is (`at`, or where it is on its
   route), and the engine shows it when the growth gets there. */
export function treeFig(n: number, rand: Rand): Fig {
    const ar = 1.5, b = make(n, ar, rand)
    b.f.grows = true
    const segs: { pts: Pt[]; from: number }[] = [], tips: { p: Pt; path: Pt[] }[] = [], forks: { p: Pt; far: number }[] = []
    let reach = 0
    const grow = (p0: Pt, aIn: number, ang: number, len: number, depth: number, path: Pt[], far: number) => {
        const p1: Pt = [p0[0] + Math.sin(ang) * len, p0[1] - Math.cos(ang) * len]
        const seg = hermite(p0, aIn, p1, ang, len * 1.05)
        segs.push({ pts: seg, from: far })
        const here = path.concat(seg)
        if (depth === 0) { tips.push({ p: p1, path: here }); reach = Math.max(reach, far + len); return }
        forks.push({ p: p1, far: far + len })
        const spread = (0.36 + 0.22 * rand()) * (0.74 + depth * 0.07)
        grow(p1, ang, ang - spread * (0.85 + rand() * 0.3), len * (0.7 + rand() * 0.08), depth - 1, here, far + len)
        grow(p1, ang, ang + spread * (0.85 + rand() * 0.3), len * (0.7 + rand() * 0.08), depth - 1, here, far + len)
    }
    grow([0, 0], 0, 0, 0.27, 6, [], 0)
    // fit the whole thing into the box, standing on its bottom edge
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9
    for (const s of segs) for (const p of s.pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]) }
    const k = Math.min((ar * 0.92) / (x1 - x0), 0.9 / (y1 - y0)), ox = ar / 2 - ((x0 + x1) / 2) * k, oy = 0.97 - y1 * k
    const fit = (p: Pt): Pt => [p[0] * k + ox, p[1] * k + oy]
    // lower branches are drawn stronger than the twigs
    for (const s of segs) b.f.lines.push({ c: b.curve(s.pts.map(fit)), a: 0.34 - 0.2 * (s.from / reach), at: s.from / reach })
    for (const t of tips) { b.f.paths.push(b.curve(t.path.map(fit))); const p = fit(t.p); b.node(p[0], p[1], 1.5, false, false, 1) }
    for (const f of forks) { const q = fit(f.p); b.node(q[0], q[1], 1, false, false, f.far / reach) }
    // the ground it stands on
    const root = fit([0, 0]), ground = b.curve([[root[0] - 0.34, root[1]], [root[0] + 0.34, root[1]]])
    b.f.lines.push({ c: ground, a: 0.16, at: 0 })
    for (let q = b.count(0.025); q > 0; q--) b.run(ground, 0.5 + b.g() * 0.3, 0, 0.003, 0.2 + rand() * 0.4, 0.8)
    // what goes up the routes, a little of it in the accent; and the trunk, which is thick
    for (let q = b.count(0.5); q > 0; q--) b.run(b.f.paths[Math.floor(rand() * tips.length)], rand(), 0.028 + rand() * 0.04, 0.0035, 0.45 + rand() * 0.5, 0.8 + rand() * 0.6, rand() < 0.03 ? 1 : 0)
    for (let q = b.count(0.05); q > 0; q--) b.run(b.f.paths[Math.floor(rand() * tips.length)], rand() * 0.3, 0, 0.011 * (1 - rand() * rand()), 0.3 + rand() * 0.5)
    // the blossom at every tip
    for (let q = b.count(0.38); q > 0; q--) { const p = fit(tips[Math.floor(rand() * tips.length)].p), big = rand() < 0.07; b.put(p[0] + b.g() * 0.042, p[1] + b.g() * 0.036, big ? 0.95 : 0.25 + rand() * 0.55, big ? 1.8 : 0.8 + rand() * 0.55, rand() < 0.26 ? 1 : 0) }
    b.dust()
    // blossom and the dust in the air come last
    for (let i = 0; i < n; i++) if (b.f.cv[i] < 0) b.f.cu[i] = 0.97 + rand() * 0.14
    return b.f
}

/* what the statement says — an architecture designed, built and run: three floors, one above the other.
   The lowest is the plan (a faint grid, open corners), the one over it is built (solid), the top one
   is running (grains going round and across it), and what is done on one floor goes up the posts to
   the next. The words beside the floors are the page's own. */
export function stackFig(n: number, rand: Rand): Fig {
    const ar = 1.2, b = make(n, ar, rand), cx = 0.47, A = 0.38, H = 0.125
    const floors = [0.77, 0.5, 0.23].map((cy) => ({ cy, L: [cx - A, cy] as Pt, T: [cx, cy - H] as Pt, R: [cx + A, cy] as Pt, B: [cx, cy + H] as Pt }))
    const mix = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
    floors.forEach((f, step) => {
        const rim = b.curve([f.L, f.T, f.R, f.B, f.L], true)
        // the lines across the floor, three each way
        const across = [0.25, 0.5, 0.75].flatMap((t) => [b.curve([mix(f.L, f.T, t), mix(f.B, f.R, t)]), b.curve([mix(f.L, f.B, t), mix(f.T, f.R, t)])])
        b.f.lines.push({ c: rim, a: [0.16, 0.32, 0.24][step] })
        across.forEach((c) => b.f.lines.push({ c, a: [0.08, 0.16, 0.12][step] }))
        ;[f.L, f.T, f.R, f.B].forEach((p) => b.node(p[0], p[1], step ? 2.2 : 2, false, step === 0))
        b.label(cx + A + 0.045, f.cy, (PHASES[step] ?? "").toUpperCase(), "left")
        if (step === 0) {
            // a plan: only dots where the lines cross
            for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) { const p = mix(mix(f.L, f.T, i / 4), mix(f.B, f.R, i / 4), j / 4); for (let q = 0; q < 3; q++) b.put(p[0] + b.g() * 0.003, p[1] + b.g() * 0.003, 0.3, 0.9) }
        } else if (step === 1) {
            // built: the edge and the lines are solid
            for (let q = b.count(0.16); q > 0; q--) b.run(rim, rand(), 0, 0.005, 0.4 + rand() * 0.55)
            for (let q = b.count(0.13); q > 0; q--) b.run(across[Math.floor(rand() * across.length)], rand(), 0, 0.004, 0.3 + rand() * 0.45)
        } else {
            // running: round the edge and along every line, a little of it in the accent
            b.node(cx, f.cy, 3, true)
            for (let q = b.count(0.19); q > 0; q--) b.run(rim, rand(), 0.025 + rand() * 0.02, 0.005, 0.45 + rand() * 0.5, 1, rand() < 0.08 ? 1 : 0)
            for (let q = b.count(0.19); q > 0; q--) b.run(across[Math.floor(rand() * across.length)], rand(), (rand() < 0.5 ? 1 : -1) * (0.07 + rand() * 0.07), 0.004, 0.4 + rand() * 0.5, 1, rand() < 0.08 ? 1 : 0)
        }
        if (step === 2) return
        // the posts up to the next floor, and what goes up them
        const up = floors[step + 1], posts = ([[f.L, up.L], [f.R, up.R], [f.B, up.B], [f.T, up.T]] as [Pt, Pt][]).map(([p, q]) => b.curve([p, q]))
        posts.forEach((c, i) => b.f.lines.push({ c, a: i < 3 ? 0.16 : 0.07 }))
        for (let q = b.count(0.075); q > 0; q--) b.run(posts[Math.floor(rand() * 3)], rand(), 0.12 + rand() * 0.1, 0.004, 0.35 + rand() * 0.5)
    })
    b.dust()
    return b.f
}

/* the history as it ran: one bar per line of it, on one time axis */
/* `room`: the shape of the figure's room and, for each row, the height of its line in the list beside
   it (morph.tsx measures them), so that every bar stands level with its words. Without it (a phone,
   where the two are stacked) the rows are evenly spaced. */
export function timeFig(n: number, rand: Rand, now: number, room?: { ar: number; ys: number[] }): Fig {
    const ar = room?.ar ?? 1.3, b = make(n, ar, rand), T0 = 2024, T1 = 2027
    const ym = (s: string) => { const [y, m, d] = s.trim().split(".").map(Number); return y + ((m || 1) - 1) / 12 + ((d || 1) - 1) / 365 }
    const X = (t: number) => ar * (0.05 + (0.9 * (t - T0)) / (T1 - T0))
    const rows = HISTORY.map((h, i) => {
        const [a, z] = h.date.split("~"), start = ym(a)
        return { y: room?.ys[i] ?? 0.12 + i * 0.094, start, end: z === undefined ? start : z.trim() ? ym(z) + 1 / 12 : Infinity, point: z === undefined }
    })
    const axis = room ? Math.min(0.94, rows[rows.length - 1].y + 0.1) : 0.9, top = room ? Math.max(0.05, rows[0].y - 0.08) : 0.06
    const weight = (r: (typeof rows)[number]) => (r.point ? 0.16 : Math.max(0.12, Math.min(r.end, T1) - r.start))
    const total = rows.reduce((q, r) => q + weight(r), 0)
    b.f.lines.push({ c: b.curve([[X(T0), axis], [X(T1), axis]]), a: 0.22 })
    for (let y = T0; y <= T1; y++) { b.f.lines.push({ c: b.curve([[X(y), axis - 0.015], [X(y), axis + 0.015]]), a: 0.4 }); b.label(X(y), axis + 0.055, String(y)) }
    b.f.lines.push({ c: b.curve([[X(now), top], [X(now), axis]]), a: 0.35, acc: true })
    b.label(X(now), top - 0.03, `${Math.floor(now)}.${String(Math.floor((now % 1) * 12) + 1).padStart(2, "0")}`, "center", false, true)
    for (const r of rows) {
        const share = b.count((0.9 * weight(r)) / total)
        if (r.point) {
            // a prize won on a day: a small sun — a core, a ring turning round it, and rays going out
            const c: Pt = [X(r.start), r.y], ring = b.curve(circle(c[0], c[1], 0.021), true)
            const rays = Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return b.curve([[c[0] + Math.cos(a) * 0.028, c[1] + Math.sin(a) * 0.028], [c[0] + Math.cos(a) * 0.047, c[1] + Math.sin(a) * 0.047]]) })
            b.node(c[0], c[1], 3.2, true)
            for (let q = share; q > 0; q--) {
                const pick = rand()
                if (pick < 0.22) b.put(c[0] + b.g() * 0.007, c[1] + b.g() * 0.007, 0.5 + rand() * 0.45, 1, 1)
                else if (pick < 0.62) b.run(ring, rand(), 0.1 + rand() * 0.05, 0.0035, 0.45 + rand() * 0.5, 1, 1)
                else b.run(rays[Math.floor(rand() * rays.length)], rand(), 0.28 + rand() * 0.2, 0.0025, 0.4 + rand() * 0.5, 1, rand() < 0.8 ? 1 : 0)
            }
            continue
        }
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
/* the prize: a trophy in the round, made of nothing but grains. It is a shape turned on a lathe — a
   cup, a stem, a foot, a block to stand on — seen from a little above; every grain goes round it at
   its own height, which is what makes it solid. The two handles stand still. */
export function awardFig(n: number, rand: Rand): Fig {
    const b = make(n, 1, rand), cx = 0.5, tilt = 0.24
    // its side, from the rim down: how wide it is at each height
    const side: Pt[] = [...Array.from({ length: 15 }, (_, k) => [0.035 + 0.165 * Math.sqrt(1 - (k / 14) ** 2), 0.18 + 0.34 * (k / 14)] as Pt), [0.03, 0.56], [0.05, 0.59], [0.03, 0.62], [0.032, 0.66], [0.07, 0.69], [0.12, 0.715], [0.16, 0.72], [0.16, 0.8]]
    // hoops at even steps down the side
    const len = [0]
    for (let k = 1; k < side.length; k++) len.push(len[k - 1] + Math.hypot(side[k][0] - side[k - 1][0], side[k][1] - side[k - 1][1]))
    const hoops: { w: number; c: number }[] = []
    for (let q = 0, k = 1; q < 52; q++) {
        const d = (q / 51) * len[len.length - 1]
        while (k < side.length - 1 && len[k] < d) k++
        const t = (d - len[k - 1]) / (len[k] - len[k - 1] || 1), w = side[k - 1][0] + (side[k][0] - side[k - 1][0]) * t, y = side[k - 1][1] + (side[k][1] - side[k - 1][1]) * t
        hoops.push({ w, c: b.curve(ellipse(cx, y, w, w * tilt), true) })
    }
    const girth = hoops.reduce((q, h) => q + Math.max(h.w, 0.03), 0)
    for (const h of hoops) for (let q = b.count((0.8 * Math.max(h.w, 0.03)) / girth); q > 0; q--) b.run(h.c, rand(), 0.03 + rand() * 0.006, 0.0035, 0.3 + rand() * 0.6, 0.8 + rand() * 0.5, rand() < 0.35 ? 1 : 0)
    // the rim is the brightest line of it
    for (let q = b.count(0.05); q > 0; q--) b.run(hoops[0].c, rand(), 0.03 + rand() * 0.006, 0.002, 0.6 + rand() * 0.4, 1, rand() < 0.35 ? 1 : 0)
    for (const way of [-1, 1]) {
        const ear = b.curve(Array.from({ length: 17 }, (_, k) => { const t = k / 16, u = 1 - t; return [cx + way * (u * u * 0.195 + 2 * u * t * 0.38 + t * t * 0.125), u * u * 0.21 + 2 * u * t * 0.27 + t * t * 0.43] as Pt }))
        for (let q = b.count(0.045); q > 0; q--) b.run(ear, rand(), 0, 0.006, 0.3 + rand() * 0.55, 1, rand() < 0.35 ? 1 : 0)
    }
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
    const ar = 1.25, b = make(n, ar, rand), W = 0.8, H = 0.22
    // three certificates, one below and a little to the right of the last: a name, two lines of print, and a seal with a tick
    CERTS.forEach((cert, i) => {
        const x = 0.06 + i * 0.14, y = 0.06 + i * 0.33, sheet = b.curve(rrect(x, y, W, H, 0.028), true)
        b.f.lines.push({ c: sheet, a: 0.22 })
        for (let q = b.count(0.2); q > 0; q--) b.run(sheet, rand(), 0.012 + rand() * 0.01, 0.0045, 0.35 + rand() * 0.5)
        b.label(x + 0.055, y + 0.07, cert.name.toUpperCase(), "left")
        for (const [w, dy] of [[0.4, 0.125], [0.29, 0.16]] as const) { const c = b.curve([[x + 0.055, y + dy], [x + 0.055 + w, y + dy]]); b.f.lines.push({ c, a: 0.13 }); for (let q = b.count(0.012); q > 0; q--) b.run(c, rand(), 0, 0.002, 0.2 + rand() * 0.25, 0.8) }
        const sx = x + W - 0.115, sy = y + H / 2, seal = b.curve(circle(sx, sy, 0.058), true), tick = b.curve([[sx - 0.028, sy + 0.002], [sx - 0.008, sy + 0.022], [sx + 0.03, sy - 0.022]])
        b.f.lines.push({ c: seal, a: 0.7, acc: true }, { c: tick, a: 0.9 })
        for (let q = b.count(0.06); q > 0; q--) b.run(seal, rand(), 0.02 + rand() * 0.015, 0.006, 0.4 + rand() * 0.5, 1, 1)
        for (let q = b.count(0.02); q > 0; q--) b.run(tick, rand(), 0, 0.003, 0.6 + rand() * 0.4)
    })
    b.dust()
    return b.f
}

/* the end: everything settles into one line */
/* the last screen: the roots of the tree the page began with, under the ground the last words stand on.
   They are made the way the tree is — every tip has a route back to where the trunk comes down — but
   turned over, spread wide and less regular; and what moves in them moves up, toward the trunk. */
// `reach`: where each of the ways to reach him is (the foot of each, in the box's units, above the box), so the
// trunk can come up out of the ground and branch into them
export function rootFig(n: number, rand: Rand, reach?: Pt[]): Fig {
    const ar = 2.3, b = make(n, ar, rand)
    const segs: { pts: Pt[]; from: number }[] = [], tips: { p: Pt; path: Pt[] }[] = [], forks: Pt[] = []
    let far0 = 0
    // grown upward like the tree, and turned over when it is fitted into the box
    const grow = (p0: Pt, aIn: number, ang: number, len: number, depth: number, path: Pt[], far: number) => {
        const p1: Pt = [p0[0] + Math.sin(ang) * len, p0[1] - Math.cos(ang) * len]
        const seg = hermite(p0, aIn, p1, ang, len * 1.05)
        segs.push({ pts: seg, from: far })
        const here = path.concat(seg)
        if (depth === 0) { tips.push({ p: p1, path: here }); far0 = Math.max(far0, far + len); return }
        forks.push(p1)
        const spread = (0.42 + 0.3 * rand()) * (0.8 + depth * 0.05)
        // a root wanders, but never turns back up through the ground
        for (const way of [-1, 1]) grow(p1, ang, Math.max(-1.45, Math.min(1.45, ang + way * spread * (0.8 + rand() * 0.4) + (rand() - 0.5) * 0.35)), len * (0.68 + rand() * 0.14), depth - 1, here, far + len)
    }
    ;([[-1.15, 0.3], [-0.4, 0.26], [0.35, 0.27], [1.1, 0.3]] as const).forEach(([a, len]) => grow([0, 0], a, a, len, 4, [], 0))
    let x0 = 1e9, x1 = -1e9, y0 = 1e9
    for (const s of segs) for (const p of s.pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]) }
    const top = 0.1, k = Math.min((ar * 0.94) / (x1 - x0), 0.84 / -y0), ox = ar / 2 - ((x0 + x1) / 2) * k
    const fit = (p: Pt): Pt => [p[0] * k + ox, top - p[1] * k]
    for (const s of segs) b.f.lines.push({ c: b.curve(s.pts.map(fit)), a: 0.32 - 0.2 * (s.from / far0) })
    for (const t of tips) { b.f.paths.push(b.curve(t.path.map(fit))); const p = fit(t.p); b.node(p[0], p[1], 1.2) }
    for (const f of forks) { const q = fit(f); b.node(q[0], q[1], 0.9) }
    // the ground
    const root = fit([0, 0]), ground = b.curve([[ar * 0.06, top], [ar * 0.94, top]])
    b.f.lines.push({ c: ground, a: 0.18 })
    for (let q = b.count(0.035); q > 0; q--) b.run(ground, rand(), 0, 0.003, 0.18 + rand() * 0.35, 0.8)
    // the trunk comes up out of it and branches, one branch into each of the ways to reach him; what the roots
    // take up goes on up the trunk and out along the branches into them
    if (reach?.length) {
        const fork: Pt = [root[0], top - 0.45 * (top - Math.min(...reach.map((r) => r[1])))], trunk = b.curve([root, fork])
        b.f.lines.push({ c: trunk, a: 0.34 })
        for (let q = b.count(0.03); q > 0; q--) b.run(trunk, rand(), 0.25 + rand() * 0.2, 0.0045, 0.5 + rand() * 0.45)
        const arms = reach.map((r) => b.curve(hermite(fork, 0, r, 0, Math.hypot(r[0] - fork[0], r[1] - fork[1]) * 0.9, 24)))
        arms.forEach((c) => b.f.lines.push({ c, a: 0.28 }))
        for (let q = b.count(0.05); q > 0; q--) b.run(arms[Math.floor(rand() * arms.length)], rand(), 0.3 + rand() * 0.25, 0.0035, 0.45 + rand() * 0.5, 1, rand() < 0.06 ? 1 : 0)
    }
    // what the roots take up goes toward the trunk; and the fine hair at every tip
    for (let q = b.count(0.68); q > 0; q--) b.run(b.f.paths[Math.floor(rand() * tips.length)], rand(), -(0.03 + rand() * 0.04), 0.0035, 0.4 + rand() * 0.5, 0.8 + rand() * 0.6, rand() < 0.03 ? 1 : 0)
    for (let q = b.count(0.2); q > 0; q--) { const p = fit(tips[Math.floor(rand() * tips.length)].p); b.put(p[0] + b.g() * 0.026, p[1] + b.g() * 0.022, 0.15 + rand() * 0.4, 0.8 + rand() * 0.4, rand() < 0.08 ? 1 : 0) }
    b.dust()
    return b.f
}
