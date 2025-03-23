import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"
import { MoodProvider } from "@/contexts/mood-context"
import { Toaster } from "@/components/ui/sonner"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { NavigationTabs } from "@/components/navigation-tabs"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mood Tracker",
  description: "Track and analyze your daily moods",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <MoodProvider>
            <main className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
              <Header />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <NavigationTabs />
              </div>
              {children}
            </main>
            <Toaster />
          </MoodProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
