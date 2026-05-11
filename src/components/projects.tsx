import Link from "next/link"
import { Container } from "@/components/container"

function GitHubBrandIcon({ className }: Readonly<{ className?: string }>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
            <path d="M12 2C6.48 2 2 6.58 2 12.22C2 16.73 4.87 20.55 8.84 21.9C9.34 21.99 9.52 21.68 9.52 21.42C9.52 21.19 9.51 20.43 9.5 19.42C6.73 20.04 6.14 18.2 6.14 18.2C5.68 16.99 5.03 16.66 5.03 16.66C4.12 16.02 5.1 16.03 5.1 16.03C6.11 16.1 6.65 17.09 6.65 17.09C7.55 18.68 9.02 18.22 9.59 17.95C9.68 17.29 9.94 16.84 10.23 16.58C8.02 16.32 5.7 15.45 5.7 11.55C5.7 10.44 6.09 9.53 6.73 8.81C6.62 8.55 6.28 7.49 6.83 6.06C6.83 6.06 7.67 5.79 9.49 7.06C10.29 6.83 11.15 6.72 12 6.72C12.85 6.72 13.71 6.83 14.51 7.06C16.33 5.79 17.17 6.06 17.17 6.06C17.72 7.49 17.38 8.55 17.27 8.81C17.91 9.53 18.3 10.44 18.3 11.55C18.3 15.46 15.98 16.31 13.76 16.57C14.13 16.9 14.46 17.55 14.46 18.56C14.46 20 14.45 21.12 14.45 21.42C14.45 21.68 14.63 22 15.14 21.9C19.11 20.55 22 16.73 22 12.22C22 6.58 17.52 2 12 2Z" />
        </svg>
    )
}

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

const projects = [
    {
        id: "nangman-hybrid-network",
        title: "Nangman Hybrid Network",
        description: "Hybrid Cloud Network Architecture",
        summary: "대전–서울 간 CIDR 대역 중복 문제를 WireGuard Overlay로 해소하고, 서울 OPNsense 단일 인바운드와 도메인 기반 Reverse Proxy 라우팅을 결합해 멀티사이트(대전/서울/AWS) 트래픽 경로를 중앙화한 하이브리드 네트워크 아키텍처 설계",
        stack: ["OPNsense", "WireGuard", "IPsec VPN", "Nginx Proxy Manager", "AWS(VPC)"],
        links: { repo: "https://github.com/heishooni/Nangman-Infra-Network" }
    },
    {
        id: "personal-workspace-lab",
        title: "개인 워크스페이스 Proxmox · OPNsense · Cisco CML 랩 구축",
        description: "Network Virtualization & Infrastructure Lab",
        summary: "개인 서버 환경에 Proxmox, OPNsense, Cisco CML을 구성해 방화벽·라우팅·VPN·가상 네트워크 실습이 가능한 인프라 랩 환경 구축, 낭만 인프라 네트워크와의 IPsec 연동, Teleport 기반 Cisco CML 서비스 등록",
        stack: ["Proxmox", "OPNsense", "Cisco CML", "IPsec", "Teleport", "Linux"],
        links: { blog: "https://heishooni.tistory.com/category/Infra" }
    },
    {
        id: "ai-tcp-udp-streaming",
        title: "AI 기반 TCP/UDP 영상 스트리밍 프로토콜 비교 프로젝트",
        description: "Network Protocol Analysis with AI",
        summary: "AI 기반 바이브 코딩 방식으로 TCP/UDP 영상 스트리밍 구조를 직접 구현하고, 전송 안정성·지연 시간·패킷 손실·실시간성 관점에서 각 프로토콜의 특성과 트레이드오프를 비교 분석한 네트워크 실습 프로젝트",
        stack: ["TCP", "UDP", "Vibe Coding", "Network Protocol Analysis"],
        links: { blog: "https://heishooni.tistory.com/6" }
    }
]

export function Projects() {
    return (
        <section id="projects" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Projects</h2>
                <div className="space-y-12">
                    {projects.map((p) => (
                        <div key={p.id} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                                    {p.title}
                                    <span className="mt-2 block text-sm md:text-base font-normal text-muted-foreground leading-relaxed">
                                        {p.description}
                                    </span>
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground md:shrink-0">
                                    {p.links.blog && (
                                        <Link href={p.links.blog} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                                            <BlogIcon className="h-5 w-auto" />
                                            <span className="sr-only">Blog</span>
                                        </Link>
                                    )}
                                    {p.links.repo && (
                                        <Link href={p.links.repo} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                                            <GitHubBrandIcon className="h-5 w-5" />
                                            <span className="sr-only">GitHub</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <p className="text-foreground/90 font-medium leading-relaxed">{p.summary}</p>

                            <div className="flex flex-wrap gap-2">
                                {p.stack.map((item) => (
                                    <span key={item} className="rounded-full border border-border/60 px-3 py-1.5 text-sm text-muted-foreground">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
