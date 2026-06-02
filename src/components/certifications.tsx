import { Container } from "@/components/container"

const certs = [
    {
        id: "ncp-associate",
        name: "NCP Certified Associate",
        issuer: "NAVER Cloud Platform"
    },
    {
        id: "sqld",
        name: "SQLD",
        issuer: "SQL Developer"
    },
    {
        id: "adsp",
        name: "ADSP",
        issuer: "데이터분석 준전문가"
    }
]

export function Certifications() {
    return (
        <section id="certifications" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Certifications</h2>
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                    {certs.map((cert) => (
                        <li key={cert.id} className="rounded-2xl border border-border/60 bg-secondary/5 px-6 py-7 transition-colors duration-300 hover:bg-secondary/10">
                            <div className="flex min-h-[124px] flex-col justify-between">
                                <h3 className="text-xl font-semibold leading-snug text-foreground text-balance">
                                    {cert.name}
                                </h3>
                                <p className="mt-6 text-base text-muted-foreground leading-relaxed">
                                    {cert.issuer}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    )
}
