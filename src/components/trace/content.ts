/* Everything on the page, in one place, taken from the site that is already live. Nothing here is
   invented: the hosts, the addresses, the tunnels and the dates are the ones the network actually
   has. Only private ranges appear, which is what the live site already shows. */

export const ME = {
    name: "정희훈",
    latin: "JEONG HEE HOON",
    role: "Network & cloud infrastructure engineer",
    statement: "네트워크·클라우드 아키텍처를 견고하게 설계·구축하고 안정적으로 운영하는 엔지니어",
    signature: "I value loyalty and trust and I stand by them",
    email: "heishooni@gmail.com",
    links: [
        { label: "GitHub", href: "https://github.com/heishooni" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" },
        { label: "Blog", href: "https://heishooni.tistory.com/" },
        { label: "Email", href: "mailto:heishooni@gmail.com" },
    ],
}

/* How a request for this page actually reaches it: one inbound at Seokchon, split by domain, then
   over the overlay to the host in Daejeon. The cold open reads this out before anything else. */
export const PATH = [
    { hop: "01", site: "you", host: "your browser", addr: "", note: "request leaves" },
    { hop: "02", site: "seokchon", host: "OPNsense", addr: "192.168.10.1", note: "the only inbound" },
    { hop: "03", site: "seokchon", host: "nginx proxy manager", addr: "192.168.10.10", note: "split by domain" },
    { hop: "04", site: "wg0", host: "WireGuard overlay", addr: "172.16.0.0/23", note: "the two LANs overlap" },
    { hop: "05", site: "daejeon", host: "website host", addr: "192.168.11.134", note: "you are here" },
]

export const PHASES = ["Design", "Build", "Operate"]

export const HISTORY = [
    { date: "2024.02 ~", text: "한밭대학교 모바일융합공학과 재학" },
    { date: "2025.01 ~", text: "한밭대학교 WiSoft LAB (무선통신 소프트웨어 연구실) 활동" },
    { date: "2025.01 ~ 2025.12", text: "한밭대학교 모바일융합공학과 부학생회장" },
    { date: "2025.03 ~ 2025.12", text: "한밭대학교 SW중심사업단 소중한봉사단 (초·중등 대상 코딩 교육) 팀장" },
    { date: "2025.03 ~ 2025.12", text: "멋쟁이 사자처럼 13기" },
    { date: "2025.09.26", text: "공공데이터 활용 공모전 대상 수상 (한국조폐공사 부문)" },
    { date: "2025.12 ~", text: "낭만 인프라" },
    { date: "2026.01 ~ 2026.12", text: "한밭대학교 모바일융합공학과 학생회장" },
]

export const FOCUS = [
    { name: "Design", items: ["Network Architecture", "Cloud Architecture", "Hybrid Connectivity", "CIDR Planning"] },
    { name: "Operations", items: ["Infrastructure Reliability", "Traffic Routing", "VPN Operations", "Automation"] },
    { name: "Tools", items: ["AWS", "OPNsense", "WireGuard", "Docker"] },
]

export type Project = {
    id: string
    title: string
    ko: boolean
    kicker: string
    summary: string
    decisions: string[]
    stack: string[]
    links: { label: string; href: string }[]
    image?: { src: string; alt: string; width: number; height: number }
}

export const PROJECTS: Project[] = [
    {
        id: "nangman-hybrid-network",
        title: "Nangman Hybrid Network",
        ko: false,
        kicker: "Hybrid Cloud Network Architecture",
        summary: "대전–서울 간 CIDR 대역 중복 문제를 WireGuard Overlay로 해소하고, 서울 OPNsense 단일 인바운드와 도메인 기반 Reverse Proxy 라우팅을 결합해 멀티사이트(대전/서울/AWS) 트래픽 경로를 중앙화한 하이브리드 네트워크 아키텍처 설계",
        decisions: [
            "석촌 192.168.10.0/24와 대전 192.168.10.0/23이 겹쳐 LAN 간 라우팅으로는 목적지를 구분할 수 없어, 대전은 172.16.0.0/23 WireGuard 오버레이 주소로 지정",
            "외부 웹 요청은 석촌 OPNsense 한 곳으로 받고 Nginx Proxy Manager가 도메인으로 분기. 경로는 OPNsense, 웹 서비스 분기는 NPM으로 책임을 나눔",
            "AWS는 고양과 석촌 두 CGW에서 터널 2개씩 연결해 단일 VPN 경로 장애에 대비",
        ],
        stack: ["OPNsense", "WireGuard", "IPsec VPN", "Nginx Proxy Manager", "AWS(VPC)"],
        links: [{ label: "Repo", href: "https://github.com/heishooni/Nangman-Infra-Network" }],
    },
    {
        id: "kreonet-seminar",
        title: "KREONET 실무자협의회 워킹그룹 세미나 발표",
        ko: true,
        kicker: "Invited talk, KISTI KREONET, OpenOps & OSAIG joint seminar",
        summary: "낭만 인프라의 하이브리드 네트워크를 본 KISTI 과학기술연구망센터(KREONET)의 초청으로, 2026년 7월 24일 실무자협의회 오픈소스 워킹그룹 합동 세미나에서 팀 발표 '낭만인프라 구축부터 운영까지 좌충우돌 여행기' 중 Introduce와 Network 파트를 맡아 설계 과정과 시행착오를 발표",
        decisions: [
            "발표 순서는 Introduce, Network, Server, Monitoring, CI/CD, Q&A. 그중 소개와 네트워크를 맡음",
            "완성된 그림보다 시행착오를 앞세워, 왜 그 구조가 됐는지가 남도록 구성",
        ],
        stack: ["KREONET", "KISTI", "Hybrid Network", "Talk"],
        links: [{ label: "Blog", href: "https://heishooni.tistory.com/44" }],
        image: { src: "/projects/kreonet-seminar.jpg", alt: "발표 표지: 낭만인프라 구축부터 운영까지 좌충우돌 여행기, KREONET 실무자협의회 오픈소스 워킹그룹, 2026.07.24", width: 1600, height: 770 },
    },
    {
        id: "nangman-road",
        title: "Nangman Road",
        ko: false,
        kicker: "Install-free network route visualizer",
        summary: "도메인이나 IP를 넣으면 사용자와 가까운 Globalping 프로브가 대신 traceroute와 MTR을 측정하고, 그 경로를 3D 지구본, 2D 지도, 터미널 뷰로 보여주는 브라우저 앱. 해저케이블 627개, 육양국 1,923곳, 도시 3,089곳의 공개 데이터 위에 경로를 그리고, 측정된 홉과 추정한 케이블 구간을 구분해 표시",
        decisions: [
            "브라우저는 traceroute를 할 수 없으므로 가까운 프로브가 대신 재고, 그 사실을 화면에 그대로 적음",
            "라우터는 어느 케이블을 탔는지 알려주지 않으므로 해저 구간은 가장 가능성 높은 케이블을 고르되 추정이라고 표시하고 근거를 hover로 공개",
            "데이터는 전부 공개 출처: TeleGeography, Natural Earth, Globalping, ip-api, ipwho.is, IP2Location.io, RIPE IPmap",
        ],
        stack: ["React", "TypeScript", "three.js", "Leaflet", "Express", "Globalping"],
        links: [
            { label: "Live", href: "https://road.nangman.cloud/" },
            { label: "Repo", href: "https://github.com/nangman-infra/NangmanRoad" },
            { label: "Blog", href: "https://heishooni.tistory.com/45" },
        ],
        image: { src: "/projects/nangman-road.jpg", alt: "서울에서 독일 gmx.net까지 13홉, 24,223 km 경로를 야간 지구본 위에 그린 Nangman Road 화면", width: 1600, height: 1059 },
    },
    {
        id: "personal-workspace-lab",
        title: "개인 워크스페이스 Proxmox · OPNsense · Cisco CML 랩 구축",
        ko: true,
        kicker: "Network Virtualization & Infrastructure Lab",
        summary: "개인 서버 환경에 Proxmox, OPNsense, Cisco CML을 구성해 방화벽·라우팅·VPN·가상 네트워크 실습이 가능한 인프라 랩 환경 구축, 낭만 인프라 네트워크와의 IPsec 연동, Teleport 기반 Cisco CML 서비스 등록",
        decisions: [
            "실습망은 Proxmox 위 VM으로 격리하고, OPNsense가 사이트 경계와 IPsec 종단을 맡음",
            "CML은 포트를 열지 않고 Teleport 앱으로 등록해 인증을 거친 뒤에만 닿게 함",
            "CML이 내부 IP로 리다이렉트해 Teleport 경유 접속이 끊기던 문제는 앱 설정의 public_addr와 rewrite.redirect로 해결",
        ],
        stack: ["Proxmox", "OPNsense", "Cisco CML", "IPsec", "Teleport", "Linux"],
        links: [{ label: "Blog", href: "https://heishooni.tistory.com/category/Infra" }],
    },
    {
        id: "ai-tcp-udp-streaming",
        title: "AI 기반 TCP/UDP 영상 스트리밍 프로토콜 비교 프로젝트",
        ko: true,
        kicker: "Network Protocol Analysis with AI",
        summary: "AI 기반 바이브 코딩 방식으로 TCP/UDP 영상 스트리밍 구조를 직접 구현하고, 전송 안정성·지연 시간·패킷 손실·실시간성 관점에서 각 프로토콜의 특성과 트레이드오프를 비교 분석한 네트워크 실습 프로젝트",
        decisions: [
            "sender, emulator, receiver로 나눠 loss, delay, jitter, reorder를 변수로 통제하고 같은 영상을 두 프로토콜로 보냄",
            "TCP는 손실 시 멈춤과 지연으로, UDP는 프레임 스킵과 화면 튐으로 나타남을 프레임 단위로 확인",
            "품질은 프로토콜만이 아니라 재생 버퍼, timeout, drop 정책 같은 애플리케이션 설계에 크게 좌우된다는 결론",
        ],
        stack: ["TCP", "UDP", "Vibe Coding", "Network Protocol Analysis"],
        links: [{ label: "Blog", href: "https://heishooni.tistory.com/6" }],
    },
]

export const EXPERIENCE = [
    {
        title: "Nangman Infra Team",
        role: "Network Mentee",
        period: "2025.12 - Present",
        points: [
            "현직자 멘토와 함께 하이브리드 클라우드 네트워크 아키텍처 설계 과정 학습 및 참여",
            "엔터프라이즈급 인프라 보안 및 네트워크 구성 요소(VPC, Subnet, VPN 등) 스터디",
            "실무 관점의 인프라 엔지니어링 표준 및 협업 방식 습득",
        ],
    },
    {
        title: "멋쟁이 사자처럼 13기",
        role: "Backend Developer",
        period: "2025.03 - 2025.12",
        points: [
            "백엔드 개발 흐름(요구사항 정리 → 설계 → 구현 → 테스트/배포)을 팀 프로젝트로 경험하며 실무 방식 학습",
            "기능 구현에만 집중하기보다, 이후 기능이 늘어날 때를 대비한 구조(역할 분리, 공통 로직 정리, 확장 가능한 설계) 고민 및 적용 연습",
            "기획·프론트엔드와의 협업 과정에서 API/데이터 흐름을 맞추고, 이슈를 정리해 해결하는 커뮤니케이션 경험",
        ],
    },
    {
        title: "WiSoft Lab",
        sub: "(무선통신 소프트웨어 연구실)",
        role: "Undergraduate Researcher",
        period: "2025.01 - Present",
        points: [
            "Java, JavaScript, OS, Network 등 CS 전반 주제로 세미나/스터디에 참여하며 핵심 개념 학습",
            "세미나 자료와 기술 문서를 읽고 요약·정리하며, 내용을 말로 설명할 수 있는 수준까지 이해도 보완",
            "동료 학부생들과 기술 서적/자료 기반으로 학습 내용을 공유하고, 최신 흐름을 따라가며 기본기 점검 및 정리 습관 형성",
        ],
    },
]

export const AWARD = {
    grade: "대상 수상",
    name: "공공데이터 활용 공모전 (한국조폐공사)",
    issuer: "한국조폐공사 (KOMSCO)",
    date: "2025.09",
}

export const EDUCATION = {
    school: "Hanbat National University",
    major: "Mobile Convergence Engineering",
    minor: "Minor in Computer Science Engineering",
    status: "Bachelor's Degree (Expected 2028.02)",
    grade: "GPA 3.7 / 4.5",
    start: "2024.02",
    end: "2028.02",
}

export const CERTS = [
    { name: "NCP Certified Associate", issuer: "NAVER Cloud Platform" },
    { name: "SQLD", issuer: "SQL Developer" },
    { name: "ADSP", issuer: "데이터분석 준전문가" },
]

export const BUILD = "Built by Jenkins, pushed to Harbor, pulled by Watchtower onto the website host in Daejeon."

/* The network itself — every site, every machine in it, every tunnel between them — exactly as the
   live site lists them. Both designs draw from this. Only private ranges appear. */
export type NetHost = { name: string; addr?: string }
export type NetSite = { id: string; label: string; cidr: string; hosts: NetHost[] }
export const NET: NetSite[] = [
    {
        id: "seokchon", label: "SEOKCHON", cidr: "192.168.10.0/24",
        hosts: [
            { name: "OPNsense", addr: "192.168.10.1" },
            { name: "phy-ops-nginx-reverse-proxy", addr: "192.168.10.10" },
            { name: "synology-nas", addr: "192.168.10.3" },
            { name: "phy-dev-odyssey-01", addr: "192.168.10.83" },
            { name: "vm-dev-odyssey", addr: "192.168.10.5" },
            { name: "phy-dev-pi5-app", addr: "192.168.10.62" },
        ],
    },
    {
        id: "daejeon", label: "DAEJEON", cidr: "192.168.10.0/23",
        hosts: [
            { name: "phy-ops-reverse-proxy-manager", addr: "wg0 172.16.0.11/23" },
            { name: "phy-dev-code-server", addr: "192.168.11.133" },
            { name: "website host", addr: "192.168.11.134" },
            { name: "vm-dev-infra-management", addr: "192.168.10.23" },
            { name: "vm-dev-*, six lab member VMs", addr: "192.168.10.0/23" },
        ],
    },
    {
        id: "aws", label: "AWS ap-northeast-2", cidr: "10.120.0.0/20",
        hosts: [
            { name: "VGW, four VPN tunnels" },
            { name: "ec2-ops-teleport-apn2a" },
            { name: "ec2-ops-teleport-access-apn2a" },
            { name: "ec2-ops-mgmt-apn2c" },
            { name: "Authentik, Huly" },
            { name: "ECS nangman-zabbix-cluster-dev" },
            { name: "ECS nangman-mattermost-cluster-dev" },
            { name: "ECS nangman-sonarqube-cluster-dev" },
            { name: "ECS ecs-nangman-dev-jenkins-apn2" },
            { name: "Route 53, nangman.cloud" },
        ],
    },
    {
        id: "yongdu", label: "YONGDU", cidr: "192.168.20.0/24",
        hosts: [
            { name: "OPNsense", addr: "192.168.20.1" },
            { name: "Proxmox VE" },
            { name: "CML", addr: "192.168.20.3" },
            { name: "CML proxy", addr: "192.168.20.188" },
        ],
    },
    {
        id: "goyang", label: "GOYANG", cidr: "192.168.1.0/24",
        hosts: [
            { name: "OPNsense, CGW", addr: "192.168.1.1" },
            { name: "Proxmox VE" },
        ],
    },
]
/* kind: 0 IPsec, 1 AWS site-to-site VPN (two tunnels per pair), 2 the WireGuard overlay */
export const TUNNELS: { a: string; b: string; kind: 0 | 1 | 2; label: string }[] = [
    { a: "seokchon", b: "daejeon", kind: 2, label: "WireGuard 172.16.0.0/23" },
    { a: "seokchon", b: "aws", kind: 1, label: "AWS VPN, 2 tunnels" },
    { a: "goyang", b: "aws", kind: 1, label: "AWS VPN, 2 tunnels" },
    { a: "yongdu", b: "seokchon", kind: 0, label: "IPsec" },
    { a: "yongdu", b: "goyang", kind: 0, label: "IPsec" },
]
