import { Container } from "@/components/container"

const historyItems = [
    {
        date: "2024.02 ~ ",
        content: "한밭대학교 모바일융합공학과 재학"
    },
    {
        date: "2025.01 ~ ",
        content: "한밭대학교 WiSoft LAB (무선통신 소프트웨어 연구실) 활동"
    },
    {
        date: "2025.03 ~ 2025.12",
        content: "한밭대학교 SW중심사업단 소중한봉사단 (초·중등 대상 코딩 교육) 팀장"
    },
    {
        date: "2025.03 ~ 2025.12",
        content: "멋쟁이 사자처럼 13기"
    },
    {
        date: "2025.09.26",
        content: "공공데이터 활용 공모전 대상 수상 (한국조폐공사 부문)"
    },
    {
        date: "2025.01 ~ 2025.12",
        content: "한밭대학교 모바일융합공학과 부학생회장"
    },
    {
        date: "2026.01 ~ 2026.12",
        content: "한밭대학교 모바일융합공학과 학생회장"
    }
]

export function History() {
    return (
        <section className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">History</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {historyItems.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-8 hover:bg-secondary/5 rounded-lg p-2 transition-colors">
                            <span className="text-muted-foreground font-mono text-sm sm:w-32 flex-shrink-0">{item.date}</span>
                            <span className="text-foreground/90 font-medium">{item.content}</span>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
