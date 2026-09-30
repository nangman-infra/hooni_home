/* One density field per section: a function over the figure's frame (x from -A to A across, y from
   -1 at the bottom to 1 at the top, t in seconds) returning how much ink a point carries, 0 to 1.
   The figure renders the field as characters, so a shape is nothing but a function — swapping a
   section's shape is swapping one of these. */

export type Shape = (x: number, y: number, t: number, A: number) => number

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const sm = (a: number, b: number, v: number) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k) }
const hash = (x: number, y: number) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n) }
const vn = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(0, 1, x - xi), yf = sm(0, 1, y - yi)
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
}
export const noise = (x: number, y: number) => vn(x, y) * 0.62 + vn(x * 2.1 + 5, y * 2.1 + 3) * 0.26 + vn(x * 4.3 + 9, y * 4.3 + 7) * 0.12
// a shaded ball of radius r at (cx, cy), lit from the upper left
const ball = (x: number, y: number, cx: number, cy: number, r: number) => {
    const dx = (x - cx) / r, dy = (y - cy) / r, q = dx * dx + dy * dy
    if (q >= 1) return 0
    const nz = Math.sqrt(1 - q)
    return clamp(0.18 + 0.82 * (nz * 0.55 - dx * 0.35 + dy * 0.4 + 0.3))
}
// ink along a segment, w wide
const seg = (x: number, y: number, ax: number, ay: number, bx: number, by: number, w: number) => {
    const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1
    const u = clamp(((x - ax) * vx + (y - ay) * vy) / L)
    const d = Math.hypot(x - (ax + vx * u), y - (ay + vy * u))
    return sm(w, w * 0.35, d)
}
// the ring
const ring = (x: number, y: number, r: number, w: number) => sm(w, w * 0.3, Math.abs(Math.hypot(x, y) - r))

export const SHAPES = {
    /* a wave crossing the frame, its texture drifting — the opening */
    wave: (x, y, t, A) => {
        const band = 1 - Math.abs(y + 0.25 - x * (0.62 / A) * 1.4 - Math.sin(x * 1.3 + t * 0.15) * 0.08) / 0.62
        return clamp(band) * (0.5 + 0.5 * noise(x * 2.2 + t * 0.06, y * 2.6 - t * 0.04))
    },
    sphere: (x, y, t) => ball(x, y, 0, 0, 0.9) * (0.75 + 0.25 * noise(x * 3 + t * 0.05, y * 3)),
    /* a ring turning slowly: history's loop of years */
    ring: (x, y, t) => {
        const a = Math.atan2(y, x)
        return ring(x, y, 0.66, 0.2) * (0.45 + 0.55 * (0.5 + 0.5 * Math.cos(a * 3 - t * 0.4)))
    },
    /* three fields that overlap: design, operations, tools */
    orbits: (x, y, t) => {
        const s = 0.5 + 0.5 * Math.sin(t * 0.3)
        const a = ball(x, y, -0.55 + s * 0.06, 0.18, 0.5), b = ball(x, y, 0.55 - s * 0.06, 0.18, 0.5), c = ball(x, y, 0, -0.42, 0.5)
        return clamp(a + b + c - Math.min(a, b) * 0.5 - Math.min(b, c) * 0.5 - Math.min(a, c) * 0.5)
    },
    /* the five sites and their tunnels, as the map is drawn */
    topology: (x, y, t, A) => {
        const P: [number, number, number][] = [[0, 0.05, 0.28], [-0.58 * A, -0.5, 0.26], [0.62 * A, -0.35, 0.34], [-0.55 * A, 0.62, 0.22], [0.5 * A, 0.7, 0.2]]
        let d = 0
        for (const [cx, cy, r] of P) d = Math.max(d, ball(x, y, cx, cy, r) * (0.7 + 0.3 * noise(x * 4 + cy, y * 4 + t * 0.1)))
        const L: [number, number][] = [[0, 1], [0, 2], [0, 3], [3, 4], [4, 2]]
        for (const [i, j] of L) d = Math.max(d, seg(x, y, P[i][0], P[i][1], P[j][0], P[j][1], 0.05) * 0.5)
        return d
    },
    /* arcs opening from the foot of the frame: a talk, spreading */
    arcs: (x, y, t) => {
        const r = Math.hypot(x, y + 1.05)
        const v = 0.5 + 0.5 * Math.cos((r - t * 0.12) * 12)
        return sm(1.95, 0.3, r) * sm(0.15, 0.55, r) * sm(0.35, 0.9, v) * (0.55 + 0.45 * sm(-0.3, 0.9, y))
    },
    /* the world, with its lines of latitude and longitude */
    globe: (x, y, t) => {
        const b = ball(x, y, 0, 0, 0.9)
        if (b <= 0) return 0
        const dx = x / 0.9, dy = y / 0.9, nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy))
        const lon = Math.atan2(dx, nz) + t * 0.12, lat = Math.asin(clamp(dy) * 0.999)
        const grid = Math.max(sm(0.1, 0.02, Math.abs(Math.sin(lon * 4))), sm(0.1, 0.02, Math.abs(Math.sin(lat * 5))))
        return clamp(b * 0.42 + grid * 0.58 * (0.4 + 0.6 * nz))
    },
    /* a cube, isometric, turning a little */
    cube: (x, y, t) => {
        const a = t * 0.15, s = 0.62
        const pts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([px, py, pz]) => {
            const rx = px * Math.cos(a) - pz * Math.sin(a), rz = px * Math.sin(a) + pz * Math.cos(a)
            return [rx * s * 0.9, (py * 0.7 + rz * 0.5) * s] as [number, number]
        })
        const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
        let d = 0
        for (const [i, j] of E) d = Math.max(d, seg(x, y, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 0.06))
        return d * (0.6 + 0.4 * sm(-1, 1, y))
    },
    /* lanes with packets running, one of them dropping */
    stream: (x, y, t, A) => {
        let d = 0
        for (let k = 0; k < 4; k++) {
            const ly = 0.66 - k * 0.44
            const lane = sm(0.05, 0.015, Math.abs(y - ly)) * 0.3
            const u = ((x / A + 1) / 2 + t * (0.08 + k * 0.03)) % 1
            const pk = sm(0.12, 0.02, Math.abs((u - 0.5) * 2)) * (k === 2 && Math.sin(t * 0.7) > 0.6 ? 0.2 : 1)
            d = Math.max(d, lane, sm(0.11, 0.03, Math.abs(y - ly)) * pk)
        }
        return d
    },
    /* three slabs, one on another */
    stack: (x, y, t) => {
        let d = 0
        for (let k = 0; k < 3; k++) {
            const cy = 0.5 - k * 0.5, w = 0.95 - k * 0.12 + Math.sin(t * 0.4 + k) * 0.02
            const inside = sm(0.06, 0, Math.abs(x) - w) * sm(0.06, 0, Math.abs(y - cy) - 0.17)
            d = Math.max(d, inside * (0.35 + 0.65 * sm(-w, w, x)))
        }
        return d
    },
    /* rays from the centre: the one prize */
    burst: (x, y, t) => {
        const r = Math.hypot(x, y), a = Math.atan2(y, x)
        const rays = Math.pow(Math.abs(Math.cos(a * 6 + t * 0.2)), 6)
        return clamp(sm(1.1, 0.15, r) * (rays * 0.85 + 0.15) * sm(0.02, 0.2, r) + ball(x, y, 0, 0, 0.2))
    },
    /* an arch: the way through */
    gate: (x, y, t) => {
        const post = Math.max(sm(0.1, 0.03, Math.abs(x + 0.55) - 0.05), sm(0.1, 0.03, Math.abs(x - 0.55) - 0.05)) * sm(-0.95, -0.7, y) * sm(0.3, 0.1, y)
        const arch = ring(x, y - 0.1, 0.6, 0.12) * sm(-0.05, 0.1, y - 0.1)
        return Math.max(post, arch) * (0.7 + 0.3 * noise(x * 3, y * 3 + t * 0.05))
    },
    /* three tiles in a row */
    tiles: (x, y, t, A) => {
        let d = 0
        for (let k = -1; k <= 1; k++) {
            const cx = k * 0.62 * Math.min(A, 1.4)
            const inside = sm(0.05, 0, Math.abs(x - cx) - 0.24) * sm(0.05, 0, Math.abs(y) - 0.24)
            d = Math.max(d, inside * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.5 + k))))
        }
        return d
    },
    /* ripples going out from one point: reach me */
    ripple: (x, y, t) => {
        const r = Math.hypot(x, y)
        const v = 0.5 + 0.5 * Math.cos((r - t * 0.15) * 14)
        return clamp(sm(1.25, 0.2, r) * sm(0.4, 0.95, v) + ball(x, y, 0, 0, 0.1))
    },
} satisfies Record<string, Shape>

export type ShapeName = keyof typeof SHAPES
