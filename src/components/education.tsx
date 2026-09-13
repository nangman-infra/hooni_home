import type { CSSProperties } from "react"
import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

const education = [
    {
        id: "hanbat-mobile-convergence",
        school: "Hanbat National University",
        major: "Mobile Convergence Engineering",
        minor: "Minor in Computer Science Engineering",
        status: "Bachelor's Degree (Expected 2028.02)",
        grade: "GPA 3.7 / 4.5",
        start: "2024.02",
        end: "2028.02"
    }
]
// Month precision so server and client agree; the bar shows how far the degree has provisioned.
function progress(start: string, end: string) {
    const [sy, sm] = start.split(".").map(Number)
    const [ey, em] = end.split(".").map(Number)
    const now = new Date()
    const done = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm)
    return Math.min(1, Math.max(0, done / ((ey - sy) * 12 + (em - sm))))
}

export function Education() {
    return (
        <Container>
            <SectionHead title="Education" />
            {education.map((edu) => (
                <div key={edu.id} className="mt-14 md:mt-24">
                    <div className="grid gap-6 md:grid-cols-[7fr_5fr] md:items-center md:gap-12">
                        <h3 className="display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-none text-foreground">{edu.school}</h3>
                        <div>
                            <p className="text-lg md:text-xl text-foreground/85">{edu.major}</p>
                            <p className="mt-1 text-sm md:text-base text-muted-foreground">{edu.minor}</p>
                            <p className="mt-4 font-medium text-foreground">{edu.status}</p>
                            <p className="mono mt-2 text-xs text-muted-foreground/80">{edu.grade}</p>
                        </div>
                    </div>
                    <div className="mt-12 md:mt-16">
                        <div className="bar" aria-hidden="true">
                            <span className="bar-fill" style={{ "--p": `${Math.round(progress(edu.start, edu.end) * 100)}%` } as CSSProperties} />
                        </div>
                        <div className="mono mt-3 flex justify-between text-xs text-muted-foreground">
                            <span>{edu.start}</span>
                            <span>{edu.end}, expected</span>
                        </div>
                    </div>
                </div>
            ))}
        </Container>
    )
}
