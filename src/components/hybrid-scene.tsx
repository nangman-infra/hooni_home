import type { CSSProperties } from "react"
import { GlassRim } from "@/components/glass-rim"

const v = (o: Record<string, string>) => o as CSSProperties

// Project 1 at the level the design doc works at: the five networks with their address plans, the
// gateway of each, and the tunnels between them, in the arrangement of Topology.png. Red marks
// the two ranges that overlap; amber marks the overlay that gets around it.
//
// Each box is a header — the network's name with its address on the right, the way the hero map
// sets a site — and then what runs in it, one line each. Geometry is derived from the column and
// row constants so the links, the labels and the packets cannot drift apart.
const W = 196, C0 = 40, C1 = 286, R0 = C0 + W, M0 = C0 + W / 2
const HEAD = 20, LINE = 38, STEP = 12.5, FOOT = 10
const boxH = (n: number) => LINE + (n - 1) * STEP + FOOT

type Line = { t: string; cls?: string }
type Box = { x: number; y: number; name: string; head: string; headCls?: string; lines: Line[]; d: number }
const BOXES: Box[] = [
    { x: C0, y: 12, name: "Yongdu LAN", head: "192.168.20.0/24", d: 0.5, lines: [{ t: "OPNsense, Proxmox, CML" }] },
    { x: C1, y: 12, name: "Goyang LAN", head: "192.168.1.0/24", d: 0.6, lines: [{ t: "OPNsense (CGW), Proxmox" }] },
    { x: C0, y: 110, name: "Seokchon LAN", head: "192.168.10.0/24", headCls: "clash", d: 0.2, lines: [{ t: "OPNsense (CGW), inbound" }, { t: "wg0 172.16.0.1/23, hub", cls: "addr sigtext" }, { t: "Nginx Proxy Manager" }] },
    { x: C1, y: 110, name: "AWS VPC", head: "ap-northeast-2", d: 0.3, lines: [{ t: "10.120.0.0/20", cls: "addr" }, { t: "VGW, four VPN tunnels" }, { t: "EC2, ECS, Teleport" }, { t: "Route 53, nangman.cloud" }] },
    { x: C0, y: 236, name: "Daejeon LAN", head: "192.168.10.0/23", headCls: "clash", d: 0.4, lines: [{ t: "edge wg0 172.16.0.11/23", cls: "addr sigtext" }, { t: "hosts: wg0 172.16.0.x", cls: "addr" }] },
]
const BOTTOM = (b: Box) => b.y + boxH(b.lines.length)

const IN_USERS = `M-6 150 H${C0}`
const TOP_IPSEC = `M${R0} 38 H${C1}`
const UP_IPSEC = `M${M0} 110 V${BOTTOM(BOXES[0])}`
const AWS_VPN = [`M378 ${BOTTOM(BOXES[1])} V110`, `M390 ${BOTTOM(BOXES[1])} V110`]
const TO_AWS = [`M${R0} 145 H${C1}`, `M${R0} 157 H${C1}`]
const OVERLAY = `M${M0} ${BOTTOM(BOXES[2])} V236`

const LINKS = [
    { d: IN_USERS, delay: 1.0 },
    { d: TOP_IPSEC, delay: 1.1 },
    { d: `M${M0} ${BOTTOM(BOXES[0])} V110`, delay: 1.15 },
    { d: AWS_VPN[0], delay: 1.2 },
    { d: AWS_VPN[1], delay: 1.25 },
    { d: TO_AWS[0], delay: 1.3 },
    { d: TO_AWS[1], delay: 1.35 },
    { d: OVERLAY, delay: 1.4, wg: true },
]

export function HybridScene() {
    return (
        <div aria-hidden="true">
            <svg className="viz v-hyb" viewBox="-62 0 548 340">
                <GlassRim id="hyb" x={-62} y={0} w={548} h={340} />
                {LINKS.map((l) => (
                    <path key={l.d} className={`wire ${l.wg ? "wg fade" : "draw"}`} d={l.d} pathLength={1} style={v({ "--d": `${l.delay}s` })} />
                ))}
                <circle className="glow fade" cx="-14" cy="150" r="8" style={v({ "--d": "0.8s" })} />
                <circle className="box draw fill" cx="-14" cy="150" r="8" pathLength={1} style={v({ "--d": "0.8s" })} />
                <text className="tag fade" x="-14" y="172" textAnchor="middle" style={v({ "--d": "1.3s" })}>users</text>
                {BOXES.map((b) => (
                    <g key={b.name}>
                        <rect className="glow fade" x={b.x} y={b.y} width={W} height={boxH(b.lines.length)} rx="5" style={v({ "--d": `${b.d}s` })} />
                <rect className="box draw fill" x={b.x} y={b.y} width={W} height={boxH(b.lines.length)} rx="5" pathLength={1} style={v({ "--d": `${b.d}s` })} />
                        <text className="name fade" x={b.x + 11} y={b.y + HEAD} style={v({ "--d": `${b.d + 0.5}s` })}>{b.name}</text>
                        <text className={`addr fade ${b.headCls ?? ""}`} x={b.x + W - 11} y={b.y + HEAD} textAnchor="end" style={v({ "--d": `${b.d + 0.55}s` })}>{b.head}</text>
                        {b.lines.map((l, i) => (
                            <text key={l.t} className={`fade ${l.cls ?? ""}`} x={b.x + 11} y={b.y + LINE + i * STEP} style={v({ "--d": `${b.d + 0.6 + i * 0.05}s` })}>{l.t}</text>
                        ))}
                    </g>
                ))}
                <g className="fade" style={v({ "--d": "1.8s" })}>
                    <text className="tag" x="261" y="32" textAnchor="middle">IPsec</text>
                    <text className="tag" x="146" y="90">IPsec</text>
                    <text className="tag" x="398" y="90">AWS VPN</text>
                    <text className="tag" x="261" y="137" textAnchor="middle">AWS VPN</text>
                    <text className="tag" x="146" y="208">WireGuard overlay</text>
                    <text className="tag addr sigtext" x="146" y="220">172.16.0.0/23</text>
                </g>
                <text className="note fade" x="40" y="322" style={v({ "--d": "2.2s" })}>192.168.10.x exists on both Seokchon and Daejeon,</text>
                <text className="note fade" x="40" y="336" style={v({ "--d": "2.2s" })}>so Daejeon is reached by its overlay address.</text>

                <circle className="pk" r="3.2" style={v({ offsetPath: `path("${IN_USERS}")`, "--dur": "6s", "--d": "2.4s" })} />
                <circle className="pk" r="3.2" style={v({ offsetPath: `path("${TO_AWS[0]}")`, "--dur": "6s", "--d": "3.2s" })} />
                <circle className="pk hollow" r="3.2" style={v({ offsetPath: `path("${OVERLAY}")`, "--dur": "6s", "--d": "3.8s" })} />
                <circle className="pk hollow" r="3.2" style={v({ offsetPath: `path("${UP_IPSEC}")`, "--dur": "7s", "--d": "4.4s" })} />
                <circle className="pk hollow" r="3.2" style={v({ offsetPath: `path("${TOP_IPSEC}")`, "--dur": "7s", "--d": "5s" })} />
                <circle className="pk hollow" r="3.2" style={v({ offsetPath: `path("${AWS_VPN[0]}")`, "--dur": "7s", "--d": "5.6s" })} />
            </svg>
        </div>
    )
}
