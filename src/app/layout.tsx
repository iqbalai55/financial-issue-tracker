import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css" // Global styles still apply everywhere

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Issue Tracker",
  description: "Issue management app",
}

// ⚠️ CRITICAL: This layout MUST be minimal - NO sidebar structure!
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children} {/* Children = route group layouts */}
      </body>
    </html>
  )
}