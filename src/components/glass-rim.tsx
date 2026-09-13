// The same material the hero map is made of, for the project drawings: one light sweeping the whole
// figure, so each pane shows the part of the rim the light happens to reach and the rest of its
// outline has next to nothing in it. Per-shape gradients repeat the same band inside every box and
// read as a pattern; one sweep over the drawing reads as a light.
export function GlassRim({ id, x, y, w, h }: Readonly<{ id: string; x: number; y: number; w: number; h: number }>) {
    const x1 = x - w * 0.05, y1 = y - h * 0.25
    return (
        <defs>
            <linearGradient id={`${id}-rim`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x1 + w * 1.05} y2={y1 + h * 1.5}>
                <stop offset="0" stopColor="var(--rim-off)" />
                <stop offset="0.34" stopColor="var(--rim-on)" />
                <stop offset="0.58" stopColor="var(--rim-mid)" />
                <stop offset="1" stopColor="var(--rim-off)" />
            </linearGradient>
            <linearGradient id={`${id}-face`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x1 + w * 1.05} y2={y1 + h * 1.5}>
                <stop offset="0" stopColor="transparent" />
                <stop offset="0.38" stopColor="var(--spec)" />
                <stop offset="0.62" stopColor="var(--spec2)" />
                <stop offset="1" stopColor="transparent" />
            </linearGradient>
        </defs>
    )
}
