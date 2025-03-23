"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavigationTabs() {
  const pathname = usePathname()
  const currentTab = pathname === "/" ? "analytics" : "history"

  return (
    <Tabs defaultValue={currentTab} className="w-full sm:w-auto">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="analytics" asChild className="flex-1 sm:flex-none">
          <Link href="/">Analytics</Link>
        </TabsTrigger>
        <TabsTrigger value="history" asChild className="flex-1 sm:flex-none">
          <Link href="/history">History</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

