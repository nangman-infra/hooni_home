import { mulberry } from "@/components/particle/tree"
import { CERTS, EXPERIENCE, FOCUS, HISTORY, ME, PHASES } from "@/components/trace/content"

/* The figures. One per section, each a drawing made of the same grains: where every grain sits (or
   which line it runs along), the hairlines under them, the nodes on them, and a few words.

   Everything is authored in a box whose height is 1 and whose width is `ar`, then stored with x
   divided by `ar`, so the engine can lay the box into whatever room the page gives it. */

export type Node = { x: number; y: number; r: number; acc?: boolean; ring?: boolean; at?: number; blink?: number } // blink: under 1 a light that breathes, from 1 one that is busy (bursts of quick blinks); the fraction is its own pace
export type Label = { x: number; y: number; t: string; al: CanvasTextAlign; big?: boolean; acc?: boolean }
export type Line = { c: number; a: number; acc?: boolean; at?: number }
export type Fig = {
    frame: boolean; ar: number
    x: Float32Array; y: Float32Array; a: Float32Array; s: Float32Array; acc: Uint8Array
    cv: Int16Array; cu: Float32Array; cs: Float32Array // the curve a grain runs along (-1: it stays put), where on it, how fast
    curves: Float32Array[]; closed: boolean[]
    lines: Line[]; nodes: Node[]; labels: Label[]
    paths: number[] // curves that can be picked out: on the racks, server to server
    grows?: boolean // built up when the page arrives: a line or a node (`at`) shows once the growth has reached it
    at?: Float32Array // ... and so does each grain
}

export const SAMPLES = 72
type Pt = [number, number]
type Rand = () => number

function make(n: number, ar: number, rand: Rand, frame = false) {
    const f: Fig = {
        frame, ar, x: new Float32Array(n), y: new Float32Array(n), a: new Float32Array(n), s: new Float32Array(n), acc: new Uint8Array(n),
        cv: new Int16Array(n).fill(-1), cu: new Float32Array(n), cs: new Float32Array(n), curves: [], closed: [], lines: [], nodes: [], labels: [], paths: [],
    }
    let i = 0, when = 0
    const g = () => (rand() + rand() + rand() - 1.5) * 0.82
    // a grain at a place
    const put = (x: number, y: number, a: number, s = 1, acc = 0) => { if (i >= n) return; f.x[i] = x / ar; f.y[i] = y; f.a[i] = a; f.s[i] = s; f.acc[i] = acc; if (f.at) f.at[i] = when; i++ }
    // a grain running along a curve, a little off its centre
    const run = (c: number, u: number, speed: number, off: number, a: number, s = 1, acc = 0) => { if (i >= n) return; f.cv[i] = c; f.cu[i] = u; f.cs[i] = speed; f.x[i] = (g() * off) / ar; f.y[i] = g() * off; f.a[i] = a; f.s[i] = s; f.acc[i] = acc; if (f.at) f.at[i] = when; i++ }
    // a polyline, resampled along its length
    const curve = (pts: Pt[], closed = false) => { f.curves.push(resample(pts, ar)); f.closed.push(closed); return f.curves.length - 1 }
    const node = (x: number, y: number, r: number, acc = false, ring = false, at?: number, blink?: number) => f.nodes.push({ x: x / ar, y, r, acc, ring, at, blink })
    const label = (x: number, y: number, t: string, al: CanvasTextAlign = "center", big = false, acc = false) => f.labels.push({ x: x / ar, y, t, al, big, acc })
    // whatever is left over is dust in the air round the drawing
    const dust = () => { while (i < n) put(ar * (0.5 + g() * 0.42), 0.5 + g() * 0.4, 0.1 + rand() * 0.12, 0.8) }
    // the grains placed from now on show once the growth has got to v
    const from = (v: number) => { if (!f.grows) return; f.at ??= new Float32Array(n); when = v }
    return { f, put, run, curve, node, label, dust, from, g, count: (share: number) => Math.round(n * share) }
}
type B = ReturnType<typeof make>
// a polyline as SAMPLES points (x divided by ar), evenly along its length — except that every sharp corner gets a point of
// its own, so that a right angle stays a right angle instead of being cut across
function resample(pts: Pt[], ar: number): Float32Array {
    const len = [0]
    for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
    const out = new Float32Array(SAMPLES * 2)
    let k = 1
    stops(pts, len).forEach((d, q) => {
        while (k < pts.length - 1 && len[k] < d) k++
        const w = (d - len[k - 1]) / (len[k] - len[k - 1] || 1)
        out[q * 2] = (pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * w) / ar; out[q * 2 + 1] = pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * w
    })
    return out
}
// where along the line (as distances) the SAMPLES points go: the stretches between sharp corners share them by length
function stops(pts: Pt[], len: number[]): number[] {
    const total = len[len.length - 1] || 1, cut = [0], free = SAMPLES - 1
    for (let k = 1; k < pts.length - 1; k++) {
        const a = Math.atan2(pts[k][1] - pts[k - 1][1], pts[k][0] - pts[k - 1][0]), b = Math.atan2(pts[k + 1][1] - pts[k][1], pts[k + 1][0] - pts[k][0])
        const sharp = Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))) > 0.5 && len[k] - len[k - 1] > 1e-6 && len[k + 1] - len[k] > 1e-6
        if (sharp) cut.push(len[k])
    }
    cut.push(total)
    // too many corners to give each a point: evenly, as before
    if (cut.length > free / 2) return Array.from({ length: SAMPLES }, (_, q) => (q / free) * total)
    const share = cut.slice(1).map((c, s) => Math.max(1, Math.round(((c - cut[s]) / total) * free)))
    share[share.indexOf(Math.max(...share))] += free - share.reduce((sum, m) => sum + m, 0)
    const d = [0]
    share.forEach((m, s) => { for (let q = 1; q <= m; q++) d.push(cut[s] + ((cut[s + 1] - cut[s]) * q) / m) })
    return d
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

/* the first screen: a row of racks in a data hall, from the front. Each is filled from the floor up — servers,
   bigger servers, shelves of disks, a gap here and there — under the switch they are cabled to and a patch
   panel. The cables go up the managers between the racks into the tray overhead and across, and a route is
   one server to a server in another rack: packets run the routes, each route at its own pace and both ways.
   The lights do what lights in a hall do: some steady, some breathing, some busy. It is built when the page
   arrives: the racks fill from the bottom up, and as they top out the cables come in. */
const RW = 0.2, GAP = 0.035, RT = 0.19, FL = 0.95, SLOTS = 26, SLOT = (FL - RT - 0.024) / SLOTS, TRAY = 0.09
const DISKS = 3, SWITCH = 4, PATCH = 5 // a unit's kind; 1–3 is also its height in slots (1, 2: servers)
type Unit = { x: number; y: number; w: number; h: number; kind: number; at: number }
// the face of each kind, as rows of dots (vents, bays, ports): [columns, rows, spacing, brightness]
const FACE: Record<number, [number, number, number, number]> = { 1: [5, 1, 0.006, 0.3], 2: [6, 2, 0.012, 0.35], 3: [7, 3, 0.014, 0.4], 4: [12, 2, 0.0085, 0.5], 5: [16, 1, 0.0085, 0.5] }
// where the racks stand in the first screen's box, and the cable managers between them: a rack uses the one on its
// right, the last one the one on its left, so the row is the same both ways
const XS = Array.from({ length: 5 }, (_, r) => 0.18 + r * (RW + GAP)), LANES = XS.slice(1).map((x) => x - GAP / 2)
// what the racks hold: the same every time, so that the last screen can show the backs of the very same racks
const hall = () => { const rand = mulberry(11); return XS.map((x, r) => fill(rand, x, 0.1 + r * 0.03)) }

// what one rack holds, from the floor up; `lag`: when it starts to fill
function fill(rand: Rand, x: number, lag: number): Unit[] {
    const out: Unit[] = []
    const slot = (s: number, h: number, kind: number) => out.push({ x: x + 0.014, y: FL - 0.012 - (s + h) * SLOT + 0.003, w: RW - 0.028, h: h * SLOT - 0.006, kind, at: lag + 0.74 * (s / SLOTS) })
    let s = 0
    while (s < SLOTS - 2) {
        // now and then a slot or two left empty
        if (rand() < 0.15) { s += 1 + Math.floor(rand() * 2); continue }
        const h = Math.min([1, 1, 1, 2, 2, 3][Math.floor(rand() * 6)], SLOTS - 2 - s)
        slot(s, h, h)
        s += h
    }
    slot(SLOTS - 2, 1, SWITCH)
    slot(SLOTS - 1, 1, PATCH)
    return out
}
// a cable from a server in one rack to a server in another: out of the side of it nearer the manager its rack uses, up the
// manager into the tray, across, down and in
function route(units: Unit[][], rand: Rand) {
    const a = Math.floor(rand() * units.length), z = (a + 1 + Math.floor(rand() * (units.length - 1))) % units.length
    const lane = (r: number) => LANES[Math.min(r, LANES.length - 1)] + (rand() - 0.5) * 0.008
    const pick = (r: number) => { const s = units[r].filter((u) => u.kind <= DISKS); return s[Math.floor(rand() * s.length)] }
    const port = (u: Unit, x: number): Pt => [x > u.x ? u.x + u.w - 0.012 : u.x + 0.012, u.y + u.h / 2]
    const la = lane(a), lz = lane(z), u = pick(a), v = pick(z), p = port(u, la), q = port(v, lz), y = TRAY + (rand() - 0.5) * 0.022
    // the light it starts from shows with the server it is on
    return { pts: [p, [la, p[1]], [la, y], [lz, y], [lz, q[1]], q] as Pt[], start: p, at: u.at + 0.05 }
}
// a rack's frame and rails, [x, y, w, h]
function rack(b: B, [x, y, w, h]: number[], at: number, rand: Rand, grains: number) {
    b.from(at)
    const frame = b.curve(rrect(x, y, w, h, 0.006), true)
    b.f.lines.push({ c: frame, a: 0.3, at })
    for (const rx of [x + 0.008, x + w - 0.008]) b.f.lines.push({ c: b.curve([[rx, y + 0.01], [rx, y + h - 0.01]]), a: 0.07, at })
    for (let q = grains; q > 0; q--) b.run(frame, rand(), 0.003 + rand() * 0.004, 0.003, 0.3 + rand() * 0.5, 0.9)
}
// a unit's outline and (with `face`) its face: vents, bays, ports
function shell(b: B, u: Unit, rand: Rand, dens: number, face = true) {
    const c = b.curve(rrect(u.x, u.y, u.w, u.h, 0.003), true)
    b.f.lines.push({ c, a: 0.18, at: u.at })
    for (let q = Math.round(2 * (u.w + u.h) * dens); q > 0; q--) b.run(c, rand(), 0, 0.0015, 0.22 + rand() * 0.38, 0.8)
    if (!face) return
    const [cols, rows, dx, a] = FACE[u.kind]
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) b.put(u.x + 0.016 + k * dx, u.y + ((r + 0.5) / rows) * u.h, a, 0.85)
}
// the front of a unit, and its lights: one steady; one busy with what the server is doing, or breathing (a few of those in
// the accent); on the switch, a light over every other port, busy
function unit(b: B, u: Unit, rand: Rand, dens: number) {
    b.from(u.at)
    shell(b, u, rand, dens)
    const lx = u.x + u.w - 0.012, cy = u.y + u.h / 2, mood = rand()
    b.node(lx - 0.011, cy, 0.8, false, false, u.at + 0.04)
    b.node(lx, cy, 1.05, mood > 0.92, false, u.at + 0.05, mood < 0.5 ? 1 + rand() : rand())
    if (u.kind === SWITCH) for (let k = 0; k < 12; k += 2) b.node(u.x + 0.016 + k * 0.0085, u.y + u.h * 0.25, 0.55, false, false, u.at + 0.05, 1 + rand())
}
// the raised floor the racks stand on, [x0, x1, y]: the tiles and their seams
function deck(b: B, [x0, x1, y]: number[], rand: Rand, share: number) {
    b.from(0)
    const c = b.curve([[x0, y], [x1, y]])
    b.f.lines.push({ c, a: 0.2, at: 0 }, { c: b.curve([[x0, y + 0.022], [x1, y + 0.022]]), a: 0.08, at: 0 })
    for (let x = x0 + 0.06; x < x1 - 0.01; x += 0.1) b.f.lines.push({ c: b.curve([[x, y], [x, y + 0.022]]), a: 0.1, at: 0 })
    for (let q = b.count(share); q > 0; q--) b.run(c, rand(), 0, 0.003, 0.2 + rand() * 0.4, 0.8)
}
// what goes along the cables (the figure's paths): packets — short trains of grains, each cable at its own pace, some of them
// going back the other way (`back`: how many) — over a thin steady flow
function traffic(b: B, rand: Rand, share: number, back: number) {
    const P = b.f.paths, pace = P.map(() => 0.02 + rand() * 0.06)
    for (let q = b.count(share * 0.3); q > 0; q--) b.run(P[Math.floor(rand() * P.length)], rand(), 0.012 + rand() * 0.02, 0.0025, 0.2 + rand() * 0.3, 0.8)
    let left = b.count(share * 0.7)
    while (left > 0) {
        const k = Math.floor(rand() * P.length), u = rand(), many = 4 + Math.floor(rand() * 12), acc = rand() < 0.03 ? 1 : 0, sp = pace[k] * (rand() < back ? -1 : 1) * (1 - 0.3 * acc)
        for (let q = 0; q < many; q++) b.run(P[k], u + q * 0.004, sp, 0.0016, 0.55 + rand() * 0.45, 0.9 + rand() * 0.4, acc)
        left -= many
    }
}
export function rackFig(n: number, rand: Rand): Fig {
    const ar = 1.5, b = make(n, ar, rand), units = hall()
    b.f.grows = true
    // the routes come first: the light each starts from is the node the pointer picks
    for (let k = 0; k < 18; k++) { const r = route(units, rand); b.f.paths.push(b.curve(r.pts)); b.node(r.start[0], r.start[1], 1.3, false, false, r.at) }
    deck(b, [0.04, ar - 0.04, FL], rand, 0.025)
    XS.forEach((x, r) => rack(b, [x, RT, RW, FL - RT], 0.02 + r * 0.03, rand, b.count(0.025)))
    const all = units.flat(), dens = b.count(0.3) / all.reduce((sum, u) => sum + 2 * (u.w + u.h), 0)
    for (const u of all) unit(b, u, rand, dens)
    // the tray overhead (a ladder), the managers down from it, and what goes along the cables
    const t0 = XS[0] + 0.02, t1 = XS[XS.length - 1] + RW - 0.02
    for (const y of [TRAY - 0.016, TRAY + 0.016]) b.f.lines.push({ c: b.curve([[t0, y], [t1, y]]), a: 0.16, at: 0.86 })
    for (let x = t0; x <= t1 + 0.001; x += (t1 - t0) / 36) b.f.lines.push({ c: b.curve([[x, TRAY - 0.016], [x, TRAY + 0.016]]), a: 0.07, at: 0.86 })
    for (const x of LANES) b.f.lines.push({ c: b.curve([[x, TRAY + 0.016], [x, FL]]), a: 0.09, at: 0.84 })
    b.from(0.9)
    traffic(b, rand, 0.36, 0.3)
    b.dust()
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
    const ar = 1.25, b = make(n, ar, rand), W = 0.8, many = CERTS.length, gaps = Math.max(1, many - 1)
    // one certificate under the other, each a little to the right of the last, as many as there are (three keep the
    // spacing they had): a name, two lines of print, and a seal with a tick. The grains are shared out among them.
    const H = Math.min(0.22, 0.84 / many - 0.03), dy = (0.88 - H) / gaps, dx = Math.min(0.14, (ar - 0.12 - W) / gaps), k = H / 0.22, share = 3 / many
    CERTS.forEach((cert, i) => {
        const x = 0.06 + i * dx, y = 0.06 + i * dy, sheet = b.curve(rrect(x, y, W, H, 0.028), true)
        b.f.lines.push({ c: sheet, a: 0.22 })
        for (let q = b.count(0.2 * share); q > 0; q--) b.run(sheet, rand(), 0.012 + rand() * 0.01, 0.0045, 0.35 + rand() * 0.5)
        b.label(x + 0.055, y + 0.07 * k, cert.name.toUpperCase(), "left")
        for (const [w, at] of [[0.4, 0.125], [0.29, 0.16]] as const) { const c = b.curve([[x + 0.055, y + at * k], [x + 0.055 + w, y + at * k]]); b.f.lines.push({ c, a: 0.13 }); for (let q = b.count(0.012 * share); q > 0; q--) b.run(c, rand(), 0, 0.002, 0.2 + rand() * 0.25, 0.8) }
        const sx = x + W - 0.115, sy = y + H / 2, seal = b.curve(circle(sx, sy, 0.058 * k), true), tick = b.curve([[sx - 0.028 * k, sy + 0.002 * k], [sx - 0.008 * k, sy + 0.022 * k], [sx + 0.03 * k, sy - 0.022 * k]])
        b.f.lines.push({ c: seal, a: 0.7, acc: true }, { c: tick, a: 0.9 })
        for (let q = b.count(0.06 * share); q > 0; q--) b.run(seal, rand(), 0.02 + rand() * 0.015, 0.006, 0.4 + rand() * 0.5, 1, 1)
        for (let q = b.count(0.02 * share); q > 0; q--) b.run(tick, rand(), 0, 0.003, 0.6 + rand() * 0.4)
    })
    b.dust()
    return b.f
}

/* the last screen: the backs of the same racks — the other side of the first screen, the way the roots were the other
   side of the tree. Seen from behind the row is the other way round. Every server's cable leaves from its back, goes to
   the manager beside its rack and up out of the top; the cables of each manager bundle and curve in together, and the one
   bundle goes up and branches into the ways to reach him. What the servers send goes up the cables to them. */
const BS = 0.88, BTOP = 0.3 // the racks at this size, and where their tops stand, in the last screen's box
// the back of a unit: its outline, a power supply on the side away from the cables, its ports, and a busy link light
function back(b: B, u: Unit, left: boolean, rand: Rand, dens: number) {
    shell(b, u, rand, dens, u.kind > DISKS)
    if (u.kind > DISKS) return
    const dir = left ? 1 : -1, near = left ? u.x + 0.01 : u.x + u.w - 0.01, cy = u.y + u.h / 2
    b.f.lines.push({ c: b.curve(rrect(left ? u.x + u.w - 0.04 : u.x + 0.008, u.y + u.h * 0.2, 0.032, u.h * 0.6, 0.002), true), a: 0.12 })
    for (let k = 0; k < 3; k++) b.put(near + dir * (0.012 + k * 0.007), cy, 0.45, 0.85)
    b.node(near + dir * 0.006, cy - u.h * 0.22, 0.7, false, false, undefined, 1 + rand())
}
// `reach`: where each of the ways to reach him is (the foot of each, in the box's units, above the box), so the
// bundle can branch into them
export function backFig(n: number, rand: Rand, reach?: Pt[]): Fig {
    const ar = 2.3, b = make(n, ar, rand), mid = ar / 2
    const X = (x: number) => mid + BS * (0.75 - x), Y = (y: number) => BTOP + BS * (y - RT)
    const racks = hall().map((r) => r.map((u) => ({ ...u, x: X(u.x + u.w), y: Y(u.y), w: BS * u.w, h: BS * u.h }))), lanes = LANES.map(X)
    const base: Pt = [mid, 0.05], fork: Pt | undefined = reach?.length ? [mid, base[1] - 0.45 * (base[1] - Math.min(...reach.map((r) => r[1])))] : undefined
    const up = (p: Pt, q: Pt, steps: number) => hermite(p, 0, q, 0, Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.9, steps).slice(1)
    // the cables come first: the port each leaves from is the node the pointer picks
    racks.forEach((r, k) => {
        const L = lanes[Math.min(k, lanes.length - 1)]
        for (const u of r.filter((w) => w.kind <= DISKS)) {
            const o = (rand() - 0.5) * 0.008, p: Pt = [L < u.x ? u.x + 0.01 : u.x + u.w - 0.01, u.y + u.h / 2], top: Pt = [L + o, BTOP - 0.025]
            const pts: Pt[] = [p, [L + o, p[1]], top, ...up(top, [base[0] + o * 0.4, base[1]], 16)]
            if (fork && reach) pts.push(fork, ...up(fork, reach[Math.floor(rand() * reach.length)], 20))
            b.f.paths.push(b.curve(pts)); b.node(p[0], p[1], 1, false, false)
        }
    })
    deck(b, [X(1.46), X(0.04), Y(FL)], rand, 0.02)
    XS.forEach((x) => rack(b, [X(x + RW), Y(RT), BS * RW, BS * (FL - RT)], 0, rand, b.count(0.02)))
    const all = racks.flat(), dens = b.count(0.2) / all.reduce((sum, u) => sum + 2 * (u.w + u.h), 0)
    racks.forEach((r, k) => { const L = lanes[Math.min(k, lanes.length - 1)]; for (const u of r) back(b, u, L < u.x, rand, dens) })
    // the managers, the bundles out of their tops into one, the one up to the fork, and its branches
    for (const L of lanes) b.f.lines.push({ c: b.curve([[L, Y(FL) - 0.01], [L, BTOP - 0.025]]), a: 0.1 }, { c: b.curve([[L, BTOP - 0.025], ...up([L, BTOP - 0.025], base, 16)]), a: 0.24 })
    if (fork && reach) { b.f.lines.push({ c: b.curve([base, fork]), a: 0.34 }); for (const r of reach) b.f.lines.push({ c: b.curve([fork, ...up(fork, r, 24)]), a: 0.28 }) }
    traffic(b, rand, 0.55, 0.2)
    b.dust()
    return b.f
}
