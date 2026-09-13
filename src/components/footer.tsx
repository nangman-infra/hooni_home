import { Container } from "@/components/container"

const links = [
    { label: "GitHub", href: "https://github.com/heishooni" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/%EC%A0%95%ED%9D%AC%ED%9B%88heishooni/" },
    { label: "Blog", href: "https://heishooni.tistory.com/" },
    { label: "Email", href: "mailto:heishooni@gmail.com" },
]

const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev"
const built = (process.env.NEXT_PUBLIC_BUILD_TIME ?? "").slice(0, 10)

export function Footer() {
    return (
        <Container>
            <footer className="flex flex-col gap-12 md:gap-16">
                <nav className="flex flex-col gap-2 md:gap-3" aria-label="Contact links">
                    {links.map((l) => (
                        <a key={l.label} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                            className="display self-start text-[clamp(2.2rem,6vw,5.4rem)] leading-none text-foreground transition-colors hover:text-(--signal) focus-visible:text-(--signal)">
                            {l.label}
                        </a>
                    ))}
                </nav>
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Hooni. All rights reserved.</p>
                    <p className="mono text-xs text-muted-foreground/80">build {sha}{built && `, ${built}`}. Built by Jenkins, pushed to Harbor, pulled by Watchtower onto the website host in Daejeon.</p>
                </div>
            </footer>
        </Container>
    )
}
