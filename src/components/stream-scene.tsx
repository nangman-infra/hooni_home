import type { CSSProperties } from "react"
import { GlassRim } from "@/components/glass-rim"

const v = (o: Record<string, string>) => o as CSSProperties

// Project 3 as it was run: the same video goes sender → emulator → receiver over TCP and over UDP,
// and the emulator adds loss, delay, jitter and reorder. One clock per lane (--t, in seconds)
// drives every frame and player cell: frame 3 is lost in both lanes; TCP asks for it again and
// the player waits for it, UDP plays on without it.
const LEAVE = [0, 0.45, 0.9, 1.35, 1.8, 2.25]
const TRAVEL = 3
const arrive = LEAVE.map((t) => t + TRAVEL)
const ACK = arrive[3] // the receiver notices the gap when frame 4 lands
const RESEND = ACK + TRAVEL // and the sender hears about it one trip later
const tcpOn = [arrive[0], arrive[1], RESEND + TRAVEL, RESEND + TRAVEL + 0.15, RESEND + TRAVEL + 0.3, RESEND + TRAVEL + 0.45]
const udpOn = [arrive[0], arrive[1], null, arrive[3], arrive[4], arrive[5]]

function Lane({ y, tcp }: Readonly<{ y: number; tcp: boolean }>) {
    const path = `M90 ${y} H390`
    const d = tcp ? 0 : 0.4
    return (
        <g className="lane">
            <text className="name fade" x="10" y={y - 42} style={v({ "--d": `${d}s` })}>{tcp ? "TCP" : "UDP"}</text>
            <path className="wire draw" d={`M90 ${y} H172`} pathLength={1} style={v({ "--d": `${d + 0.3}s` })} />
            <path className="wire draw" d={`M308 ${y} H390`} pathLength={1} style={v({ "--d": `${d + 0.35}s` })} />
            <rect className="glow fade" x="10" y={y - 23} width="80" height="46" rx="5" style={v({ "--d": `${d}s` })} />
                <rect className="box draw fill" x="10" y={y - 23} width="80" height="46" rx="5" pathLength={1} style={v({ "--d": `${d}s` })} />
            <text className="name fade" x="22" y={y - 4} style={v({ "--d": `${d + 0.5}s` })}>sender</text>
            <text className="fade" x="22" y={y + 12} style={v({ "--d": `${d + 0.55}s` })}>video</text>
            <rect className="glow fade" x="172" y={y - 28} width="136" height="56" rx="5" style={v({ "--d": `${d + 0.2}s` })} />
                <rect className="box draw fill" x="172" y={y - 28} width="136" height="56" rx="5" pathLength={1} style={v({ "--d": `${d + 0.2}s` })} />
            <text className="name fade" x="188" y={y - 9} style={v({ "--d": `${d + 0.7}s` })}>emulator</text>
            <text className="fade" x="188" y={y + 7} style={v({ "--d": `${d + 0.75}s` })}>loss, delay,</text>
            <text className="fade" x="188" y={y + 21} style={v({ "--d": `${d + 0.8}s` })}>jitter, reorder</text>
            <rect className="glow fade" x="390" y={y - 23} width="80" height="46" rx="5" style={v({ "--d": `${d + 0.4}s` })} />
                <rect className="box draw fill" x="390" y={y - 23} width="80" height="46" rx="5" pathLength={1} style={v({ "--d": `${d + 0.4}s` })} />
            <text className="name fade" x="402" y={y - 4} style={v({ "--d": `${d + 0.9}s` })}>receiver</text>
            <text className="fade" x="402" y={y + 12} style={v({ "--d": `${d + 0.95}s` })}>player</text>
            <text className="note fade" x="10" y={y + 60} style={v({ "--d": `${d + 1.2}s` })}>
                {tcp ? "every frame arrives, but playback stalls while frame 3 is resent" : "playback keeps time, but frame 3 is skipped"}
            </text>

            {(tcp ? tcpOn : udpOn).map((on, i) => (
                <rect key={i} className={`cell ${on === null ? "skip" : ""}`} x={390 + i * 13.5} y={y + 31} width="11.5" height="10" rx="1" style={on === null ? undefined : v({ "--on": `${on}` })} />
            ))}
            {LEAVE.map((leave, i) => (
                <rect key={i} className={`fr ${i === 2 ? "lost" : ""}`} x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: `path("${path}")`, "--leave": `${leave}` })} />
            ))}
            {tcp && (
                <>
                    <rect className="fr ack" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: `path("M390 ${y} H90")`, "--leave": `${ACK}` })} />
                    <rect className="fr" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: `path("${path}")`, "--leave": `${RESEND}` })} />
                </>
            )}
        </g>
    )
}

export function StreamScene() {
    return (
        <div aria-hidden="true">
            <svg className="viz v-str stream" viewBox="0 0 480 340">
                <GlassRim id="str" x={0} y={0} w={480} h={340} />
                <Lane y={86} tcp />
                <Lane y={236} tcp={false} />
            </svg>
        </div>
    )
}
