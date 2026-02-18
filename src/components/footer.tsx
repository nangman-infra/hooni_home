import { Container } from "@/components/container"

export function Footer() {
    return (
        <footer className="py-12 border-t border-border/40">
            <Container>
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Hooni. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="https://github.com/heishooni" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                        <a href="https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
                        <a href="https://heishooni.tistory.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Blog</a>
                        <a href="mailto:heishooni@gmail.com" className="hover:text-foreground transition-colors">Email</a>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
