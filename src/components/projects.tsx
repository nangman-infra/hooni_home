import Link from "next/link"
import Image from "next/image"
import type { ComponentType } from "react"
import { Globe } from "lucide-react"
import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"
import { HybridScene } from "@/components/hybrid-scene"
import { LabScene } from "@/components/lab-scene"
import { StreamScene } from "@/components/stream-scene"
import { GitHubBrandIcon, BlogIcon } from "@/components/icons"

type Project = {
    id: string
    title: string
    description: string
    summary: string
    decisions: string[]
    stack: string[]
    links: { repo?: string; blog?: string; live?: string }
    image?: { src: string; alt: string; width: number; height: number }
}

const projects: Project[] = [
    {
        id: "nangman-hybrid-network",
        title: "Nangman Hybrid Network",
        description: "Hybrid Cloud Network Architecture",
        summary: "대전–서울 간 CIDR 대역 중복 문제를 WireGuard Overlay로 해소하고, 서울 OPNsense 단일 인바운드와 도메인 기반 Reverse Proxy 라우팅을 결합해 멀티사이트(대전/서울/AWS) 트래픽 경로를 중앙화한 하이브리드 네트워크 아키텍처 설계",
        decisions: [
            "석촌 192.168.10.0/24와 대전 192.168.10.0/23이 겹쳐 LAN 간 라우팅으로는 목적지를 구분할 수 없어, 대전은 172.16.0.0/23 WireGuard 오버레이 주소로 지정",
            "외부 웹 요청은 석촌 OPNsense 한 곳으로 받고 Nginx Proxy Manager가 도메인으로 분기. 경로는 OPNsense, 웹 서비스 분기는 NPM으로 책임을 나눔",
            "AWS는 고양과 석촌 두 CGW에서 터널 2개씩 연결해 단일 VPN 경로 장애에 대비",
        ],
        stack: ["OPNsense", "WireGuard", "IPsec VPN", "Nginx Proxy Manager", "AWS(VPC)"],
        links: { repo: "https://github.com/heishooni/Nangman-Infra-Network" },
    },
    {
        id: "kreonet-seminar",
        title: "KREONET 실무자협의회 워킹그룹 세미나 발표",
        description: "Invited talk, KISTI KREONET, OpenOps & OSAIG joint seminar",
        summary: "낭만 인프라의 하이브리드 네트워크를 본 KISTI 과학기술연구망센터(KREONET)의 초청으로, 2026년 7월 24일 실무자협의회 오픈소스 워킹그룹 합동 세미나에서 팀 발표 '낭만인프라 구축부터 운영까지 좌충우돌 여행기' 중 Introduce와 Network 파트를 맡아 설계 과정과 시행착오를 발표",
        decisions: [
            "발표 순서는 Introduce, Network, Server, Monitoring, CI/CD, Q&A. 그중 소개와 네트워크를 맡음",
            "완성된 그림보다 시행착오를 앞세워, 왜 그 구조가 됐는지가 남도록 구성",
        ],
        stack: ["KREONET", "KISTI", "Hybrid Network", "Talk"],
        links: { blog: "https://heishooni.tistory.com/44" },
        image: { src: "/projects/kreonet-seminar.jpg", alt: "발표 표지: 낭만인프라 구축부터 운영까지 좌충우돌 여행기, KREONET 실무자협의회 오픈소스 워킹그룹, 2026.07.24", width: 1600, height: 770 },
    },
    {
        id: "nangman-road",
        title: "Nangman Road",
        description: "Install-free network route visualizer",
        summary: "도메인이나 IP를 넣으면 사용자와 가까운 Globalping 프로브가 대신 traceroute와 MTR을 측정하고, 그 경로를 3D 지구본, 2D 지도, 터미널 뷰로 보여주는 브라우저 앱. 해저케이블 627개, 육양국 1,923곳, 도시 3,089곳의 공개 데이터 위에 경로를 그리고, 측정된 홉과 추정한 케이블 구간을 구분해 표시",
        decisions: [
            "브라우저는 traceroute를 할 수 없으므로 가까운 프로브가 대신 재고, 그 사실을 화면에 그대로 적음",
            "라우터는 어느 케이블을 탔는지 알려주지 않으므로 해저 구간은 가장 가능성 높은 케이블을 고르되 추정이라고 표시하고 근거를 hover로 공개",
            "데이터는 전부 공개 출처: TeleGeography, Natural Earth, Globalping, ip-api, ipwho.is, IP2Location.io, RIPE IPmap",
        ],
        stack: ["React", "TypeScript", "three.js", "Leaflet", "Express", "Globalping"],
        links: { live: "https://road.nangman.cloud/", repo: "https://github.com/nangman-infra/NangmanRoad", blog: "https://heishooni.tistory.com/45" },
        image: { src: "/projects/nangman-road.jpg", alt: "서울에서 독일 gmx.net까지 13홉, 24,223 km 경로를 야간 지구본 위에 그린 Nangman Road 화면", width: 1600, height: 1059 },
    },
    {
        id: "personal-workspace-lab",
        title: "개인 워크스페이스 Proxmox · OPNsense · Cisco CML 랩 구축",
        description: "Network Virtualization & Infrastructure Lab",
        summary: "개인 서버 환경에 Proxmox, OPNsense, Cisco CML을 구성해 방화벽·라우팅·VPN·가상 네트워크 실습이 가능한 인프라 랩 환경 구축, 낭만 인프라 네트워크와의 IPsec 연동, Teleport 기반 Cisco CML 서비스 등록",
        decisions: [
            "실습망은 Proxmox 위 VM으로 격리하고, OPNsense가 사이트 경계와 IPsec 종단을 맡음",
            "CML은 포트를 열지 않고 Teleport 앱으로 등록해 인증을 거친 뒤에만 닿게 함",
            "CML이 내부 IP로 리다이렉트해 Teleport 경유 접속이 끊기던 문제는 앱 설정의 public_addr와 rewrite.redirect로 해결",
        ],
        stack: ["Proxmox", "OPNsense", "Cisco CML", "IPsec", "Teleport", "Linux"],
        links: { blog: "https://heishooni.tistory.com/category/Infra" },
    },
    {
        id: "ai-tcp-udp-streaming",
        title: "AI 기반 TCP/UDP 영상 스트리밍 프로토콜 비교 프로젝트",
        description: "Network Protocol Analysis with AI",
        summary: "AI 기반 바이브 코딩 방식으로 TCP/UDP 영상 스트리밍 구조를 직접 구현하고, 전송 안정성·지연 시간·패킷 손실·실시간성 관점에서 각 프로토콜의 특성과 트레이드오프를 비교 분석한 네트워크 실습 프로젝트",
        decisions: [
            "sender, emulator, receiver로 나눠 loss, delay, jitter, reorder를 변수로 통제하고 같은 영상을 두 프로토콜로 보냄",
            "TCP는 손실 시 멈춤과 지연으로, UDP는 프레임 스킵과 화면 튐으로 나타남을 프레임 단위로 확인",
            "품질은 프로토콜만이 아니라 재생 버퍼, timeout, drop 정책 같은 애플리케이션 설계에 크게 좌우된다는 결론",
        ],
        stack: ["TCP", "UDP", "Vibe Coding", "Network Protocol Analysis"],
        links: { blog: "https://heishooni.tistory.com/6" },
    },
]
const visuals: Record<string, ComponentType> = {
    "nangman-hybrid-network": HybridScene,
    "personal-workspace-lab": LabScene,
    "ai-tcp-udp-streaming": StreamScene,
}
const hasHangul = (s: string) => /[가-힣]/.test(s)
// keep-all treats "A·B·C" as one word; allow a break after each middle dot without changing the text.
const Wrap = ({ text }: { text: string }) => text.split("·").map((part, i, all) => (
    <span key={i}>{part}{i < all.length - 1 && <>·<wbr /></>}</span>
))

export const projectCount = projects.length

function Visual({ p }: Readonly<{ p: Project }>) {
    const Scene = visuals[p.id]
    if (Scene) return <Scene />
    if (p.image) {
        return (
            <div className="shot">
                <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(min-width: 768px) 58vw, 100vw" unoptimized />
            </div>
        )
    }
    return null
}

// One project per full-screen scene.
export function ProjectScene({ index }: Readonly<{ index: number }>) {
    const p = projects[index]
    return (
        <Container>
            {index === 0 && <SectionHead title="Projects" />}
            <div className={`grid gap-8 min-[1100px]:grid-cols-12 min-[1100px]:gap-12 min-[1100px]:items-center ${index === 0 ? "mt-8 md:mt-10" : ""}`}>
                <div className="min-[1100px]:col-span-5">
                    <span className="label block mb-5">Project {index + 1} of {projects.length}</span>
                    <h3 className={`${hasHangul(p.title) ? "title-ko text-3xl md:text-[2.4rem]" : "display text-4xl md:text-[3rem]"} leading-[1.1] text-foreground`}>
                        {p.title}
                    </h3>
                    <p className="mt-3 text-sm md:text-base text-muted-foreground">{p.description}</p>
                    <p className="mt-6 max-w-xl text-[0.9375rem] md:text-base text-foreground/85 leading-relaxed"><Wrap text={p.summary} /></p>
                    <p className="label mt-6 mb-2">Decisions</p>
                    <ul className="max-w-xl list-disc list-outside ml-4 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
                        {p.decisions.map((d) => (
                            <li key={d}><Wrap text={d} /></li>
                        ))}
                    </ul>
                    <div className="mt-7 flex items-center gap-3">
                        {p.links.live && (
                            <Link href={p.links.live} target="_blank" rel="noopener noreferrer" className="icon-btn lg" aria-label="Live site"><Globe aria-hidden="true" /></Link>
                        )}
                        {p.links.repo && (
                            <Link href={p.links.repo} target="_blank" rel="noopener noreferrer" className="icon-btn lg" aria-label="GitHub repository"><GitHubBrandIcon /></Link>
                        )}
                        {p.links.blog && (
                            <Link href={p.links.blog} target="_blank" rel="noopener noreferrer" className="icon-btn lg" aria-label="Blog post"><BlogIcon /></Link>
                        )}
                    </div>
                    <div className="mt-7 flex flex-wrap items-center gap-2">
                        {p.stack.map((item) => (
                            <span key={item} className="chip">{item}</span>
                        ))}
                    </div>
                </div>
                <div className="min-[1100px]:col-span-7 -order-1 min-[1100px]:order-none max-md:-mx-[7vw]">
                    <Visual p={p} />
                </div>
            </div>
        </Container>
    )
}
