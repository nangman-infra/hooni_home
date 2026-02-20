import { Container } from "@/components/container"

const certs = [
    {
        name: "NAVER Cloud Platform Certified Associate",
        issuer: "NAVER Cloud",
        date: "2025.12"
    }
]

export function Certifications() {
    return (
        <section id="certifications" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Certifications</h2>
                <ul className="space-y-4">
                    {certs.map((cert, i) => (
                        <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span className="font-medium text-foreground">{cert.name}</span>
                            <span className="hidden sm:block text-muted-foreground/50">|</span>
                            <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                            <span className="text-sm text-muted-foreground font-mono ml-auto">{cert.date}</span>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    )
}
