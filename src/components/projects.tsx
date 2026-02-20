import Link from "next/link"
import { ArrowUpRight, Github } from "lucide-react"
import { Container } from "@/components/container"

const projects = [
    {
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
                    {projects.map((p, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                                    {p.title} <span className="block md:inline font-normal text-muted-foreground text-sm md:text-base mt-1 md:mt-0 md:ml-2">— {p.description}</span>
                                </h3>
                                <div className="flex gap-3 text-sm">
                                    {p.links.repo && (
                                        <Link href={p.links.repo} target="_blank" className="hover:text-foreground transition-colors text-muted-foreground">
                                            <Github className="h-5 w-5" />
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
