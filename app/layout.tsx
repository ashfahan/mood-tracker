import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mood Tracker",
  description: "Track and analyze your daily moods",
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
          <main className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Mood Tracker</h1>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'