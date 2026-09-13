"use client"

import "./light-field.css"
import type { CSSProperties } from "react"

// The light that runs behind everything: broad washes of colour that bend slowly past each other,
// never stopping and never reacting to anything. Its whole job is to be the thing the glass panes of
// the map show through — which is the only reason they read as glass. Each wash is one soft radial
// gradient, so nothing is filtered and only transform and opacity move.
const WASH = [
    { c: "a", x: 66, y: 26, w: 64, h: 52, o: 1, dur: 58, at: -6, dx: 5, dy: -4, sc: 1.18 },
    { c: "b", x: 82, y: 58, w: 58, h: 48, o: 0.95, dur: 74, at: -28, dx: -6, dy: 5, sc: 1.22 },
    { c: "c", x: 54, y: 74, w: 62, h: 44, o: 0.8, dur: 66, at: -44, dx: 4, dy: 6, sc: 1.14 },
    { c: "d", x: 92, y: 18, w: 46, h: 40, o: 0.7, dur: 88, at: -15, dx: -5, dy: -3, sc: 1.25 },
    { c: "b", x: 40, y: 40, w: 50, h: 42, o: 0.55, dur: 96, at: -61, dx: 6, dy: 4, sc: 1.1 },
    { c: "e", x: 74, y: 44, w: 34, h: 28, o: 0.85, dur: 52, at: -33, dx: -4, dy: 5, sc: 1.3 },
    // the name's half of the page gets its own light, so the pointer has something to open there too
    { c: "a", x: 16, y: 38, w: 48, h: 42, o: 0.8, dur: 82, at: -22, dx: 5, dy: 4, sc: 1.16 },
    { c: "c", x: 27, y: 68, w: 44, h: 38, o: 0.65, dur: 94, at: -49, dx: -4, dy: -5, sc: 1.2 },
    { c: "e", x: 10, y: 18, w: 30, h: 26, o: 0.55, dur: 70, at: -12, dx: 4, dy: 5, sc: 1.24 },
] as const

// One ground of light for the whole page: the hero lays it behind the map, the resume lays it behind
// the scenes at half strength so type stays easy to read. It drifts on its own and travels with the
// scroll (light-field.css), so the page reads as one run from the first screen to the last.
export function LightField({ calm, hush }: Readonly<{ calm?: boolean; hush?: boolean }>) {
    return (
        <div className={`light-field${calm ? " calm" : ""}${hush ? " hush" : ""}`} aria-hidden="true">
            {WASH.map((b, i) => (
                <i key={i} className={`w-${b.c}`} style={{ "--x": `${b.x}%`, "--y": `${b.y}%`, "--w": `${b.w}vw`, "--h": `${b.h}vh`, "--o": b.o, "--dur": `${b.dur}s`, "--at": `${b.at}s`, "--dx": `${b.dx}%`, "--dy": `${b.dy}%`, "--sc": b.sc } as CSSProperties} />
            ))}
        </div>
    )
}
