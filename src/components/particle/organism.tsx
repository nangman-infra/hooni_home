"use client"

import { useEffect, useRef } from "react"
import { growTree, mulberry } from "@/components/particle/tree"

/* One tree, and a camera that visits it.

   THE TREE    Woven from strands: one for every branch end, unbroken from root to end. Bundled and
               twisted in the trunk, dividing at every fork, spread like roots at the foot. The
               branch ends are nodes, linked to their neighbours, so the crown is a mesh.
   THE SHOTS   Every section has a node of its own. The camera flies to it and rests beside it, the
               node close in the foreground with the rest of the tree falling away behind, and a
               hairline runs from the node to the section's heading. Small moves between most
               sections, a wide swing round the trunk every third — a rhythm, not a repeat.
   WEIGHT      The camera is on a spring: it lags the scroll, carries momentum, overshoots a little
               and settles. At speed it banks, the lens widens, and the grains draw as streaks.
   LIFE        The tree moves by itself — it sways, more toward the ends, and harder when the
               camera is moving. On every arrival a wave of light climbs it from root to ends.
   LIGHT       Everything is added, not painted: where strands cross they get brighter, the way
               light does. Nodes carry a soft glow. */

const GROUND = "#0b0b0c"
const NB = 7 // depth bands
const TWIST = 1.15 // of the bundle, radians per unit of length
const GROW0 = 0.2, GROW = 2.3 // when growth starts, and how long the tip takes to reach the farthest end
const OM = 8, ZE = 0.62 // the camera's spring: how stiff, how damped (under 1 = it overshoots)
const BA = [0.035, 0.08, 0.16, 0.3, 0.5, 0.75, 1]
const DEG = Math.PI / 180
// where round the trunk each section's shot is taken from, and which side of the text the tree stands on
const AZ = [0, 20, 55, 80, 150, 170, 195, 265, 285, 310, 330, 340, 350, 360]
const SIDE = [0, 1, 1, 1, -1, -1, -1, 1, 1, 1, -1, -1, -1, 0]
const LEVEL = [0, 0.92, 0.6, 0.35, 0.2, 0, -0.2, -0.4, -0.6, -0.8] // how high in the crown the node is, sections 1–9

type Strand = { p: Float32Array; d: Float32Array; sw: Float32Array; crowd: Uint8Array; n: number; len: number; ph: number; on: boolean }
type Key = { yaw: number; r: number; h: number; ty: number; zoom: number; pan: number; dim: number }

function build(w: number, h: number) {
    const wide = innerWidth >= 900
    const Fpx = Math.min(w, h) * (wide ? 1.484 : 1.29) // focal length, in device px, for a thing ten units away
    const hh = ((h / 2) * 10) / Fpx, hw = ((w / 2) * 10) / Fpx
    const R = Math.min(2.6, hw * 0.7), ry = Math.min(3, hh * 0.58), cy = 0.1 * hh + 0.3 * ry, gY = hh - 0.92 * 2 * hh, top = cy + ry
    const rand = mulberry(7)
    const T = growTree(rand, { baseY: gY, cy, rx: R, ry, rz: R, points: 1800, kill: 0.3 })
    const gauss = () => (rand() + rand() + rand() - 1.5) * 0.82
    const bend = (d: number) => Math.pow(d / T.maxDist, 1.7) // how freely a point sways: hardly at the trunk, fully at the ends
    const tips: number[] = []
    for (let i = 1; i < T.n; i++) if (!T.kids[i]) tips.push(i)

    const strands: Strand[] = tips.map((tip) => {
        const path: number[] = []
        for (let k = tip; k >= 0; k = T.parent[k]) path.push(k)
        path.reverse()
        const rho = Math.sqrt(rand()), ang = rand() * 6.283, n = path.length
        const p = new Float32Array(n * 3), d = new Float32Array(n), sw = new Float32Array(n), crowd = new Uint8Array(n)
        for (let j = 0; j < n; j++) {
            // the pipe model: a branch is as thick as the ends it carries, and the foot flares
            const i = path[j], r = 0.0165 * Math.sqrt(T.tips[i] || 1) * (1 + 2.4 * Math.exp(-(T.y[i] - gY) / 0.3)), a = ang + TWIST * T.dist[i]
            p[j * 3] = T.x[i] + r * rho * Math.cos(a); p[j * 3 + 1] = T.y[i]; p[j * 3 + 2] = T.z[i] + r * rho * Math.sin(a)
            d[j] = T.dist[i]; sw[j] = bend(T.dist[i]); crowd[j] = T.tips[i] > 60 ? 2 : T.tips[i] > 12 ? 1 : 0
        }
        // the grown skeleton is angular; a cable is not
        for (let it = 0; it < 3; it++) for (let j = 1; j + 1 < n; j++) for (let c = 0; c < 3; c++) p[j * 3 + c] = 0.25 * p[j * 3 - 3 + c] + 0.5 * p[j * 3 + c] + 0.25 * p[j * 3 + 3 + c]
        return { p, d, sw, crowd, n, len: T.dist[tip], ph: rand() * 9, on: rand() < 0.16 }
    })

    // the crown is a mesh: each branch end is linked to its two nearest
    const links: number[] = [], seen = new Set<string>()
    tips.forEach((a, ia) => {
        tips.map((b, ib) => [ib, Math.hypot(T.x[a] - T.x[b], T.y[a] - T.y[b], T.z[a] - T.z[b])] as const)
            .filter((q) => q[0] !== ia && q[1] < 0.95).sort((x, y) => x[1] - y[1]).slice(0, 2)
            .forEach(([ib]) => { const key = ia < ib ? `${ia}-${ib}` : `${ib}-${ia}`; if (!seen.has(key)) { seen.add(key); links.push(ia, ib) } })
    })

    // grains: where, how bright, how big, how far along the growth, how much the wind and the sway move them
    const gx: number[] = [], gy: number[] = [], gz: number[] = [], ga: number[] = [], gs: number[] = [], gd: number[] = [], gw: number[] = [], gb: number[] = []
    const add = (x: number, y: number, z: number, a: number, s: number, d: number, wgt: number, b: number) => { gx.push(x); gy.push(y); gz.push(z); ga.push(a); gs.push(s); gd.push(d); gw.push(wgt); gb.push(b) }
    for (const s of strands) for (let j = 0; j + 1 < s.n; j++) for (let q = 0; q < 2; q++) {
        const u = rand(), d = s.d[j] + (s.d[j + 1] - s.d[j]) * u
        add(s.p[j * 3] + (s.p[j * 3 + 3] - s.p[j * 3]) * u + gauss() * 0.012, s.p[j * 3 + 1] + (s.p[j * 3 + 4] - s.p[j * 3 + 1]) * u + gauss() * 0.012, s.p[j * 3 + 2] + (s.p[j * 3 + 5] - s.p[j * 3 + 2]) * u + gauss() * 0.012, 0.5 + rand() * 0.45, 0.5 + rand() * 0.7, d, 0.35, bend(d))
    }
    for (const i of tips) for (let q = 0; q < 16; q++) add(T.x[i] + gauss() * 0.13, T.y[i] + gauss() * 0.13, T.z[i] + gauss() * 0.13, 0.55 + rand() * 0.4, 0.5 + rand() * 0.7, T.dist[i] + 0.1 + rand() * 0.5, 1, bend(T.dist[i]) * 1.15)
    for (let j = 0; j < 1800; j++) { const a = rand() * 6.283, q = 3.6 * Math.sqrt(rand()); add(Math.cos(a) * q, gY + gauss() * 0.015, Math.sin(a) * q, 0.34 * (1 - q / 3.8), 0.5 + rand() * 0.6, q * 0.6, 0.2, 0) }
    const N = gx.length

    /* the shots. Each section's node, and the camera that rests beside it: yaw round the trunk, distance from
       the axis, height, the height it looks at, lens, how far the trunk stands from the middle of the screen,
       and how bright the picture is there. A phone has no margin to stand the tree in, so there the whole
       picture is turned down instead — evenly, never in patches. */
    const K: Key[] = [], ax = new Float32Array(14), ay = new Float32Array(14), az = new Float32Array(14), ab = new Float32Array(14)
    const taken = new Set<number>()
    const trunkR = 0.0165 * Math.sqrt(tips.length)
    for (let k = 0; k <= 13; k++) {
        const phi = AZ[k] * DEG, side = wide ? SIDE[k] * 0.27 : 0
        if (k === 0 || k === 13) { K.push({ yaw: phi, r: 10, h: 0.8, ty: 0, zoom: 1, pan: 0, dim: wide ? 0.82 : k ? 0.22 : 0.5 }); continue }
        if (k <= 9) {
            // the branch end nearest the place this shot wants: on the outside of the crown, facing the camera
            const y = cy + LEVEL[k] * ry, rs = R * 0.85 * Math.sqrt(Math.max(0.05, 1 - ((y - cy) / ry) ** 2)), wx = Math.sin(phi) * rs, wz = -Math.cos(phi) * rs
            let best = tips[0], bd = 1e9
            for (const i of tips) { if (taken.has(i)) continue; const dd = Math.hypot(T.x[i] - wx, (T.y[i] - y) * 1.4, T.z[i] - wz); if (dd < bd) { bd = dd; best = i } }
            taken.add(best)
            ax[k] = T.x[best]; ay[k] = T.y[best]; az[k] = T.z[best]; ab[k] = bend(T.dist[best])
            const out = Math.hypot(ax[k], az[k])
            let yaw = out > 0.5 ? Math.atan2(ax[k], -az[k]) : phi
            while (yaw - phi > Math.PI) yaw -= 2 * Math.PI
            while (yaw - phi < -Math.PI) yaw += 2 * Math.PI
            if (k === 1) K.push({ yaw, r: 4.6, h: top + 2.3, ty: cy + 0.4, zoom: 0.86, pan: side * 0.8, dim: wide ? 0.85 : 0.3 }) // over the crown, looking down
            else K.push({ yaw, r: out + (wide ? 2.9 : 4.2), h: ay[k] + 0.55, ty: ay[k] - 0.35, zoom: 0.84, pan: side, dim: wide ? 1 : 0.28 })
        } else {
            // the last three are on the trunk, then at its foot, looking up
            const y = k === 12 ? gY + 0.2 : gY + (cy - ry - gY) * (k === 10 ? 0.85 : 0.45), rr = k === 12 ? trunkR * 2.4 : trunkR
            ax[k] = Math.sin(phi) * rr; ay[k] = y; az[k] = -Math.cos(phi) * rr; ab[k] = 0
            if (k === 12) K.push({ yaw: phi, r: 3.9, h: gY + 0.4, ty: cy - 0.3, zoom: 0.8, pan: side, dim: wide ? 1 : 0.17 })
            else K.push({ yaw: phi, r: wide ? 3.4 : 4.6, h: y + 0.25, ty: y + 0.4, zoom: 0.84, pan: side, dim: wide ? 1 : 0.28 })
        }
    }

    return {
        Fpx, wide, gY, strands, links, N, K, maxDist: T.maxDist, ax, ay, az, ab,
        tx: Float32Array.from(tips, (i) => T.x[i]), ty: Float32Array.from(tips, (i) => T.y[i]), tz: Float32Array.from(tips, (i) => T.z[i]), td: Float32Array.from(tips, (i) => T.dist[i]), tb: Float32Array.from(tips, (i) => bend(T.dist[i])),
        gx: Float32Array.from(gx), gy: Float32Array.from(gy), gz: Float32Array.from(gz), ga: Float32Array.from(ga), gs: Float32Array.from(gs), gd: Float32Array.from(gd), gw: Float32Array.from(gw), gb: Float32Array.from(gb),
        ox: new Float32Array(N), oy: new Float32Array(N), oz: new Float32Array(N), sx: new Float32Array(N).fill(-1e5), sy: new Float32Array(N),
        bk: BA.map(() => new Float32Array(N * 3)), seg: new Float32Array(Math.max(...strands.map((s) => s.n)) * 3),
    }
}

export function Organism() {
    const ref = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const cv = ref.current
        if (!cv) return
        const g = cv.getContext("2d", { alpha: false })
        if (!g) return
        const still = matchMedia("(prefers-reduced-motion: reduce)")
        const fine = matchMedia("(pointer: fine)").matches
        // one soft light, drawn wherever something glows
        const halo = document.createElement("canvas")
        halo.width = halo.height = 96
        const hg = halo.getContext("2d")
        if (hg) { const gr = hg.createRadialGradient(48, 48, 0, 48, 48, 48); gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(0.25, "rgba(255,255,255,0.16)"); gr.addColorStop(1, "rgba(255,255,255,0)"); hg.fillStyle = gr; hg.fillRect(0, 0, 96, 96) }

        let w = 0, h = 0, dpr = 1, builtW = 0, builtH = 0
        let W = null as unknown as ReturnType<typeof build>
        let mids: number[] = [], tags: (HTMLElement | null)[] = []
        let raf = 0, last = 0, t = 0
        let sS = -1, vS = 0, at = 0, prevYaw = 0, spin = 0, nextWave = 6, owed = false
        const waves: number[] = [] // how far along the tree each wave of light has climbed
        let ptx = -1, pty = -1, accX = 0, accY = 0, leanX = 0.5, leanY = 0.5, windLive = 0
        // the camera of this frame
        let Cx = 0, Cy = 0, Cz = 0, rx = 1, rz = 0, ux = 0, uy = 1, uz = 0, fx = 0, fy = 0, fz = 1, F = 1, panPx = 0, cr = 1, sr = 0
        let PX = 0, PY = 0, PZ = 0
        const proj = (x: number, y: number, z: number) => {
            const dx = x - Cx, dy = y - Cy, dz = z - Cz, zc = dx * fx + dy * fy + dz * fz
            if (zc < 0.25) return 0
            const k = F / zc, xc = dx * rx + dz * rz, yc = dx * ux + dy * uy + dz * uz
            PX = w / 2 + (xc * cr - yc * sr) * k + panPx; PY = h / 2 - (xc * sr + yc * cr) * k; PZ = zc
            return k
        }

        const measure = () => {
            const secs = Array.from(document.querySelectorAll<HTMLElement>("main section"))
            mids = secs.map((el) => { const r = el.getBoundingClientRect(); return r.top + scrollY + r.height / 2 })
            tags = secs.map((el) => el.querySelector<HTMLElement>(".pa-tag"))
        }
        // where the page is, counted in sections: k when section k is centred in the window
        const where = () => {
            const y = scrollY + innerHeight / 2, n = mids.length
            if (n < 2 || y <= mids[0]) return 0
            for (let k = 0; k + 1 < n; k++) if (y < mids[k + 1]) return k + (y - mids[k]) / (mids[k + 1] - mids[k])
            return n - 1
        }
        const size = () => {
            dpr = Math.min(devicePixelRatio || 1, 2)
            w = Math.floor(innerWidth * dpr); h = Math.floor(innerHeight * dpr)
            cv.width = w; cv.height = h; cv.style.width = `${innerWidth}px`; cv.style.height = `${innerHeight}px`
            // the tree is grown for the window; a different width, or a much different height, is a different tree
            if (!W || w !== builtW || Math.abs(h - builtH) > builtH * 0.15) { W = build(w, h); builtW = w; builtH = h }
            measure()
        }
        const sm = (a: number, b: number, x: number) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k) }

        const paint = (dt: number) => {
            t += dt
            const calm = still.matches, tt = calm ? 99 : t

            /* where the camera is on its way: a spring pulls it after the scroll, so it has weight */
            const target = Math.min(13, where())
            if (sS < 0 || calm) { sS = target; vS = 0; at = Math.round(target) }
            else { const step = Math.min(dt, 0.034); vS += (OM * OM * (target - sS) - 2 * ZE * OM * vS) * step; sS += vS * step }
            const arrived = Math.round(target)
            const speed = Math.min(2.2, Math.abs(vS)) // sections a second
            // one thing at a time: the camera moves, settles, and only then a wave of light climbs the tree
            if (arrived !== at) { at = arrived; owed = !calm }
            if (owed && Math.abs(target - sS) < 0.1 && speed < 0.3) { owed = false; waves.push(0); nextWave = t + 7 }
            if (!calm && t > nextWave && speed < 0.05) { waves.push(0); nextWave = t + 7 }
            for (let i = waves.length - 1; i >= 0; i--) { waves[i] += dt * 4.2; if (waves[i] > W.maxDist + 1.5) waves.splice(i, 1) }

            const sc = Math.max(0, Math.min(12.9999, sS)), k = Math.floor(sc), fr = sc - k, e = fr - Math.sin(2 * Math.PI * fr) / (2 * Math.PI)
            const a = W.K[k], b = W.K[k + 1]
            const L = (key: keyof Key) => a[key] + (b[key] - a[key]) * e
            // a small move stays close; a wide one swings out round the trunk and comes back in
            const big = Math.abs(b.pan - a.pan) > 0.3 || Math.abs(b.yaw - a.yaw) > 50 * DEG || k === 0 || k === 12 ? 1 : 0.3, arc = Math.sin(Math.PI * e) * big
            const hasPtr = ptx >= 0
            leanX += ((hasPtr ? ptx / w : 0.5) - leanX) * Math.min(1, dt * 10); leanY += ((hasPtr ? pty / h : 0.5) - leanY) * Math.min(1, dt * 10)

            // arriving on the page: the camera starts low at the foot, looking up the trunk, and cranes back as the tree grows
            const open = calm ? 0 : (1 - Math.max(0, Math.min(1, (tt - 0.1) / 3))) ** 3 * Math.max(0, 1 - sc)
            const dim = L("dim"), pan = L("pan") * (1 - open)
            const yaw = (calm ? a.yaw + (b.yaw - a.yaw) * e : L("yaw") + Math.sin(t * 0.19) * 0.02 + (leanX - 0.5) * 0.1) - 0.5 * open
            const rad = (L("r") + arc * 1.2) * (1 - open) + 3.3 * open
            const tgY = L("ty") * (1 - open) + (W.gY + 2.7) * open
            Cx = rad * Math.sin(yaw); Cy = (L("h") + arc * 0.35 + (0.5 - leanY) * 0.3) * (1 - open) + (W.gY + 0.6) * open; Cz = -rad * Math.cos(yaw)
            const Dc = Math.hypot(Cx, Cy - tgY, Cz)
            fx = -Cx / Dc; fy = (tgY - Cy) / Dc; fz = -Cz / Dc
            const rl = Math.hypot(fz, fx) || 1
            rx = fz / rl; rz = -fx / rl
            ux = fy * rz; uy = fz * rx - fx * rz; uz = -fy * rx
            // at speed the lens opens and the camera banks into the turn
            spin += ((dt > 0 ? (yaw - prevYaw) / dt : 0) - spin) * Math.min(1, dt * 8); prevYaw = yaw
            const roll = calm ? 0 : Math.max(-0.11, Math.min(0.11, -spin * 0.11))
            cr = Math.cos(roll); sr = Math.sin(roll)
            F = W.Fpx * (L("zoom") * (1 - open) + 0.78 * open) * (1 - Math.min(0.1, speed * 0.05)); panPx = pan * w
            const unit = W.Fpx / 10, zn = Math.max(0.9, Dc - 3), zr = Dc + 3.4 - zn
            const close = sm(9.5, 6.5, Dc) // lines are finer when the whole tree is in view

            /* the tree is alive: it sways, more toward the ends, and harder while the camera is moving */
            const swA = calm ? 0 : 0.055 * (1 + 2.4 * Math.min(1, speed)), drag = calm ? 0 : Math.max(-0.5, Math.min(0.5, spin)) * 0.22
            const t1 = t * 0.9, t2 = t * 0.74
            const swx = (x: number, y: number, z: number, bnd: number) => bnd * (swA * Math.sin(t1 + x * 1.3 + z * 0.7 + y * 0.5) + drag * z)
            const swz = (x: number, y: number, z: number, bnd: number) => bnd * (swA * 0.7 * Math.cos(t2 + x * 0.9 - z * 1.1) - drag * x)

            /* how much of it has grown, and where the light is */
            const gt = Math.max(0, Math.min(1, (tt - GROW0) / GROW)), grown = tt > GROW0 + GROW + 0.7
            const reach = grown ? 1e9 : (W.maxDist / 0.98) * (1 - (1 - gt) ** 2)
            const live = sm(GROW0 + GROW, GROW0 + GROW + 1.2, tt)
            const nw = waves.length
            const lightAt = (d: number) => { let v = grown ? 0 : Math.exp(-(((reach - d) / 0.45) ** 2)) * (d <= reach ? 1 : 0); for (let i = 0; i < nw; i++) { const q = (d - waves[i]) / 0.3; if (q > -2.6 && q < 2.6) v = Math.max(v, 0.8 * Math.exp(-q * q)) } return v }

            g.globalCompositeOperation = "source-over"
            g.fillStyle = GROUND; g.fillRect(0, 0, w, h)
            g.globalCompositeOperation = "lighter"
            g.lineCap = "round"; g.lineJoin = "round"

            /* the strands, in depth bands */
            const band = Array.from({ length: NB * 3 }, () => new Path2D()), glow = [new Path2D(), new Path2D(), new Path2D()]
            const q = W.seg
            for (const st of W.strands) {
                let n = st.n
                if (!grown) { n = 0; while (n < st.n && st.d[n] <= reach) n++; if (n < 2) continue }
                for (let j = 0; j < n; j++) {
                    const x = st.p[j * 3], y = st.p[j * 3 + 1], z = st.p[j * 3 + 2], bnd = st.sw[j]
                    const kk = proj(x + swx(x, y, z, bnd), y, z + swz(x, y, z, bnd))
                    q[j * 3] = PX; q[j * 3 + 1] = PY; q[j * 3 + 2] = kk ? PZ : -1
                }
                const pos = st.on && live > 0 ? (t * 1.7 + st.ph) % (st.len + 3) : -9
                for (let j = 0; j + 1 < n; j++) {
                    const z0 = q[j * 3 + 2], z1 = q[j * 3 + 5]
                    if (z0 < 0.5 || z1 < 0.5) continue
                    const bi = Math.max(0, Math.min(NB - 1, Math.floor(((z0 - zn) / zr) * NB)))
                    const bp = band[bi * 3 + st.crowd[j]]
                    bp.moveTo(q[j * 3], q[j * 3 + 1]); bp.lineTo(q[j * 3 + 3], q[j * 3 + 4])
                    if (bi >= NB - 1) continue
                    // light: a wave passing (all the loose strands, a few in the bundle), or this strand's own pulse
                    let lv = st.crowd[j] === 0 || (st.on && st.crowd[j] === 1) ? lightAt(st.d[j]) : 0
                    const back = pos - st.d[j]
                    if (back > 0 && back < 0.9) lv = Math.max(lv, 1 - back / 0.9)
                    if (lv > 0.12) { const gp = glow[lv > 0.62 ? 0 : lv > 0.32 ? 1 : 2]; gp.moveTo(q[j * 3], q[j * 3 + 1]); gp.lineTo(q[j * 3 + 3], q[j * 3 + 4]) }
                }
            }
            for (let bi = NB - 1; bi >= 0; bi--) for (let c = 0; c < 3; c++) {
                const u = bi / (NB - 1)
                g.strokeStyle = `rgba(226,228,238,${((0.42 - 0.37 * u) * [1, 0.42, 0.13][c] * dim).toFixed(3)})`
                g.lineWidth = dpr * (1.3 - u) * (0.55 + 0.45 * close)
                g.stroke(band[bi * 3 + c])
            }

            /* the mesh across the branch ends */
            const mesh = [new Path2D(), new Path2D()]
            for (let i = 0; i < W.links.length; i += 2) {
                const ia = W.links[i], ib = W.links[i + 1]
                if (W.td[ia] > reach || W.td[ib] > reach) continue
                if (!proj(W.tx[ia] + swx(W.tx[ia], W.ty[ia], W.tz[ia], W.tb[ia]), W.ty[ia], W.tz[ia] + swz(W.tx[ia], W.ty[ia], W.tz[ia], W.tb[ia]))) continue
                const x = PX, y = PY, z = PZ
                if (!proj(W.tx[ib] + swx(W.tx[ib], W.ty[ib], W.tz[ib], W.tb[ib]), W.ty[ib], W.tz[ib] + swz(W.tx[ib], W.ty[ib], W.tz[ib], W.tb[ib]))) continue
                const m = mesh[(z - zn) / zr < 0.45 ? 0 : 1]
                m.moveTo(x, y); m.lineTo(PX, PY)
            }
            g.lineWidth = dpr * 0.6; g.strokeStyle = `rgba(226,228,238,${(0.26 * dim).toFixed(3)})`; g.stroke(mesh[0])
            g.lineWidth = dpr * 0.4; g.strokeStyle = `rgba(226,228,238,${(0.09 * dim).toFixed(3)})`; g.stroke(mesh[1])
            for (let c = 2; c >= 0; c--) { g.strokeStyle = `rgba(255,255,255,${([0.6, 0.3, 0.12][c] * dim).toFixed(3)})`; g.lineWidth = dpr * ([1.35, 1.1, 0.9][c] * (0.6 + 0.4 * close)); g.stroke(glow[c]) }

            /* the wind: what the pointer moved this frame moves the grains near it, this frame */
            const wx = accX, wy = accY
            accX = accY = 0
            const blow = fine && hasPtr && (wx !== 0 || wy !== 0), Rw = Math.min(w, h) * 0.16
            if (blow) windLive = 1.4
            const settle = windLive > 0 ? Math.exp(-dt * 2.6) : 1
            windLive = Math.max(0, windLive - dt)

            /* the grains: sized and lit by depth, brighter as light passes, and drawn as streaks when they move fast */
            const cnt = [0, 0, 0, 0, 0, 0, 0]
            const streak = BA.map(() => new Path2D())
            const gsz = Math.min(dpr, (W.Fpx / 10 / 133.5) * 1.15) * 0.8, minS = Math.max(0.9, dpr * 0.55), tw = calm ? 0 : 0.14
            const fast = !calm && (speed > 0.12 || Math.abs(spin) > 0.12), lit = nw > 0 || !grown
            const { gx, gy, gz, ga, gs, gd, gw, gb, ox, oy, oz, sx, sy } = W
            for (let i = 0; i < W.N; i++) {
                const born = reach - gd[i]
                if (born <= 0) continue
                if (settle < 1) { ox[i] *= settle; oy[i] *= settle; oz[i] *= settle }
                const x = gx[i], y = gy[i], z = gz[i], bnd = gb[i]
                const kk = proj(x + ox[i] + (bnd ? swx(x, y, z, bnd) : 0), y + oy[i], z + oz[i] + (bnd ? swz(x, y, z, bnd) : 0))
                if (!kk || PX < -40 || PX > w + 40 || PY < -40 || PY > h + 40) { sx[i] = -1e5; continue }
                if (blow) {
                    const dd = Math.hypot(PX - ptx, PY - pty)
                    if (dd < Rw) {
                        const push = ((1 - dd / Rw) ** 2 * 0.85 * gw[i]) / kk, mx = wx * push, my = -wy * push
                        ox[i] = Math.max(-0.7, Math.min(0.7, ox[i] + rx * mx + ux * my)); oy[i] = Math.max(-0.7, Math.min(0.7, oy[i] + uy * my)); oz[i] = Math.max(-0.7, Math.min(0.7, oz[i] + rz * mx + uz * my))
                    }
                }
                const u = Math.max(0, Math.min(1, (PZ - zn) / zr)), depth = Math.max(0.3, Math.min(3.2, kk / unit)), lv = lit ? lightAt(gd[i]) : 0
                const al = ga[i] * (1 - 1.29 * u + 0.43 * u * u) * Math.min(1, (PZ - 0.5) / 0.9) * Math.min(1, born / 0.5) * (1 - tw + tw * Math.sin(t * 1.6 + i * 2.399)) * (1 + 0.9 * lv) * dim
                const px0 = sx[i], py0 = sy[i]
                sx[i] = PX; sy[i] = PY
                if (al < 0.02) continue
                const s = Math.max(minS, gs[i] * depth * gsz * (1 + 0.5 * lv)), bi = al < 0.055 ? 0 : al < 0.115 ? 1 : al < 0.22 ? 2 : al < 0.39 ? 3 : al < 0.61 ? 4 : al < 0.87 ? 5 : 6
                if (fast && px0 > -1e4) {
                    const mv = Math.abs(PX - px0) + Math.abs(PY - py0)
                    if (mv > 3 * dpr && mv < 70 * dpr) { streak[bi].moveTo(px0, py0); streak[bi].lineTo(PX, PY); continue }
                }
                const arr = W.bk[bi], n = cnt[bi]++
                arr[n * 3] = PX - s / 2; arr[n * 3 + 1] = PY - s / 2; arr[n * 3 + 2] = s
            }
            g.lineWidth = Math.max(1, dpr * 0.9)
            for (let bi = 0; bi < 7; bi++) {
                g.strokeStyle = `rgba(240,240,244,${(BA[bi] * 0.55).toFixed(3)})`; g.stroke(streak[bi])
                if (!cnt[bi]) continue
                const arr = W.bk[bi]
                g.fillStyle = `rgba(240,240,244,${BA[bi]})`
                g.beginPath()
                for (let j = 0; j < cnt[bi]; j++) g.rect(arr[j * 3], arr[j * 3 + 1], arr[j * 3 + 2], arr[j * 3 + 2])
                g.fill()
            }

            /* the branch ends are the nodes: a point and a soft light, flaring as they are born and as light reaches them */
            for (let i = 0; i < W.tx.length; i++) {
                if (W.td[i] > reach) continue
                const x = W.tx[i], y = W.ty[i], z = W.tz[i], bnd = W.tb[i]
                const kk = proj(x + swx(x, y, z, bnd), y, z + swz(x, y, z, bnd))
                if (!kk || PZ < 0.6) continue
                const u = Math.max(0, Math.min(1, (PZ - zn) / zr)), age = reach - W.td[i], pop = age < 1.2 ? 1 + 1.4 * Math.exp(-age * 3.5) : 1, lv = lit ? lightAt(W.td[i]) : 0
                const fg = (1 - 1.29 * u + 0.43 * u * u) * dim * Math.min(1, age / 0.25), r = dpr * 1.05 * Math.min(3, kk / unit) * pop * (1 + 0.6 * lv)
                g.globalAlpha = Math.min(1, fg * (0.5 + 0.9 * lv)); g.drawImage(halo, PX - r * 6, PY - r * 6, r * 12, r * 12); g.globalAlpha = 1
                g.fillStyle = `rgba(250,250,255,${Math.min(1, 0.9 * fg).toFixed(3)})`; g.beginPath(); g.arc(PX, PY, r, 0, 6.283); g.fill()
            }

            /* this section's node: a ring round it, and a hairline from it to the heading it stands for */
            if (!calm && W.wide) for (let n = Math.max(1, k); n <= Math.min(12, k + 1); n++) {
                const near = 1 - sm(0.12, 0.55, Math.abs(sS - n)), tag = tags[n]
                if (near < 0.02 || !tag) continue
                const bnd = W.ab[n], x = W.ax[n], y = W.ay[n], z = W.az[n]
                if (!proj(x + swx(x, y, z, bnd), y, z + swz(x, y, z, bnd))) continue
                const nx = PX, ny = PY, rc = tag.getBoundingClientRect(), ty0 = (rc.top + rc.height / 2) * dpr
                if (ty0 < -50 || ty0 > h + 50) continue
                const tx0 = (nx < w / 2 ? rc.left - 14 : rc.right + 14) * dpr, ring = dpr * (9 + 10 * (1 - near))
                g.strokeStyle = `rgba(255,255,255,${(0.6 * near).toFixed(3)})`; g.lineWidth = Math.max(1, dpr * 0.6)
                g.beginPath(); g.arc(nx, ny, ring, 0, 6.283); g.stroke()
                // the line draws itself from the node toward the heading as the camera settles
                const dx = tx0 - nx, dy = ty0 - ny, len = Math.hypot(dx, dy) || 1, from = ring / len
                g.strokeStyle = `rgba(255,255,255,${(0.32 * near).toFixed(3)})`
                g.beginPath(); g.moveTo(nx + dx * from, ny + dy * from); g.lineTo(nx + dx * Math.max(from, near), ny + dy * Math.max(from, near)); g.stroke()
                if (near > 0.98) { g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(tx0 - dpr, ty0 - dpr, dpr * 2, dpr * 2) }
            }
            g.globalCompositeOperation = "source-over"
        }

        const draw = (now: number) => {
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
            last = now
            paint(dt)
            raf = requestAnimationFrame(draw)
        }
        // reduced motion: no loop. The picture is redrawn when the page moves, and nothing moves on its own.
        let due = 0
        const once = () => { if (!due) due = requestAnimationFrame(() => { due = 0; paint(0) }) }
        const onResize = () => { size(); if (still.matches) once() }
        const move = (ev: PointerEvent) => {
            const x = ev.clientX * dpr, y = ev.clientY * dpr
            if (ptx >= 0) { accX += x - ptx; accY += y - pty }
            ptx = x; pty = y
        }
        const leave = () => { ptx = pty = -1 }
        const ro = new ResizeObserver(() => { measure(); if (still.matches) once() })

        size()
        const main = document.querySelector("main")
        if (main) ro.observe(main)
        addEventListener("resize", onResize)
        if (still.matches) { once(); addEventListener("scroll", once, { passive: true }) }
        else {
            addEventListener("pointermove", move, { passive: true })
            document.addEventListener("pointerleave", leave)
            raf = requestAnimationFrame(draw)
        }
        return () => {
            cancelAnimationFrame(raf); cancelAnimationFrame(due)
            ro.disconnect()
            removeEventListener("resize", onResize)
            removeEventListener("scroll", once)
            removeEventListener("pointermove", move)
            document.removeEventListener("pointerleave", leave)
        }
    }, [])

    return <canvas className="pa-tree" ref={ref} aria-hidden="true" />
}
