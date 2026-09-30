"use client"

import { useEffect } from "react"

/* The one place the page's live state is published, shared by both designs.

   Which hop you are on goes on <html data-hop> (the section whose middle is nearest the middle
   of the window). Where the pointer is and how hard the page is being thrown go on --px/--py/--vel.
   Both designs' canvases and stylesheets read these; nothing here draws anything. */
export function Pulse() {
    useEffect(() => {
        const secs = Array.from(document.querySelectorAll<HTMLElement>("main section[data-hop]"))
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue
                document.documentElement.dataset.hop = (e.target as HTMLElement).dataset.hop
            }
        }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 })
        secs.forEach((s) => io.observe(s))
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const fine = matchMedia("(hover: hover) and (pointer: fine)").matches
        const root = document.documentElement
        let tx = 0.5, ty = 0.5, x = 0.5, y = 0.5, vel = 0, was = scrollY, raf = 0
        const step = () => {
            x += (tx - x) * 0.08
            y += (ty - y) * 0.08
            const dy = Math.abs(scrollY - was)
            was = scrollY
            vel = Math.max(vel * 0.88, Math.min(1, dy / 110))
            root.style.setProperty("--px", x.toFixed(4))
            root.style.setProperty("--py", y.toFixed(4))
            root.style.setProperty("--vel", vel.toFixed(3))
            raf = Math.abs(tx - x) + Math.abs(ty - y) < 0.0008 && vel < 0.004 ? 0 : requestAnimationFrame(step)
        }
        const run = () => { if (!raf) raf = requestAnimationFrame(step) }
        const move = (e: PointerEvent) => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; run() }
        if (fine) addEventListener("pointermove", move, { passive: true })
        addEventListener("scroll", run, { passive: true })
        return () => {
            removeEventListener("pointermove", move)
            removeEventListener("scroll", run)
            cancelAnimationFrame(raf)
        }
    }, [])

    return null
}
