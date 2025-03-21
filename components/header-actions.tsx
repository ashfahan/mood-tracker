"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import SeedData from "./seed-data"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useMood } from "@/contexts/mood-context"

interface HeaderActionsProps {
  initialTab: "analytics" | "history"
}

export function HeaderActions({ initialTab }: HeaderActionsProps) {
  const { moodEntries, setMoodEntries, addOrUpdateEntry } = useMood()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSeedData = (seedEntries: MoodEntry[]) => {
    setMoodEntries(seedEntries)
  }

  const handleNewEntry = () => {
    setIsDialogOpen(true)
  }

  const handleSaveEntry = (entry: MoodEntry) => {
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
      <SeedData
        onSeedComplete={handleSeedData}
        buttonVariant="outline"
        buttonIcon={<Database className="h-4 w-4 mr-2" aria-hidden="true" />}
        buttonText="Generate Sample Data"
        className="text-xs sm:text-sm"
      />
      <Button onClick={handleNewEntry} className="gap-2 text-xs sm:text-sm">
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        <span>New Entry</span>
      </Button>
      <ThemeToggle />

      {/* Conditionally render the dialog only when it's open */}
      {isDialogOpen && (
        <NewEntryDialog
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveEntry}
          entries={moodEntries}
          selectedEntry={null}
        />
      )}
    </div>
  )
}

