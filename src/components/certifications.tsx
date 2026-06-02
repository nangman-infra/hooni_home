import { Container } from "@/components/container"

const certs = [
    {
        id: "sqld",
        name: "SQLD",
        issuer: "SQL Developer",
        label: "Database"
    },
    {
        id: "adsp",
        name: "ADSP",
        issuer: "데이터분석 준전문가",
        label: "Data"
    },
    {
        id: "ncp-associate",
        name: "NAVER Cloud Platform Certified Associate",
        issuer: "네이버 클라우드 플랫폼",
        label: "Cloud"
    }
]

export function Certifications() {
    return (
        <section id="certifications" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Certifications</h2>
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {certs.map((cert) => (
                        <li key={cert.id} className="rounded-2xl border border-border/60 bg-secondary/5 p-5 transition-colors duration-300 hover:bg-secondary/10">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold leading-snug text-foreground">{cert.name}</h3>
                                </div>
                                <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    {cert.label}
                                </span>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">{cert.issuer}</p>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    )
}
