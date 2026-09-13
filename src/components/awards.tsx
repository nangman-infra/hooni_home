import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

const awards = [
    {
        id: "komsco-public-data-award",
        name: "공공데이터 활용 공모전 (한국조폐공사)",
        date: "2025.09",
        grade: "대상 수상",
        issuer: "한국조폐공사 (KOMSCO)"
    }
]
// The grade is the whole point, so it is the biggest thing on the page.
export function Awards() {
    return (
        <Container>
            <SectionHead title="Awards" />
            {awards.map((item) => (
                <div key={item.id} className="mt-10 grid gap-6 md:mt-14 md:grid-cols-[7fr_5fr] md:items-end md:gap-12">
                    <p className="title-ko text-[clamp(3.4rem,9vw,8rem)] leading-[0.95] text-foreground">{item.grade}</p>
                    <div className="md:pb-3">
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground text-balance">{item.name}</h3>
                        <p className="mt-2 text-muted-foreground">{item.issuer}</p>
                        <p className="mono mt-3 text-xs text-muted-foreground/80">{item.date}</p>
                    </div>
                </div>
            ))}
        </Container>
    )
}
