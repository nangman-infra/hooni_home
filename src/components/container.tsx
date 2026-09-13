import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

// The content column. Its width lives in .wrap (sections.css): it grows with the screen, where the
// old max-w-6xl plus 7vw padding made it narrower the wider the screen got.
export function Container({ className, children, ...props }: Readonly<ContainerProps>) {
    return (
        <div className={cn("wrap", className)} {...props}>
            {children}
        </div>
    )
}
