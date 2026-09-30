import type { Metadata } from "next"
import { ME } from "@/components/trace/content"
import { PixelPage } from "@/components/pixel/page"
import { ParticlePage } from "@/components/particle/page"
import { AsciiPage } from "@/components/ascii/page"
import { MorphPage } from "@/components/morph/page"

export const metadata: Metadata = {
    title: "정희훈",
    description: ME.statement,
}

/* One site, several looks, chosen when the server starts. All read the same content.ts.
     DESIGN=morph     the clean one — words on the left, one figure of grains per section     (port 3001)
     DESIGN=particle  the tree the camera circles — kept for reference
     DESIGN=ascii     the posters — kept for reference
     DESIGN=pixel     the terminal (the default) */
export default function Home() {
    const d = process.env.DESIGN
    return d === "morph" ? <MorphPage /> : d === "ascii" ? <AsciiPage /> : d === "particle" ? <ParticlePage /> : <PixelPage />
}
