import Link from "next/link"
import { Container } from "@/components/container"

function GitHubBrandIcon({ className }: Readonly<{ className?: string }>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M12 2C6.48 2 2 6.58 2 12.22C2 16.73 4.87 20.55 8.84 21.9C9.34 21.99 9.52 21.68 9.52 21.42C9.52 21.19 9.51 20.43 9.5 19.42C6.73 20.04 6.14 18.2 6.14 18.2C5.68 16.99 5.03 16.66 5.03 16.66C4.12 16.02 5.1 16.03 5.1 16.03C6.11 16.1 6.65 17.09 6.65 17.09C7.55 18.68 9.02 18.22 9.59 17.95C9.68 17.29 9.94 16.84 10.23 16.58C8.02 16.32 5.7 15.45 5.7 11.55C5.7 10.44 6.09 9.53 6.73 8.81C6.62 8.55 6.28 7.49 6.83 6.06C6.83 6.06 7.67 5.79 9.49 7.06C10.29 6.83 11.15 6.72 12 6.72C12.85 6.72 13.71 6.83 14.51 7.06C16.33 5.79 17.17 6.06 17.17 6.06C17.72 7.49 17.38 8.55 17.27 8.81C17.91 9.53 18.3 10.44 18.3 11.55C18.3 15.46 15.98 16.31 13.76 16.57C14.13 16.9 14.46 17.55 14.46 18.56C14.46 20 14.45 21.12 14.45 21.42C14.45 21.68 14.63 22 15.14 21.9C19.11 20.55 22 16.73 22 12.22C22 6.58 17.52 2 12 2Z" />
        </svg>
    )
}

const projects = [
    {
        id: "nangman-hybrid-network",
        title: "Nangman Hybrid Network",
        description: "Hybrid Cloud Network Architecture",
        role: "Network / Infrastructure Engineer",
        impact: "대전–서울 간 CIDR 대역 중복 문제를 WireGuard Overlay로 해결하고, 서울 OPNsense 단일 인바운드와 도메인 기반 Reverse Proxy 라우팅을 적용해 멀티사이트(대전/서울/AWS) 트래픽 경로를 중앙화",
        stack: "OPNsense, WireGuard, IPsec VPN, Nginx Proxy Manager, AWS(VPC)",
        links: { repo: "https://github.com/heishooni/Nangman-Infra-Network", demo: "" }
    }
]

export function Projects() {
    return (
        <section id="projects" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Projects</h2>
                <div className="space-y-12">
                    {projects.map((p) => (
                        <div key={p.id} className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                                    {p.title}
                                    <span className="block md:inline font-normal text-muted-foreground text-sm md:text-base mt-1 md:mt-0 md:ml-2">{" — "}{p.description}</span>
                                </h3>
                                <div className="flex gap-3 text-sm">
                                    {p.links.repo && (
                                        <Link href={p.links.repo} target="_blank" className="hover:text-foreground transition-colors text-muted-foreground">
                                            <GitHubBrandIcon className="h-5 w-5" />
                                            <span className="sr-only">GitHub</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm md:grid-cols-[120px_1fr]">
                                <span className="text-muted-foreground font-medium">Role</span>
                                <span className="text-foreground">{p.role}</span>

                                <span className="text-muted-foreground font-medium">Impact</span>
                                <span className="text-foreground font-medium">{p.impact}</span>

                                <span className="text-muted-foreground font-medium">Stack</span>
                                <span className="text-muted-foreground">{p.stack}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
