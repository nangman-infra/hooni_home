"use client"

import "./topology.css"

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Cloud, Server, Users } from "lucide-react"

// Drawn from Topology.png in the Nangman Infra Network repo, in its arrangement: Yongdu and Goyang on
// top, Seokchon and the AWS VPC in the middle, Daejeon below. Each site is a card laid out like a
// grouped list: its network in the header, then its hosts as rows with the address on the right.
// Public addresses are left out on purpose.
//
// The drawing sits at a slight angle, but not through a CSS 3D transform: the browser rasterises
// that and the text goes soft. Everything is laid out flat and projected here instead, outlines and
// links point by point and each piece of text through the local affine of the projection at its
// anchor, so all of it is still drawn as vectors. It settles into its angle as the page opens and
// follows the pointer from there. Host addresses show at rest; the services on each host appear
// when its card is hovered.
const v = (o: Record<string, string | number>) => o as CSSProperties
const PITCH = 37
export const VIEW = { x: -40, y: 0, w: 740, h: 672 }

export type Pose = { yaw: number; pitch: number } // degrees: yaw turns the right side away, pitch tips the top away
// Upright: the drawing reads straight, with only enough depth to feel like an object on a surface.
// The pointer moves it within a few degrees, so it breathes without ever looking crooked.
export const REST: Pose = { yaw: -1.4, pitch: 5.4 }
const ENTER: Pose = { yaw: -8, pitch: 16 }
const YAW_BY = 11, PITCH_BY = 5.2

type Pt = [number, number]
const fx = (n: number) => n.toFixed(2)

function projector({ yaw, pitch }: Pose, cx: number, cy: number, dist: number) {
    const a = (yaw * Math.PI) / 180, b = (pitch * Math.PI) / 180
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b)
    const p = (x: number, y: number): Pt => {
        const X = x - cx, Y = y - cy
        const x1 = X * ca, z1 = -X * sa
        const y2 = Y * cb - z1 * sb, z2 = Y * sb + z1 * cb
        const s = dist / (dist - z2)
        return [cx + x1 * s, cy + y2 * s]
    }
    return {
        p,
        // the projection as seen by a small element anchored at (x, y)
        at(x: number, y: number) {
            const [px, py] = p(x, y), [ax, ay] = p(x + 1, y), [bx, by] = p(x, y + 1)
            const A = ax - px, B = ay - py, C = bx - px, D = by - py
            return `matrix(${A.toFixed(4)} ${B.toFixed(4)} ${C.toFixed(4)} ${D.toFixed(4)} ${fx(px - A * x - C * y)} ${fx(py - B * x - D * y)})`
        },
        path(pts: Pt[], close = false) {
            return pts.map(([x, y], i) => { const [X, Y] = p(x, y); return `${i ? "L" : "M"}${fx(X)} ${fx(Y)}` }).join(" ") + (close ? " Z" : "")
        },
    }
}
type Proj = ReturnType<typeof projector>

// The edge of a sheet of glass: rings stepping inward, brightest just in from the boundary, so the
// sheet is read from its thickness instead of from an outline. Widths and colours: hero.css.
// A rounded rectangle as points, so it can be projected (straight edges stay straight).
function rr(x: number, y: number, w: number, h: number, r: number): Pt[] {
    const pts: Pt[] = []
    const arc = (cx: number, cy: number, a0: number) => {
        for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) }
    }
    arc(x + w - r, y + r, -Math.PI / 2)
    arc(x + w - r, y + h - r, 0)
    arc(x + r, y + h - r, Math.PI / 2)
    arc(x + r, y + r, Math.PI)
    return pts
}
// "M x y H x V y" link paths as points.
function hv(d: string): Pt[] {
    const pts: Pt[] = []
    let x = 0, y = 0
    for (const m of d.matchAll(/([MHVL])\s*(-?[\d.]+)(?:\s+(-?[\d.]+))?/g)) {
        if (m[1] === "M" || m[1] === "L") { x = +m[2]; y = +m[3] } else if (m[1] === "H") x = +m[2]; else y = +m[2]
        pts.push([x, y])
    }
    return pts
}
export function boxOf(P: Proj, x: number, y: number, w: number, h: number, pad: number, below: number) {
    const q = [P.p(x, y), P.p(x + w, y), P.p(x, y + h), P.p(x + w, y + h)]
    const xs = q.map((t) => t[0]), ys = q.map((t) => t[1])
    const x0 = Math.floor(Math.min(...xs) - pad), y0 = Math.floor(Math.min(...ys) - pad)
    const x1 = Math.ceil(Math.max(...xs) + pad), y1 = Math.ceil(Math.max(...ys) + below)
    return { box: `${x0} ${y0} ${x1 - x0} ${y1 - y0}`, aspect: (x1 - x0) / (y1 - y0) }
}

const CX = VIEW.x + VIEW.w / 2, CY = VIEW.y + VIEW.h / 2, DIST = 2600
export const proj = (pose: Pose) => projector(pose, CX, CY, DIST)
const FRAME = boxOf(proj(REST), VIEW.x, VIEW.y, VIEW.w, VIEW.h, 12, 44)
export const TOPO_ASPECT = FRAME.aspect

export const SITES = {
    yongdu: { x: 44, y: 10, w: 296, h: 96 },
    goyang: { x: 378, y: 10, w: 312, h: 96 },
    seokchon: { x: 44, y: 146, w: 296, h: 254 },
    aws: { x: 378, y: 146, w: 312, h: 434 },
    daejeon: { x: 44, y: 438, w: 296, h: 216 },
} as const
export type SiteId = keyof typeof SITES

const L = {
    usersSeokchon: "M-12 373 H44",
    usersDaejeon: "M-22 383 V480 H44",
    yongduGoyang: "M340 57 H378",
    yongduSeokchon: "M192 106 V146",
    goyangAws1: "M528 106 V146",
    goyangAws2: "M540 106 V146",
    seokchonAws1: "M340 367 H378",
    seokchonAws2: "M340 379 H378",
    seokchonDaejeon: "M192 400 V438",
} as const

// `on`: the sites a link joins, for the hover highlight. `at`: when it comes up in the entrance,
// after both of its ends are there.
const LINKS: { d: string; on: SiteId[]; at: number; wg?: boolean }[] = [
    { d: L.usersSeokchon, on: ["seokchon"], at: 1.5 },
    { d: L.usersDaejeon, on: ["daejeon"], at: 1.65 },
    { d: L.seokchonDaejeon, on: ["seokchon", "daejeon"], at: 1.75, wg: true },
    { d: L.seokchonAws1, on: ["seokchon", "aws"], at: 1.85 },
    { d: L.seokchonAws2, on: ["seokchon", "aws"], at: 1.9 },
    { d: L.yongduSeokchon, on: ["yongdu", "seokchon"], at: 2 },
    { d: L.yongduGoyang, on: ["yongdu", "goyang"], at: 2.1 },
    { d: L.goyangAws1, on: ["goyang", "aws"], at: 2.15 },
    { d: L.goyangAws2, on: ["goyang", "aws"], at: 2.2 },
]

type RowSpec = { name: string; ip?: string; sub?: string; here?: boolean }

function Row({ P, x, y, w, row, d, last }: Readonly<{ P: Proj; x: number; y: number; w: number; row: RowSpec; d: number; last?: boolean }>) {
    return (
        <g className={`node ${row.here ? "here" : ""}`}>
            {row.here && <path className="here-bg" d={P.path(rr(x - 6, y + 1, w + 12, PITCH - 5, 7), true)} />}
            <g className="fade" style={v({ "--d": `${d}s` })}>
                <g className="settle">
                    <text className="row-title" transform={P.at(x, y + 13)} x={x} y={y + 13}>{row.name}</text>
                    {row.here && (
                        <g transform={P.at(x + 68, y + 10)}>
                            <rect className="here-pill" x={x + 68} y={y + 5} width={66} height={11} rx="5.5" />
                            <circle className="here-dot" cx={x + 74} cy={y + 10.5} r="2" />
                            <text className="here-tag" x={x + 79} y={y + 13}>You are here</text>
                        </g>
                    )}
                    {row.ip && <text className="row-detail" transform={P.at(x + w, y + 13)} x={x + w} y={y + 13} textAnchor="end">{row.ip}</text>}
                </g>
                {row.sub && <text className="row-sub reveal" transform={P.at(x, y + 26)} x={x} y={y + 26}>{row.sub}</text>}
            </g>
            {!last && <path className="sep" d={P.path([[x, y + 34.5], [x + w + 12, y + 34.5]])} />}
        </g>
    )
}

function Rows({ P, x, y, w, rows, d }: Readonly<{ P: Proj; x: number; y: number; w: number; rows: readonly RowSpec[]; d: number }>) {
    return rows.map((row, i) => <Row key={row.name} P={P} x={x} y={y + i * PITCH} w={w} row={row} d={d + i * 0.04} last={i === rows.length - 1} />)
}

// The three Yongdu VMs are small tiles side by side.
function Tile({ P, x, y, w, row, d }: Readonly<{ P: Proj; x: number; y: number; w: number; row: RowSpec; d: number }>) {
    return (
        <g className="node">
            <path className="tile" d={P.path(rr(x, y, w, 32, 8), true)} />
            <g className="fade" style={v({ "--d": `${d}s` })}>
                <text className="row-title" transform={P.at(x + 8, y + 13)} x={x + 8} y={y + 13}>{row.name}</text>
                {row.sub && <text className="row-sub" transform={P.at(x + 8, y + 25)} x={x + 8} y={y + 25}>{row.sub}</text>}
            </g>
        </g>
    )
}

// Proxmox VE and the VPC are inset groups inside their site.
function Group(p: Readonly<{ P: Proj; x: number; y: number; w: number; h: number; caption: string; right?: string; d: number }>) {
    const { P } = p
    return (
        <g className="fade" style={v({ "--d": `${p.d}s` })}>
            <path className="group" d={P.path(rr(p.x, p.y, p.w, p.h, 12), true)} />
            <text className="caption" transform={P.at(p.x + 10, p.y + 12)} x={p.x + 10} y={p.y + 12}>{p.caption}</text>
            {p.right && <text className="caption" transform={P.at(p.x + p.w - 10, p.y + 12)} x={p.x + p.w - 10} y={p.y + 12} textAnchor="end">{p.right}</text>}
        </g>
    )
}

function Site(p: Readonly<{ P: Proj; id: SiteId; name: string; cidr: string; d: number; cloud?: boolean; rule?: boolean; children?: ReactNode }>) {
    const { P } = p
    const s = SITES[p.id]
    const Icon = p.cloud ? Cloud : Server
    return (
        <g className={`site s-${p.id}`} style={v({ "--rise": `${p.d}s` })}>
            {/* One sheet, one line. Depth is the projection's job — a drawn thickness made it look
                like cheap glass rather than a pane held at an angle. */}
            <path className="spec" d={P.path(rr(s.x, s.y, s.w, s.h, 20), true)} />
            <path className="card" d={P.path(rr(s.x, s.y, s.w, s.h, 20), true)} />
            <g transform={P.at(s.x + 12, s.y + 13)}>
                <Icon className="ico" x={s.x + 12} y={s.y + 8.5} width={11} height={11} strokeWidth={2} aria-hidden="true" />
            </g>
            <text className="site-name" transform={P.at(s.x + 28, s.y + 17.5)} x={s.x + 28} y={s.y + 17.5}>{p.name}</text>
            <text className="site-cidr" transform={P.at(s.x + s.w - 12, s.y + 17.5)} x={s.x + s.w - 12} y={s.y + 17.5} textAnchor="end">{p.cidr}</text>
            {p.rule !== false && <path className="sep" d={P.path([[s.x + 12, s.y + 25.5], [s.x + s.w - 12, s.y + 25.5]])} />}
            {p.children}
        </g>
    )
}

// A capsule that rides its path nose first; hollow means encapsulated (inside a tunnel).
function Packet(p: Readonly<{ P: Proj; d: string; dur: number; delay: number; hollow?: boolean }>) {
    return <rect className={`pkt ${p.hollow ? "hollow" : ""}`} x={-4} y={-1.6} width={8} height={3.2} rx={1.6} style={v({ offsetPath: `path("${p.P.path(hv(p.d))}")`, "--dur": `${p.dur}s`, "--delay": `${p.delay}s` })} />
}

function Tag({ P, x, y, end, mid, children }: Readonly<{ P: Proj; x: number; y: number; end?: boolean; mid?: boolean; children: ReactNode }>) {
    return <text className="tag" transform={P.at(x, y)} x={x} y={y} textAnchor={end ? "end" : mid ? "middle" : undefined}>{children}</text>
}

const SEOKCHON: RowSpec[] = [
    { name: "phy-ops-nginx-reverse-proxy", ip: "192.168.10.10", sub: "nginx proxy manager, zabbix proxy, livekit, matrix" },
    { name: "synology-nas", ip: "192.168.10.3", sub: "rustfs, s3 endpoint, docmost, directus" },
    { name: "phy-dev-odyssey-01", ip: "192.168.10.83", sub: "transnote, phase, outline" },
    { name: "vm-dev-odyssey", ip: "192.168.10.5", sub: "nangman infra homepage" },
    { name: "phy-dev-pi5-app", ip: "192.168.10.62", sub: "mail" },
    { name: "OPNsense", ip: "192.168.10.1", sub: "gateway, CGW, wg0 172.16.0.1/23, IPsec, AWS VPN" },
]
const DAEJEON: RowSpec[] = [
    { name: "phy-ops-reverse-proxy-manager", ip: "wg0 172.16.0.11/23", sub: "public edge host, nginx proxy manager, rybbit" },
    { name: "phy-dev-code-server", ip: "192.168.11.133", sub: "wg0 172.16.0.24, coder" },
    { name: "website host", ip: "192.168.11.134", sub: "wg0 172.16.0.15, this website, watchtower, netlab", here: true },
    { name: "vm-dev-infra-management", ip: "192.168.10.23", sub: "wg0 172.16.0.14, element, uptime kuma, harbor" },
    { name: "vm-dev-*, six lab member VMs", ip: "192.168.10.0/23", sub: "wg0 172.16.0.5 to .10, one VM per member" },
]
const AWS: RowSpec[] = [
    { name: "ec2-ops-teleport-apn2a", sub: "teleport" },
    { name: "ec2-ops-teleport-access-apn2a", sub: "teleport access" },
    { name: "ec2-dev-yunseo-apn2a", ip: "10.120.5.142" },
    { name: "ec2-ops-mgmt-apn2c", sub: "ansible, wazuh" },
    { name: "Authentik, Huly", sub: "identity provider, team workspace" },
    { name: "ECS nangman-zabbix-cluster-dev", sub: "grafana, zabbix server, zabbix web" },
    { name: "ECS nangman-mattermost-cluster-dev", sub: "mattermost" },
    { name: "ECS nangman-sonarqube-cluster-dev", sub: "sonarqube" },
    { name: "ECS ecs-nangman-dev-jenkins-apn2", sub: "jenkins" },
]
const ROUTE53: RowSpec = { name: "Route 53, nangman.cloud", sub: "public hosted zone" }
const YONGDU: RowSpec[] = [
    { name: "OPNsense", sub: "192.168.20.1" },
    { name: "CML", sub: "192.168.20.3" },
    { name: "CML proxy", sub: "192.168.20.188" },
]
const GOYANG: RowSpec = { name: "OPNsense", ip: "192.168.1.1", sub: "gateway, CGW, IPsec to Yongdu, AWS VPN" }

// The exhibition drives the map: it says where to look (`box`, a viewBox in projected space) and
// how the network is turned (`pose`). Nothing here follows the pointer any more — the scroll is the
// only thing that moves the object, the way a piece on a stand is walked around.
export function Topology() {
    const ref = useRef<SVGSVGElement>(null)
    const [pose, setPose] = useState<Pose>(ENTER)
    const live = useRef<Pose>(ENTER)
    const aim = useRef<Pose>(REST)
    const settled = useRef(false)
    const raf = useRef(0)

    // One loop eases the drawing toward whatever angle it is aiming at: slowly as it arrives, then
    // quickly enough to feel attached to the pointer. It stops as soon as the two meet.
    useEffect(() => {
        const hero = ref.current?.closest<HTMLElement>(".hero") ?? null
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true
        const step = () => {
            const k = settled.current ? 0.09 : 0.035
            const next = {
                yaw: live.current.yaw + (aim.current.yaw - live.current.yaw) * k,
                pitch: live.current.pitch + (aim.current.pitch - live.current.pitch) * k,
            }
            live.current = next
            setPose(next)
            const done = Math.abs(next.yaw - aim.current.yaw) + Math.abs(next.pitch - aim.current.pitch) < 0.04
            raf.current = done ? 0 : requestAnimationFrame(step)
        }
        const run = () => { if (!raf.current) raf.current = requestAnimationFrame(step) }
        if (reduce) {
            raf.current = requestAnimationFrame(() => { live.current = REST; setPose(REST) })
            return () => cancelAnimationFrame(raf.current)
        }
        const rise = window.setTimeout(run, 900)
        const done = window.setTimeout(() => { settled.current = true }, 2800)
        const onMove = (e: PointerEvent) => {
            const r = hero?.getBoundingClientRect()
            if (!r) return
            const mx = ((e.clientX - r.left) / r.width) * 2 - 1
            const my = ((e.clientY - r.top) / r.height) * 2 - 1
            aim.current = { yaw: REST.yaw + YAW_BY * mx, pitch: REST.pitch - PITCH_BY * my }
            run()
        }
        const onLeave = () => { aim.current = REST; run() }
        const follows = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false
        if (hero && follows) {
            hero.addEventListener("pointermove", onMove)
            hero.addEventListener("pointerleave", onLeave)
        }
        return () => {
            clearTimeout(rise)
            clearTimeout(done)
            cancelAnimationFrame(raf.current)
            hero?.removeEventListener("pointermove", onMove)
            hero?.removeEventListener("pointerleave", onLeave)
        }
    }, [])

    const P = useMemo(() => proj(pose), [pose])
    // where the light pools on each pane: it slides with the turn, the way a real sheet does
    const tx = (pose.yaw - REST.yaw) / YAW_BY, ty = (pose.pitch - REST.pitch) / PITCH_BY
    const sx = 50 + tx * 340, sy = 121 - ty * 240

    return (
        <svg ref={ref} className="topo" viewBox={FRAME.box} role="img"
            aria-label="Nangman hybrid network: Yongdu, Goyang, Seokchon and Daejeon on-prem sites and an AWS VPC, joined by IPsec, WireGuard and site-to-site VPN">
            <defs>
                {/* One light for the whole drawing, measured in the drawing's own coordinates: every
                    pane shows the part of the sweep it happens to lie under, the way a row of glass
                    on a table shares one window. Per-pane gradients repeated the same band inside
                    each card, which read as a smudge. The sweep slides as the map turns. */}
                <linearGradient id="topo-spec" gradientUnits="userSpaceOnUse"
                    x1={fx(sx)} y1={fx(sy)} x2={fx(sx + 560)} y2={fx(sy + 431)}>
                    <stop offset="0" stopColor="transparent" />
                    <stop offset="0.38" stopColor="var(--spec)" />
                    <stop offset="0.62" stopColor="var(--spec2)" />
                    <stop offset="1" stopColor="transparent" />
                </linearGradient>
                {/* The edge is not drawn all the way round: it is lit. The same sweep runs along the
                    outline, so the sides facing the light come up and the rest of the perimeter has
                    all but nothing in it — which is what stops a pane reading as an outlined box. */}
                <linearGradient id="topo-rim" gradientUnits="userSpaceOnUse"
                    x1={fx(sx + 40)} y1={fx(sy + 30)} x2={fx(sx + 560)} y2={fx(sy + 431)}>
                    <stop offset="0" stopColor="var(--rim-off)" />
                    <stop offset="0.34" stopColor="var(--rim-on)" />
                    <stop offset="0.58" stopColor="var(--rim-mid)" />
                    <stop offset="1" stopColor="var(--rim-off)" />
                </linearGradient>
            </defs>

            {LINKS.map((l) => (
                <path key={l.d} className={`link ${l.on.map((s) => `s-${s}`).join(" ")} ${l.wg ? "wg fade" : "draw"}`} d={P.path(hv(l.d))} pathLength={1} style={v({ "--d": `${l.at}s` })} />
            ))}

            <g className="fade" style={v({ "--d": "2.3s" })}>
                <Tag P={P} x={359} y={51} mid>IPsec</Tag>
                <Tag P={P} x={200} y={130}>IPsec</Tag>
                <Tag P={P} x={548} y={130}>AWS VPN, 2 tunnels</Tag>
                <Tag P={P} x={518} y={118} end>CGW</Tag>
                <Tag P={P} x={518} y={142} end>VGW</Tag>
                <Tag P={P} x={359} y={358} mid>VPN</Tag>
                <Tag P={P} x={200} y={423}>WireGuard 172.16.0.0/23</Tag>
            </g>

            <g className="users" style={v({ "--rise": "1.2s" })}>
                <g transform={P.at(-22, 373)}>
                    <circle className="users-dot" cx="-22" cy="373" r="10" />
                    <Users className="ico" x={-28} y={367} width={12} height={12} strokeWidth={2} aria-hidden="true" />
                    <text className="tag" x="-22" y="354" textAnchor="middle">users</text>
                </g>
            </g>

            <Site P={P} id="seokchon" name="Seokchon LAN" cidr="192.168.10.0/24" d={1.3}>
                <Rows P={P} x={56} y={172} w={272} rows={SEOKCHON} d={1.55} />
            </Site>
            <Site P={P} id="daejeon" name="Daejeon LAN" cidr="192.168.10.0/23" d={1.55}>
                <Rows P={P} x={56} y={464} w={272} rows={DAEJEON} d={1.8} />
            </Site>
            <Site P={P} id="aws" name="AWS Cloud" cidr="ap-northeast-2" d={1.65} cloud rule={false}>
                <Group P={P} x={386} y={172} w={296} h={360} caption="VPC" right="10.120.0.0/20" d={1.85} />
                <Rows P={P} x={398} y={196} w={272} rows={AWS} d={1.95} />
                <Row P={P} x={390} y={540} w={288} row={ROUTE53} d={2.3} last />
            </Site>
            <Site P={P} id="yongdu" name="Yongdu LAN" cidr="192.168.20.0/24" d={1.8} rule={false}>
                <Group P={P} x={52} y={36} w={280} h={62} caption="Proxmox VE" d={2} />
                <Tile P={P} x={58} y={54} w={88} row={YONGDU[0]} d={2.1} />
                <Tile P={P} x={149} y={54} w={88} row={YONGDU[1]} d={2.14} />
                <Tile P={P} x={240} y={54} w={88} row={YONGDU[2]} d={2.18} />
            </Site>
            <Site P={P} id="goyang" name="Goyang LAN" cidr="192.168.1.0/24" d={1.9} rule={false}>
                <Group P={P} x={386} y={36} w={296} h={62} caption="Proxmox VE" d={2.1} />
                <Row P={P} x={398} y={54} w={272} row={GOYANG} d={2.2} last />
            </Site>

            <g className="pkts">
                <Packet P={P} d={L.usersSeokchon} dur={7} delay={2.9} />
                <Packet P={P} d={L.usersDaejeon} dur={9} delay={3.6} />
                <Packet P={P} d={L.seokchonAws1} dur={7} delay={5.2} />
                <Packet P={P} d="M378 379 H340" dur={11} delay={8.8} />
                <Packet P={P} d={L.seokchonDaejeon} dur={7} delay={5.2} hollow />
                <Packet P={P} d="M192 438 V400" dur={9} delay={8} hollow />
                <Packet P={P} d={L.yongduSeokchon} dur={9} delay={6} hollow />
                <Packet P={P} d={L.yongduGoyang} dur={11} delay={7} hollow />
                <Packet P={P} d={L.goyangAws1} dur={11} delay={7.5} hollow />
            </g>
        </svg>
    )
}

// Phone layout: the five sites without their hosts, in the same arrangement, at a fixed angle.
const MV = { x: -30, y: 0, w: 390, h: 380 }
const PM = projector({ yaw: 10, pitch: 6 }, MV.x + MV.w / 2, MV.y + MV.h / 2, 1000)
const MFRAME = boxOf(PM, MV.x, MV.y, MV.w, MV.h, 8, 12)
const M = {
    usersSeokchon: "M0 174 H40",
    usersDaejeon: "M-10 184 V324 H40",
    yongduGoyang: "M168 54 H208",
    yongduSeokchon: "M92 92 V136",
    goyangAws1: "M270 92 V124",
    goyangAws2: "M282 92 V124",
    seokchonAws1: "M210 168 H222",
    seokchonAws2: "M210 180 H222",
    seokchonDaejeon: "M125 212 V286",
} as const

function MSite(p: Readonly<{ x: number; y: number; w: number; h: number; name: string; cidr: string; lines: string[]; d: number; cloud?: boolean }>) {
    const Icon = p.cloud ? Cloud : Server
    return (
        <g className="site" style={v({ "--rise": `${p.d}s` })}>
            <path className="card" d={PM.path(rr(p.x, p.y, p.w, p.h, 16), true)} />
            <g transform={PM.at(p.x + 10, p.y + 14)}>
                <Icon className="ico" x={p.x + 10} y={p.y + 8} width={12} height={12} strokeWidth={2} aria-hidden="true" />
            </g>
            <text className="site-name" transform={PM.at(p.x + 27, p.y + 18.5)} x={p.x + 27} y={p.y + 18.5}>{p.name}</text>
            <text className="site-cidr" transform={PM.at(p.x + 10, p.y + 36)} x={p.x + 10} y={p.y + 36}>{p.cidr}</text>
            {p.lines.map((s, i) => <text key={s} className="row-sub" transform={PM.at(p.x + 10, p.y + 50 + i * 14)} x={p.x + 10} y={p.y + 50 + i * 14}>{s}</text>)}
        </g>
    )
}

export function TopologyMobile() {
    const links: { d: string; at: number; wg?: boolean }[] = [
        { d: M.usersSeokchon, at: 1.5 }, { d: M.usersDaejeon, at: 1.65 }, { d: M.seokchonDaejeon, at: 1.75, wg: true },
        { d: M.seokchonAws1, at: 1.85 }, { d: M.seokchonAws2, at: 1.9 }, { d: M.yongduSeokchon, at: 2 },
        { d: M.yongduGoyang, at: 2.1 }, { d: M.goyangAws1, at: 2.15 }, { d: M.goyangAws2, at: 2.2 },
    ]
    return (
        <svg className="topo topo-m" viewBox={MFRAME.box} role="img" aria-label="Nangman hybrid network: four on-prem sites and an AWS VPC, joined by IPsec, WireGuard and site-to-site VPN">
            {links.map((l) => <path key={l.d} className={`link ${l.wg ? "wg fade" : "draw"}`} d={PM.path(hv(l.d))} pathLength={1} style={v({ "--d": `${l.at}s` })} />)}
            <g className="fade" style={v({ "--d": "2.3s" })}>
                <Tag P={PM} x={188} y={44} mid>IPsec</Tag>
                <Tag P={PM} x={100} y={118}>IPsec</Tag>
                <Tag P={PM} x={290} y={112}>AWS VPN</Tag>
                <Tag P={PM} x={133} y={246}>WireGuard</Tag>
                <Tag P={PM} x={133} y={260}>172.16.0.0/23</Tag>
            </g>
            <g className="users" style={v({ "--rise": "1.2s" })}>
                <g transform={PM.at(-10, 174)}>
                    <circle className="users-dot" cx="-10" cy="174" r="10" />
                    <Users className="ico" x={-16} y={168} width={12} height={12} strokeWidth={2} aria-hidden="true" />
                    <text className="tag" x="-10" y="155" textAnchor="middle">users</text>
                </g>
            </g>
            <MSite x={40} y={136} w={170} h={76} name="Seokchon LAN" cidr="192.168.10.0/24" lines={["OPNsense, wg0 172.16.0.1", "nginx proxy manager"]} d={1.3} />
            <MSite x={40} y={286} w={170} h={76} name="Daejeon LAN" cidr="192.168.10.0/23" lines={["edge npm wg0 172.16.0.11", "hosts on wg0 172.16.0.x"]} d={1.55} />
            <MSite x={222} y={124} w={122} h={90} name="AWS VPC" cidr="10.120.0.0/20" lines={["teleport, ecs", "route 53", "4 VPN tunnels"]} d={1.65} cloud />
            <MSite x={16} y={16} w={152} h={76} name="Yongdu LAN" cidr="192.168.20.0/24" lines={["OPNsense, Proxmox", "CML lab"]} d={1.8} />
            <MSite x={208} y={16} w={136} h={76} name="Goyang LAN" cidr="192.168.1.0/24" lines={["OPNsense, Proxmox", "CGW, AWS VPN"]} d={1.9} />
            <g className="pkts">
                <Packet P={PM} d={M.usersSeokchon} dur={7} delay={2.9} />
                <Packet P={PM} d={M.usersDaejeon} dur={9} delay={3.6} />
                <Packet P={PM} d={M.seokchonAws1} dur={7} delay={5.2} />
                <Packet P={PM} d={M.seokchonDaejeon} dur={7} delay={5.2} hollow />
                <Packet P={PM} d={M.yongduSeokchon} dur={9} delay={6} hollow />
                <Packet P={PM} d={M.goyangAws1} dur={11} delay={7.5} hollow />
            </g>
        </svg>
    )
}
