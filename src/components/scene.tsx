"use client"

import { useEffect, useRef, type ReactNode } from "react"

// A full-screen section whose animations play while it is on screen: `data-in` is set when a
// quarter of it is visible and removed when it leaves, so every visit replays the choreography
// and nothing animates off-screen.
export function Scene({ id, title, className = "", children }: Readonly<{ id?: string; title: string; className?: string; children: ReactNode }>) {
    const ref = useRef<HTMLElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) el.setAttribute("data-in", "")
            else el.removeAttribute("data-in")
        }, { threshold: 0.25 })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    return (
        <section ref={ref} id={id} data-title={title} className={`scene ${className}`}>
            <div className="scene-grid" aria-hidden="true" />
            <span className="hop" aria-hidden="true" />
            {children}
        </section>
    )
}
