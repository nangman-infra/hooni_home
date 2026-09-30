"use client"

import { useEffect, useRef, type ReactNode } from "react"

// A glass pane holding one of the project drawings. Its choreography plays while it is on screen:
// `data-in` is set when a quarter of it is visible and removed when it leaves.
export function Fig({ children }: Readonly<{ children: ReactNode }>) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.setAttribute("data-in", ""); else el.removeAttribute("data-in") }, { threshold: 0.25 })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    return <div ref={ref} className="pa-fig">{children}</div>
}
