import MoodTracker from "@/components/mood-tracker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { HeaderActions } from "@/components/header-actions"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs defaultValue="history" className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="analytics" asChild className="flex-1 sm:flex-none">
              <Link href="/analytics">Analytics</Link>
            </TabsTrigger>
            <TabsTrigger value="history" asChild className="flex-1 sm:flex-none">
              <Link href="/history">History</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <HeaderActions initialTab="history" />
      </div>
      <MoodTracker initialTab="history" />
    </div>
  )
}

