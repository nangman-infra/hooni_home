"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export function ResumeRevealWrapper({ children }: { children: React.ReactNode }) {
    const { scrollY } = useScroll()

    // Counter-scroll logic:
    // As user scrolls down (0 to 600px), native browser moves content UP.
    // We translate it DOWN by the same amount to keep it visually static.
    // After 600px, we lock the translation, allowing natural scrolling to resume.
    const y = useTransform(scrollY, [0, 600], [0, 600], { clamp: true })

    return (
        <motion.div style={{ y }} className="relative z-0 w-full bg-background">
            {children}
        </motion.div>
    )
}
