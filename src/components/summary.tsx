import { Container } from "@/components/container"

export function Summary() {
    return (
        <section className="py-20 border-b border-border/40">
            <Container>
                <h3 className="sr-only">Summary</h3>
                <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90 text-center max-w-2xl mx-auto">
                    &quot;네트워크·클라우드 인프라를 안정적으로 운영하고, 자동화로 효율을 높이는 엔지니어&quot;
                </p>
            </Container>
        </section >
    )
}
