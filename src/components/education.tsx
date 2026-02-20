import { Container } from "@/components/container"

const education = [
    {
        school: "Hanbat National University",
        major: "Mobile Convergence Engineering",
        minor: "Minor in Computer Science Engineering",
        status: "Bachelor's Degree (Expected 2028.02)",
        grade: "GPA 3.7 / 4.5"
    }
]

export function Education() {
    return (
        <section id="education" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Education</h2>
                <div className="space-y-6">
                    {education.map((edu, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{edu.school}</h3>
                                <p className="text-foreground/80">{edu.major}</p>
                                <p className="text-sm text-muted-foreground">{edu.minor}</p>
                            </div>
                            <div className="text-right sm:text-left">
                                <p className="text-foreground font-medium">{edu.status}</p>
                                <p className="text-sm text-muted-foreground/80">{edu.grade}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
