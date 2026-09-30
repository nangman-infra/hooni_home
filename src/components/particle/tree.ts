/* A tree, grown the way space colonisation grows one: points are scattered through the crown, the
   trunk rises into them, and every node steps toward the points it is nearest to until they are
   used up. What comes back is a rooted graph — each node has one parent — which is also exactly
   what a network's spanning tree is. */

export type Tree = {
    n: number
    x: Float32Array; y: Float32Array; z: Float32Array
    parent: Int32Array   // -1 for the root
    kids: Uint8Array     // how many children
    dist: Float32Array   // path length from the root
    tips: Float32Array   // how many branch ends this node carries: the pipe model's thickness
    maxDist: number
}

// seeded, so the tree is the same tree on every visit
export const mulberry = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function growTree(rand: () => number, o: { baseY: number; cy: number; rx: number; ry: number; rz: number; points?: number; kill?: number }): Tree {
    const D = 0.13, DI = 1.1, DK = o.kill ?? 0.24, A = o.points ?? 1300
    const ax = new Float32Array(A), ay = new Float32Array(A), az = new Float32Array(A), alive = new Uint8Array(A).fill(1)
    for (let a = 0; a < A;) {
        const x = rand() * 2 - 1, y = rand() * 2 - 1, z = rand() * 2 - 1
        if (x * x + y * y + z * z > 1) continue
        ax[a] = x * o.rx; ay[a] = o.cy + y * o.ry; az[a] = z * o.rz; a++
    }
    const X = [0], Y = [o.baseY], Z = [0], Pn = [-1]
    // each point remembers its nearest node, and only new nodes are ever compared against it
    const near = new Int32Array(A).fill(-1), nd = new Float32Array(A).fill(Infinity)
    const see = (from: number) => {
        for (let a = 0; a < A; a++) if (alive[a]) for (let j = from; j < X.length; j++) {
            const d = (ax[a] - X[j]) ** 2 + (ay[a] - Y[j]) ** 2 + (az[a] - Z[j]) ** 2
            if (d < nd[a]) { nd[a] = d; near[a] = j }
        }
    }
    for (const top = o.cy - o.ry * 0.6; Y[Y.length - 1] < top;) {
        const i = X.length - 1
        X.push(X[i] + (rand() - 0.5) * 0.05); Y.push(Y[i] + D); Z.push(Z[i] + (rand() - 0.5) * 0.05); Pn.push(i)
    }
    see(0)
    const taken = new Set<string>()
    for (let it = 0; it < 400; it++) {
        const acc = new Map<number, [number, number, number]>()
        for (let a = 0; a < A; a++) {
            if (!alive[a]) continue
            if (nd[a] < DK * DK) { alive[a] = 0; continue }
            if (nd[a] > DI * DI) continue
            const j = near[a], l = Math.sqrt(nd[a])
            const v = acc.get(j) ?? acc.set(j, [0, 0, 0]).get(j)!
            v[0] += (ax[a] - X[j]) / l; v[1] += (ay[a] - Y[j]) / l; v[2] += (az[a] - Z[j]) / l
        }
        const from = X.length
        for (const [j, v] of acc) {
            const l = Math.hypot(v[0], v[1], v[2])
            if (l < 1e-4) continue
            const x = X[j] + (v[0] / l) * D, y = Y[j] + (v[1] / l) * D, z = Z[j] + (v[2] / l) * D
            // two points pulling evenly would grow the same twig again and again
            const key = `${Math.round(x / 0.04)},${Math.round(y / 0.04)},${Math.round(z / 0.04)}`
            if (taken.has(key)) continue
            taken.add(key); X.push(x); Y.push(y); Z.push(z); Pn.push(j)
        }
        if (X.length === from) break
        see(from)
    }
    const n = X.length
    const t: Tree = { n, x: Float32Array.from(X), y: Float32Array.from(Y), z: Float32Array.from(Z), parent: Int32Array.from(Pn), kids: new Uint8Array(n), dist: new Float32Array(n), tips: new Float32Array(n), maxDist: 0 }
    // a parent is always made before its children, so one pass forward and one back is enough
    for (let i = 1; i < n; i++) {
        const p = Pn[i]
        t.kids[p]++
        t.dist[i] = t.dist[p] + Math.hypot(X[i] - X[p], Y[i] - Y[p], Z[i] - Z[p])
        if (t.dist[i] > t.maxDist) t.maxDist = t.dist[i]
    }
    for (let i = n - 1; i > 0; i--) { if (!t.kids[i]) t.tips[i] = 1; t.tips[Pn[i]] += t.tips[i] }
    return t
}
