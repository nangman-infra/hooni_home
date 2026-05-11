import { Container } from "@/components/container"

export function Summary() {
    return (
        <section className="py-20 border-b border-border/40">
            <Container className="max-w-5xl">
                <h3 className="sr-only">Summary</h3>
                <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-foreground/90 text-center max-w-none mx-auto lg:whitespace-nowrap">
                    <span className="block sm:inline">&quot;네트워크·클라우드 아키텍처를 견고하게</span>
                    <span className="block sm:inline"> 설계·구축하고 안정적으로 운영하는 엔지니어&quot;</span>
                </p>
            </Container>
        </section >
    )
}
