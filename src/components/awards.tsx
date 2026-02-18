import { Container } from "@/components/container"

const awards = [
    {
        name: "공공데이터 활용 공모전 (한국조폐공사)",
        date: "2025.09",
        grade: "대상 수상",
        issuer: "한국조폐공사 (KOMSCO)"
    }
]

export function Awards() {
    return (
        <section id="awards" className="py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Awards</h2>
                <div className="max-w-3xl mx-auto space-y-6">
                    {awards.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                                <p className="text-muted-foreground">{item.issuer}</p>
                            </div>
                            <div className="text-right sm:text-left">
                                <p className="text-foreground font-medium">{item.grade}</p>
                                <p className="text-sm text-muted-foreground/80">{item.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
