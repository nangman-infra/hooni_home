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
     (none)           the tree — words beside one figure of grains per section (morph; what is deployed)
     DESIGN=particle  the tree the camera circles — kept for reference
     DESIGN=ascii     the posters — kept for reference
     DESIGN=pixel     the terminal — the earlier site */
export default function Home() {
    const d = process.env.DESIGN
    return d === "pixel" ? <PixelPage /> : d === "ascii" ? <AsciiPage /> : d === "particle" ? <ParticlePage /> : <MorphPage />
}
