import { Container } from "@/components/container"
import { SectionHead } from "@/components/section-head"

const skillCategories = [
    {
        name: "Design",
        items: ["Network Architecture", "Cloud Architecture", "Hybrid Connectivity", "CIDR Planning"]
    },
    {
        name: "Operations",
        items: ["Infrastructure Reliability", "Traffic Routing", "VPN Operations", "Automation"]
    },
    {
        name: "Tools",
        items: ["AWS", "OPNsense", "WireGuard", "Docker"]
    }
]

export function TechStack() {
    return (
        <Container>
            <SectionHead title="Core Focus" />
            <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
                {skillCategories.map((cat) => (
                    <div key={cat.name} className="col">
                        <h3 className="mb-6 text-base text-muted-foreground">{cat.name}</h3>
                        <ul className="flex flex-col gap-3">
                            {cat.items.map((item) => (
                                <li key={item} className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Container>
    )
}
