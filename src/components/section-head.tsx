import type { ReactNode } from "react"

export function SectionHead({ title }: Readonly<{ title: ReactNode }>) {
    return <h2 className="sec-title">{title}</h2>
}
