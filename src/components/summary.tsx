import type { CSSProperties } from "react"
import { Container } from "@/components/container"

const line = "네트워크·클라우드 아키텍처를 견고하게 설계·구축하고 안정적으로 운영하는 엔지니어"
const words = line.split(" ")

// One statement, then the three verbs it contains (설계·구축·운영) light in order.
export function Summary() {
    return (
        <Container>
            <h3 className="sr-only">Summary</h3>
            <p className="quote">
                <span className="w q-open">&ldquo;</span>
                {words.map((w, i) => (
                    <span key={w}>
                        <span className="w">{w}</span>
                        {i < words.length - 1 ? " " : ""}
                    </span>
                ))}
                <span className="w">&rdquo;</span>
            </p>
            <div className="phase mt-10 md:mt-14" aria-hidden="true">
                <span style={{ "--d": "0.2s" } as CSSProperties}>Design</span>
                <span style={{ "--d": "1.6s" } as CSSProperties}>Build</span>
                <span style={{ "--d": "2.8s" } as CSSProperties}>Operate</span>
            </div>
        </Container>
    )
}
