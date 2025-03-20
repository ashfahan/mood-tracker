import MoodTracker from "@/components/mood-tracker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { HeaderActions } from "@/components/header-actions"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Tabs defaultValue="history" className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="analytics" asChild>
                  <Link href="/analytics">Analytics</Link>
                </TabsTrigger>
                <TabsTrigger value="history" asChild>
                  <Link href="/history">History</Link>
                </TabsTrigger>
              </TabsList>
              <HeaderActions initialTab="history" />
            </div>
          </Tabs>
        </div>
      </div>
      <MoodTracker initialTab="history" />
    </div>
  )
}

