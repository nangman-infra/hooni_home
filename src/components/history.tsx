import type { CSSProperties } from "react"
import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

const historyItems = [
    {
        id: "hanbat-enrollment",
        date: "2024.02 ~ ",
        content: "한밭대학교 모바일융합공학과 재학"
    },
    {
        id: "wisoft-lab",
        date: "2025.01 ~ ",
        content: "한밭대학교 WiSoft LAB (무선통신 소프트웨어 연구실) 활동"
    },
    {
        id: "sw-service-team-lead",
        date: "2025.03 ~ 2025.12",
        content: "한밭대학교 SW중심사업단 소중한봉사단 (초·중등 대상 코딩 교육) 팀장"
    },
    {
        id: "likelion-13th",
        date: "2025.03 ~ 2025.12",
        content: "멋쟁이 사자처럼 13기"
    },
    {
        id: "komsco-award",
        date: "2025.09.26",
        content: "공공데이터 활용 공모전 대상 수상 (한국조폐공사 부문)"
    },
    {
        id: "nangman-infra",
        date: "2025.12 ~",
        content: "낭만 인프라"
    },
    {
        id: "vice-president",
        date: "2025.01 ~ 2025.12",
        content: "한밭대학교 모바일융합공학과 부학생회장"
    },
    {
        id: "president",
        date: "2026.01 ~ 2026.12",
        content: "한밭대학교 모바일융합공학과 학생회장"
    }
]

// The line draws down and each entry lights as it is reached.
export function History() {
    return (
        <Container>
            <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16 lg:items-center">
                {/* the years are what the list is measured against, so only they sit in the row's
                    middle — the heading rides above them and out of the centring. */}
                <div className="relative">
                    <div className="mb-8 lg:absolute lg:bottom-full lg:left-0 lg:mb-10"><SectionHead title="History" /></div>
                    <p className="big-year"><span>2024</span><em aria-hidden="true">&rarr;</em><span>2026</span></p>
                </div>
                <div className="tl ml-6">
                    <span className="tl-line" aria-hidden="true" />
                    {historyItems.map((item, i) => (
                        <div key={item.id} className="tl-item grid gap-0.5 sm:grid-cols-[8.5rem_1fr] sm:gap-6" style={{ "--i": i } as CSSProperties}>
                            <span className="tl-dot" aria-hidden="true" />
                            <span className="mono text-xs text-muted-foreground pt-0.5">{item.date}</span>
                            <span className="text-foreground/90 font-medium text-[0.9375rem] md:text-base">{item.content}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    )
}
