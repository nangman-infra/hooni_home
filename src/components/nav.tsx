"use client"

import Link from "next/link"
import { Container } from "@/components/container"

export function Nav() {
    return (
        <header className="fixed top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-border/20 supports-[backdrop-filter]:bg-background/20">
            <Container>
                <div className="flex h-16 items-center justify-center">
                    <Link href="https://nangman.cloud/" target="_blank" className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors">
                        Nangman Infra
                    </Link>
                </div>
            </Container>
        </header>
    )
}
