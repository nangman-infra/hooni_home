import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR, Instrument_Serif, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Korean falls to the system face on a Mac; Noto Sans KR stands behind it for every other machine
const notoKr = Noto_Sans_KR({ variable: "--font-kr", subsets: ["latin"], weight: ["300", "400", "500", "700"] });
// The poster faces: a high-contrast serif for the one line each section says, and a Korean serif
// to stand beside it. Named after the faces, not --font-serif, which Tailwind already owns.
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const notoSerifKr = Noto_Serif_KR({ variable: "--font-notoserifkr", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "정희훈",
  description: "정희훈의 홈페이지",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning data-hop="0">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoKr.variable} ${instrument.variable} ${notoSerifKr.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
