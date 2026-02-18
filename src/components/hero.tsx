"use client"

import { Container } from "@/components/container"
import { BackgroundEffect } from "@/components/background-effect"
import Link from "next/link"
import { Github, Linkedin, ArrowDown } from "lucide-react"

// Custom wide icon for 'blog' text
function BlogIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <text x="50%" y="19" textAnchor="middle" fontSize="20" fontWeight="bold" stroke="none" fill="currentColor" letterSpacing="-1">blog</text>
        </svg>
    )
}

export function Hero() {
    // NO Motion hooks. Standard Static Render.
    // Removed useOneShotScroll, useScroll, useTransform, framer-motion.

    return (
        // Standard Relative Section
        // h-screen ensures it takes full viewport initially.
        <section className="relative h-screen w-full overflow-hidden bg-background">
            <div className="relative flex h-full w-full flex-col justify-center origin-center">

                {/* Interactive Background (Kept as it's subtle/ambient) */}
                <BackgroundEffect />

                <Container className="relative z-10">
                    <div className="flex flex-col items-center text-center space-y-3">
                        {/* 1. Name */}
                        {/* 1. Name */}
                        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-8xl text-foreground mb-5 select-none">
                            JEONG Hee Hoon
                        </h1>

                        {/* 2. Identity / Position */}
                        <h2 className="text-sm sm:text-lg md:text-2xl font-light text-muted-foreground tracking-[0.15em] md:tracking-[0.2em] uppercase opacity-90 pb-6 select-none whitespace-nowrap">
                            Network & Cloud Infrastructure Engineer
                        </h2>

                        <p className="text-base md:text-xl font-light text-muted-foreground/80 tracking-widest pb-12 select-none">
                            &quot;I value loyalty and trust and I stand by them&quot;
                        </p>

                        {/* 3. Contact & Links */}
                        <div className="flex items-center gap-6 text-muted-foreground">
                            <Link
                                href="mailto:heishooni@gmail.com"
                                className="text-sm md:text-base font-normal tracking-wider hover:text-foreground transition-colors hover:underline underline-offset-8 decoration-foreground/50"
                            >
                                heishooni@gmail.com
                            </Link>

                            <div className="h-3 w-px bg-border/40" />

                            <div className="grid grid-cols-3 gap-8 items-center place-items-center">
                                <Link href="https://github.com/heishooni" target="_blank" className="flex justify-center w-full hover:scale-110 hover:text-foreground transition-all duration-500 ease-out will-change-transform">
                                    <Github className="h-5 w-5" />
                                    <span className="sr-only">GitHub</span>
                                </Link>
                                <Link href="https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" target="_blank" className="flex justify-center w-full hover:scale-110 hover:text-foreground transition-all duration-500 ease-out will-change-transform">
                                    <Linkedin className="h-5 w-5" />
                                    <span className="sr-only">LinkedIn</span>
                                </Link>
                                <Link href="https://heishooni.tistory.com/" target="_blank" className="flex justify-center w-full hover:scale-110 hover:text-foreground transition-all duration-500 ease-out will-change-transform">
                                    <BlogIcon className="h-5 w-auto" />
                                    <span className="sr-only">Blog</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>

                {/* Vertical Scroll Indicator (Static) */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Scroll</span>
                        <ArrowDown className="h-4 w-4 animate-bounce text-muted-foreground/50" />
                    </div>
                </div>
            </div>
        </section>
    )
}
