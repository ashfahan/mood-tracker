import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MoodProvider } from "@/contexts/mood-context"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mood Tracker",
  description: "Track and analyze your daily moods",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <MoodProvider>
            <main className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Mood Tracker</h1>
              {children}
            </main>
            <Toaster />
          </MoodProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'