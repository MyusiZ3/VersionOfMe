import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Version of Me — Your life, versioned.",
  description: "A premium, emotional, and reflective personal archive. Log your daily life commits, track your character metrics, map your relationships, and visualize your evolution through a cinematic timeline.",
  keywords: ["personal archiving", "life logging", "journaling", "self improvement", "timeline archive", "emotional journal"],
  openGraph: {
    title: "Version of Me — Your life, versioned.",
    description: "A premium, emotional, and reflective personal archive. Log your daily life commits, track your character metrics, map your relationships, and visualize your evolution through a cinematic timeline.",
    type: "website",
    locale: "id_ID",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-deep-archive text-text-primary font-sans selection:bg-elevated-surface selection:text-growth">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
