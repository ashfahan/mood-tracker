"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavigationTabs() {
  const pathname = usePathname()
  const defaultValue = pathname === "/history" ? "/history" : "/"

  return (
    <Tabs defaultValue={defaultValue} className="w-full sm:w-auto">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="/" asChild className="flex-1 sm:flex-none">
          <Link href="/">Analytics</Link>
        </TabsTrigger>
        <TabsTrigger value="/history" asChild className="flex-1 sm:flex-none">
          <Link href="/history">History</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

