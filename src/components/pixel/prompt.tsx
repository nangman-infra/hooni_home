"use client"

import { useEffect, useState } from "react"

/* The status line: user@host, and which command the page is on. It follows <html data-hop>. */
export function Prompt({ titles }: Readonly<{ titles: string[] }>) {
    const [hop, setHop] = useState(0)
    useEffect(() => {
        const el = document.documentElement
        const read = () => setHop(Number(el.dataset.hop || 0))
        read()
        const mo = new MutationObserver(read)
        mo.observe(el, { attributes: true, attributeFilter: ["data-hop"] })
        return () => mo.disconnect()
    }, [])
    return (
        <div className="px-bar" aria-hidden="true">
            <span><b>hooni</b>@daejeon<i>:~$</i></span>
            <span className="px-bar-r">[{String(hop).padStart(2, "0")}/{String(titles.length - 1).padStart(2, "0")}] {titles[hop] ?? ""}</span>
        </div>
    )
}
