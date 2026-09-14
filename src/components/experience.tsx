import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

const experience = [
    {
        id: "nangman-infra-team",
        title: "Nangman Infra Team",
        role: "Network Mentee",
        period: "2025.12 - Present",
        achievements: [
            "현직자 멘토와 함께 하이브리드 클라우드 네트워크 아키텍처 설계 과정 학습 및 참여",
            "엔터프라이즈급 인프라 보안 및 네트워크 구성 요소(VPC, Subnet, VPN 등) 스터디",
            "실무 관점의 인프라 엔지니어링 표준 및 협업 방식 습득"
        ]
    },
    {
        id: "likelion-13th",
        title: "멋쟁이 사자처럼 13기",
        role: "Backend Developer",
        period: "2025.03 - 2025.12",
        achievements: [
            "백엔드 개발 흐름(요구사항 정리 → 설계 → 구현 → 테스트/배포)을 팀 프로젝트로 경험하며 실무 방식 학습",
            "기능 구현에만 집중하기보다, 이후 기능이 늘어날 때를 대비한 구조(역할 분리, 공통 로직 정리, 확장 가능한 설계) 고민 및 적용 연습",
            "기획·프론트엔드와의 협업 과정에서 API/데이터 흐름을 맞추고, 이슈를 정리해 해결하는 커뮤니케이션 경험"
        ]
    },
    {
        id: "wisoft-lab",
        title: "WiSoft Lab",
        subtitle: "(무선통신 소프트웨어 연구실)",
        role: "Undergraduate Researcher",
        period: "2025.01 - Present",
        achievements: [
            "Java, JavaScript, OS, Network 등 CS 전반 주제로 세미나/스터디에 참여하며 핵심 개념 학습",
            "세미나 자료와 기술 문서를 읽고 요약·정리하며, 내용을 말로 설명할 수 있는 수준까지 이해도 보완",
            "동료 학부생들과 기술 서적/자료 기반으로 학습 내용을 공유하고, 최신 흐름을 따라가며 기본기 점검 및 정리 습관 형성"
        ]
    }
]

// A ledger: period in the margin, the organisation and what was done beside it.
export function Experience() {
    return (
        <Container>
            <SectionHead title="Experience" />
            <div className="mt-8 md:mt-12">
                {experience.map((exp) => (
                    <div key={exp.id} className="grid gap-2 border-t-[length:0.667px] border-foreground/10 py-6 md:grid-cols-[11rem_1fr] md:gap-10 md:py-8">
                        <span className="mono text-xs text-muted-foreground md:pt-2.5">{exp.period}</span>
                        <div>
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{exp.title}</h3>
                                {exp.subtitle && <span className="text-sm text-muted-foreground">{exp.subtitle}</span>}
                            </div>
                            <p className="mt-1 text-sm md:text-base text-muted-foreground">{exp.role}</p>
                            <ul className="mt-4 max-w-2xl list-disc list-outside ml-4 space-y-1.5 text-[0.9375rem] leading-relaxed text-foreground/85">
                                {exp.achievements.map((ach) => (
                                    <li key={ach}>{ach}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    )
}
