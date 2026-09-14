import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

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
        <Container>
            <SectionHead title="Certifications" />
            <ul className="mt-8 md:mt-12">
                {certs.map((cert) => (
                    <li key={cert.id} className="grid gap-1 border-t-[length:0.667px] border-foreground/10 py-6 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8 md:py-8">
                        <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">{cert.name}</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{cert.issuer}</p>
                    </li>
                ))}
            </ul>
        </Container>
    )
}
