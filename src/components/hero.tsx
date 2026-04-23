"use client"

import { Container } from "@/components/container"
import { BackgroundEffect } from "@/components/background-effect"
import Link from "next/link"
import { ArrowDown } from "lucide-react"

function GitHubBrandIcon({ className }: Readonly<{ className?: string }>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M12 2C6.48 2 2 6.58 2 12.22C2 16.73 4.87 20.55 8.84 21.9C9.34 21.99 9.52 21.68 9.52 21.42C9.52 21.19 9.51 20.43 9.5 19.42C6.73 20.04 6.14 18.2 6.14 18.2C5.68 16.99 5.03 16.66 5.03 16.66C4.12 16.02 5.1 16.03 5.1 16.03C6.11 16.1 6.65 17.09 6.65 17.09C7.55 18.68 9.02 18.22 9.59 17.95C9.68 17.29 9.94 16.84 10.23 16.58C8.02 16.32 5.7 15.45 5.7 11.55C5.7 10.44 6.09 9.53 6.73 8.81C6.62 8.55 6.28 7.49 6.83 6.06C6.83 6.06 7.67 5.79 9.49 7.06C10.29 6.83 11.15 6.72 12 6.72C12.85 6.72 13.71 6.83 14.51 7.06C16.33 5.79 17.17 6.06 17.17 6.06C17.72 7.49 17.38 8.55 17.27 8.81C17.91 9.53 18.3 10.44 18.3 11.55C18.3 15.46 15.98 16.31 13.76 16.57C14.13 16.9 14.46 17.55 14.46 18.56C14.46 20 14.45 21.12 14.45 21.42C14.45 21.68 14.63 22 15.14 21.9C19.11 20.55 22 16.73 22 12.22C22 6.58 17.52 2 12 2Z" />
        </svg>
    )
}

function LinkedInBrandIcon({ className }: Readonly<{ className?: string }>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3C4.17 3 3.5 3.72 3.5 4.67C3.5 5.6 4.15 6.33 5.2 6.33H5.22C6.33 6.33 7 5.6 7 4.67C6.98 3.72 6.33 3 5.25 3ZM20.5 13.14C20.5 9.74 18.69 8.17 16.28 8.17C14.33 8.17 13.46 9.24 12.97 9.99V8.5H9.59C9.64 9.49 9.59 19.5 9.59 19.5H12.97V13.36C12.97 13.03 12.99 12.7 13.09 12.47C13.34 11.82 13.91 11.14 14.88 11.14C16.15 11.14 16.66 12.11 16.66 13.53V19.5H20.03V13.14H20.5Z" />
        </svg>
    )
}

// Custom wide icon for 'blog' text
function BlogIcon({ className }: Readonly<{ className?: string }>) {
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
                            JEONG <br className="block md:hidden" /> Hee Hoon
                        </h1>

                        {/* 2. Identity / Position */}
                        <h2 className="text-sm sm:text-lg md:text-2xl font-light text-muted-foreground tracking-[0.15em] md:tracking-[0.2em] uppercase opacity-90 pb-6 select-none md:whitespace-nowrap text-center">
                            Network & Cloud Infrastructure <br className="block md:hidden" /> Engineer
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

                            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-8 items-center place-items-center w-full md:w-auto">
                                <Link href="https://github.com/heishooni" target="_blank" className="flex justify-center w-full hover:scale-110 hover:text-foreground transition-all duration-500 ease-out will-change-transform">
                                    <GitHubBrandIcon className="h-5 w-5" />
                                    <span className="sr-only">GitHub</span>
                                </Link>
                                <Link href="https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" target="_blank" className="flex justify-center w-full hover:scale-110 hover:text-foreground transition-all duration-500 ease-out will-change-transform">
                                    <LinkedInBrandIcon className="h-5 w-5" />
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
