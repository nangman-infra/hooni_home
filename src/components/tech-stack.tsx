import { Container } from "@/components/container"

const skillCategories = [
    {
        name: "Domain",
        items: ["Network", "Cloud (AWS)", "Linux", "Java"]
    },
    {
        name: "Tools",
        items: ["Docker", "Git", "Spring"]
    },
    {
        name: "Languages",
        items: ["Java", "Bash"]
    }
]

export function TechStack() {
    return (
        <section id="skills" className="py-12 md:py-20 border-b border-border/40">
            <Container>
                <h2 className="mb-8 md:mb-12 text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Key Skills</h2>
                <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
                    {skillCategories.map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary/5 border border-border/50 hover:bg-secondary/10 transition-colors duration-300">
                            <h3 className="text-xs font-bold text-muted-foreground tracking-[0.2em] uppercase mb-6">{cat.name}</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {cat.items.map((item) => (
                                    <span key={item} className="px-4 py-2 rounded-lg bg-background border border-border/60 text-foreground/80 text-sm font-medium shadow-sm hover:text-foreground hover:border-primary/50 transition-colors cursor-default">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
