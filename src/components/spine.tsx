"use client"

import { useEffect, useState } from "react"

// One route down the whole page. The packet stays fixed at mid-screen while the page moves past
// it, and whichever scene covers the middle of the viewport is the hop it has reached.
export function Spine() {
    const [hop, setHop] = useState<{ n: number; total: number; title: string } | null>(null)
    useEffect(() => {
        const scenes = Array.from(document.querySelectorAll<HTMLElement>("section.scene"))
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue
                const here = e.target as HTMLElement
                scenes.forEach((s) => s.toggleAttribute("data-here", s === here))
                setHop({ n: scenes.indexOf(here) + 1, total: scenes.length, title: here.dataset.title ?? "" })
            }
        }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 })
        scenes.forEach((s) => io.observe(s))
        return () => io.disconnect()
    }, [])
    return (
        <div className="spine" aria-hidden="true">
            <div className="spine-line" />
            <div className="spine-fill" />
            <div className="spine-pkt" />
            {/* keyed on the hop, so it remounts and rings once each time the packet arrives */}
            {hop && <span key={hop.n} className="spine-ring" />}
            {hop && (
                <div className="spine-label">
                    <span>hop {hop.n} of {hop.total}</span>
                    <span>{hop.title}</span>
                </div>
            )}
        </div>
    )
}
